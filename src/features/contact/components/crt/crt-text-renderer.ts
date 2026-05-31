export interface CRTMessage {
  role: "user" | "assistant";
  text: string;
}

export interface CRTTextState {
  messages: CRTMessage[];
  streamedText: string;
  isStreaming: boolean;
  inputText: string;
  inputFocused: boolean;
  /** Visible height in canvas pixels — shrinks when virtual keyboard covers the bottom. */
  visibleHeight?: number;
  suggestions?: string[];
  showBack?: boolean;
}

const BASE_FONT_SIZE = 38;
const LINE_HEIGHT = 1.4;
const BASE_PADDING = 48;
const CURSOR_BLINK_RATE = 530;
const USER_LABEL = "YOU> ";
const CLONE_LABEL = "BOT> ";
const INPUT_PROMPT = "> ";
const BACK_TEXT = "< BACK";
const BASE_BACK_PADDING_BOTTOM = 16;
const SCROLL_FRICTION = 0.92;
const SCROLL_SNAP_THRESHOLD = 0.5;

interface ThemeColors {
  bg: string;
  text: string;
  dim: string;
  prompt: string;
  back: string;
  backHover: string;
}

const DARK_THEME: ThemeColors = {
  bg: "#000000",
  text: "#ffffff",
  dim: "#999999",
  prompt: "#dddddd",
  back: "#888888",
  backHover: "#ffffff",
};

const LIGHT_THEME: ThemeColors = {
  bg: "#ffffff",
  text: "#171717",
  dim: "#737373",
  prompt: "#525252",
  back: "#737373",
  backHover: "#171717",
};

function getTheme(): ThemeColors {
  if (typeof window === "undefined") return DARK_THEME;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK_THEME : LIGHT_THEME;
}

export interface HitArea {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  url?: string;
}

interface TextSegment {
  text: string;
  url?: string;
}

interface RenderedLine {
  segments: TextSegment[];
  color: string;
}

const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "");
}

export class CRTTextRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cols: number = 80;
  private _hitAreas: HitArea[] = [];
  private _hoveredId: string | null = null;

  private _fontSize: number;
  private _padding: number;
  private _backPadBottom: number;

  private _scrollY: number = 0;
  private _scrollVelocity: number = 0;
  private _targetScrollY: number = 0;
  private _userScrolled: boolean = false;
  private _maxScrollY: number = 0;

  constructor(canvas: HTMLCanvasElement, scale = 1) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) throw new Error("Canvas 2D not supported");
    this.ctx = ctx;

    this._fontSize = Math.round(BASE_FONT_SIZE * scale);
    this._padding = Math.round(BASE_PADDING * scale);
    this._backPadBottom = Math.round(BASE_BACK_PADDING_BOTTOM * scale);
  }

  get hitAreas(): HitArea[] {
    return this._hitAreas;
  }

  set hoveredId(id: string | null) {
    this._hoveredId = id;
  }

  scroll(deltaPixels: number): void {
    this._scrollVelocity += deltaPixels;
    this._userScrolled = true;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.cols = Math.floor((width - this._padding * 2) / (this._fontSize * 0.6));
  }

  render(state: CRTTextState): void {
    const { ctx, canvas, _fontSize: fs, _padding: pad } = this;
    const now = performance.now();
    const theme = getTheme();
    this._hitAreas = [];

    const visibleH = state.visibleHeight ?? canvas.height;

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `bold ${fs}px "Commit Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";

    const lineH = fs * LINE_HEIGHT;

    const showBack = state.showBack !== false;
    const backY = pad;
    if (showBack) {
      const isBackHovered = this._hoveredId === "back";
      ctx.fillStyle = isBackHovered ? theme.backHover : theme.back;
      ctx.fillText(BACK_TEXT, pad, backY);
      const backWidth = ctx.measureText(BACK_TEXT).width;
      const hitPad = 20;
      this._hitAreas.push({
        id: "back",
        x: pad - hitPad,
        y: backY - hitPad,
        width: backWidth + hitPad * 2,
        height: lineH + hitPad * 2,
      });
    }

    const contentStartY = showBack ? backY + lineH + this._backPadBottom : pad;
    const inputAreaHeight = lineH + 12;
    const suggestionsHeight = this.getSuggestionsHeight(state.suggestions, lineH);
    const contentHeight = visibleH - contentStartY - pad - inputAreaHeight - suggestionsHeight;

    const extractLinks = (text: string): Map<string, string> => {
      const links = new Map<string, string>();
      for (const m of text.matchAll(MD_LINK_RE)) {
        links.set(m[1], m[2]);
      }
      return links;
    };

    const buildLineSegments = (line: string, links: Map<string, string>): TextSegment[] => {
      if (links.size === 0) return [{ text: line }];
      const segments: TextSegment[] = [];
      let remaining = line;
      while (remaining.length > 0) {
        let earliestIdx = remaining.length;
        let matchedLabel = "";
        let matchedUrl = "";
        for (const [label, url] of links) {
          const idx = remaining.indexOf(label);
          if (idx !== -1 && idx < earliestIdx) {
            earliestIdx = idx;
            matchedLabel = label;
            matchedUrl = url;
          }
        }
        if (!matchedLabel) {
          segments.push({ text: remaining });
          break;
        }
        if (earliestIdx > 0) {
          segments.push({ text: remaining.slice(0, earliestIdx) });
        }
        segments.push({ text: matchedLabel, url: matchedUrl });
        remaining = remaining.slice(earliestIdx + matchedLabel.length);
      }
      return segments;
    };

    const lines: RenderedLine[] = [];

    for (const msg of state.messages) {
      const label = msg.role === "user" ? USER_LABEL : CLONE_LABEL;
      const color = msg.role === "user" ? theme.dim : theme.text;
      const links = extractLinks(msg.text);
      const plainText = stripMarkdown((label + msg.text).replace(MD_LINK_RE, "$1"));
      const wrapped = this.wrapText(plainText, this.cols);
      for (const line of wrapped) {
        lines.push({ segments: buildLineSegments(line, links), color });
      }
      lines.push({ segments: [{ text: "" }], color: theme.text });
    }

    if (state.isStreaming && state.streamedText) {
      const plainText = stripMarkdown((CLONE_LABEL + state.streamedText).replace(MD_LINK_RE, "$1"));
      const wrapped = this.wrapText(plainText, this.cols);
      for (const line of wrapped) {
        lines.push({ segments: [{ text: line }], color: theme.text });
      }
      const cursorVisible = Math.floor(now / CURSOR_BLINK_RATE) % 2 === 0;
      if (cursorVisible) {
        const lastLine = lines[lines.length - 1];
        if (lastLine) {
          const lastSeg = lastLine.segments[lastLine.segments.length - 1];
          if (lastSeg) lastSeg.text += "█";
        }
      }
    }

    const totalContentHeight = lines.length * lineH;
    this._maxScrollY = Math.max(0, totalContentHeight - contentHeight);

    if (Math.abs(this._scrollVelocity) > SCROLL_SNAP_THRESHOLD) {
      this._scrollY += this._scrollVelocity;
      this._scrollVelocity *= SCROLL_FRICTION;
    } else {
      this._scrollVelocity = 0;
    }

    this._scrollY = Math.max(0, Math.min(this._maxScrollY, this._scrollY));

    if (!this._userScrolled) {
      this._scrollY = this._maxScrollY;
    }

    if (this._userScrolled && this._scrollY >= this._maxScrollY - 1) {
      this._userScrolled = false;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, contentStartY, canvas.width, contentHeight);
    ctx.clip();

    for (let i = 0; i < lines.length; i++) {
      const y = contentStartY + i * lineH - this._scrollY;
      if (y + lineH < contentStartY || y > contentStartY + contentHeight) continue;

      const line = lines[i];
      let x = pad;

      for (const seg of line.segments) {
        const segWidth = ctx.measureText(seg.text).width;

        if (seg.url) {
          const linkId = `link-${i}-${Math.round(x)}`;
          const isLinkHovered = this._hoveredId === linkId;
          ctx.fillStyle = isLinkHovered ? theme.backHover : theme.back;
          ctx.fillText(seg.text, x, y);
          const underlineY = y + fs + 2;
          ctx.fillRect(x, underlineY, segWidth, 1);
          this._hitAreas.push({
            id: linkId,
            x,
            y,
            width: segWidth,
            height: lineH,
            url: seg.url,
          });
        } else {
          ctx.fillStyle = line.color;
          ctx.fillText(seg.text, x, y);
        }

        x += segWidth;
      }
    }

    ctx.restore();

    this.renderSuggestions(state.suggestions, theme, visibleH, lineH);
    this.renderInputLine(state, now, theme, visibleH);
  }

  private renderInputLine(
    state: CRTTextState,
    now: number,
    theme: ThemeColors,
    visibleH: number,
  ): void {
    const { ctx, _fontSize: fs, _padding: pad } = this;
    const lineH = fs * LINE_HEIGHT;
    const inputY = visibleH - pad - lineH;

    ctx.fillStyle = theme.dim;
    const sepY = inputY - 8;
    ctx.fillRect(pad, sepY, this.canvas.width - pad * 2, 1);

    ctx.fillStyle = theme.prompt;
    let displayText = INPUT_PROMPT + state.inputText;

    if (state.inputFocused) {
      const cursorVisible = Math.floor(now / CURSOR_BLINK_RATE) % 2 === 0;
      if (cursorVisible) {
        displayText += "█";
      } else {
        displayText += " ";
      }
    }

    ctx.fillText(displayText, pad, inputY);
  }

  private wrapText(text: string, maxCols: number): string[] {
    const paragraphs = text.split("\n");
    const result: string[] = [];
    for (const para of paragraphs) {
      if (para === "") {
        result.push("");
        continue;
      }
      for (const line of this.wordWrap(para, maxCols)) {
        result.push(line);
      }
    }
    return result;
  }

  private getSuggestionsHeight(suggestions: string[] | undefined, lineH: number): number {
    if (!suggestions?.length) return 0;
    return suggestions.length * (lineH + 1) + 1 + 16;
  }

  private renderSuggestions(
    suggestions: string[] | undefined,
    theme: ThemeColors,
    visibleH: number,
    lineH: number,
  ): void {
    if (!suggestions?.length) return;
    const { ctx, _fontSize: fs, _padding: pad } = this;
    const totalH = this.getSuggestionsHeight(suggestions, lineH);
    const inputAreaHeight = lineH + 12;
    const startY = visibleH - pad - inputAreaHeight - totalH;
    const boxX = pad;
    const boxW = this.canvas.width - pad * 2;

    ctx.font = `bold ${fs}px "Commit Mono", ui-monospace, monospace`;

    ctx.fillStyle = theme.dim;
    ctx.fillRect(boxX, startY, boxW, 1);

    for (let i = 0; i < suggestions.length; i++) {
      const id = `suggestion-${i}`;
      const isHovered = this._hoveredId === id;
      const rowY = startY + 1 + i * (lineH + 1);

      if (isHovered) {
        ctx.fillStyle = theme.text;
        ctx.fillRect(boxX, rowY, boxW, lineH);
        ctx.fillStyle = theme.bg;
      } else {
        ctx.fillStyle = theme.text;
      }

      let label = suggestions[i];
      const maxChars = Math.floor((boxW - 24) / (fs * 0.6));
      if (label.length > maxChars) {
        label = label.slice(0, maxChars - 1) + "…";
      }

      ctx.fillText(label, boxX + 12, rowY + 2);

      ctx.fillStyle = theme.dim;
      ctx.fillRect(boxX, rowY + lineH, boxW, 1);

      this._hitAreas.push({
        id,
        x: boxX,
        y: rowY,
        width: boxW,
        height: lineH,
      });
    }
  }

  private wordWrap(text: string, maxCols: number): string[] {
    if (text.length <= maxCols) return [text];

    const lines: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= maxCols) {
        lines.push(remaining);
        break;
      }

      let breakAt = remaining.lastIndexOf(" ", maxCols);
      if (breakAt <= 0) {
        breakAt = maxCols;
      }

      lines.push(remaining.substring(0, breakAt));
      remaining = remaining.substring(breakAt).trimStart();
    }

    return lines;
  }
}
