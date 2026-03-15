/**
 * Canvas 2D text renderer for the CRT display.
 *
 * Renders chat messages and input as monospace bitmap text onto an offscreen
 * canvas that gets fed into the WebGL CRT shader.
 */

export interface CRTMessage {
  role: "user" | "assistant";
  text: string;
}

export interface CRTTextState {
  messages: CRTMessage[];
  /** Characters of the current streaming response revealed so far. */
  streamedText: string;
  /** Whether the assistant is currently streaming. */
  isStreaming: boolean;
  /** Current user input text. */
  inputText: string;
  /** Whether the input field is focused. */
  inputFocused: boolean;
  /** Visible height in canvas pixels (for virtual keyboard). Defaults to canvas height. */
  visibleHeight?: number;
  /** Follow-up question suggestions to display as clickable buttons. */
  suggestions?: string[];
}

const FONT_SIZE = 26;
const LINE_HEIGHT = 1.4;
const PADDING = 48;
const CURSOR_BLINK_RATE = 530; // ms
const USER_LABEL = "YOU> ";
const CLONE_LABEL = "BOT> ";
const INPUT_PROMPT = "> ";
const BACK_TEXT = "< BACK";
const BACK_PADDING_BOTTOM = 16;
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

/** A segment of text on a line — either plain text or a clickable link. */
interface TextSegment {
  text: string;
  url?: string;
}

/** A rendered line with color and parsed segments. */
interface RenderedLine {
  segments: TextSegment[];
  color: string;
}

/** Regex to match markdown links: [text](url) */
const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Strip markdown formatting (bold, italic, headers, list markers) but preserve link syntax. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic
    .replace(/__(.+?)__/g, "$1") // bold alt
    .replace(/_(.+?)_/g, "$1") // italic alt
    .replace(/^#{1,6}\s+/gm, "") // headers
    .replace(/^[-*]\s+/gm, ""); // list markers
}

export class CRTTextRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cols: number = 80;
  private _hitAreas: HitArea[] = [];
  private _hoveredId: string | null = null;

  // Smooth scrolling state (pixel-based)
  private _scrollY: number = 0; // current scroll position in pixels
  private _scrollVelocity: number = 0; // momentum velocity
  private _targetScrollY: number = 0; // target for auto-scroll
  private _userScrolled: boolean = false;
  private _maxScrollY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) throw new Error("Canvas 2D not supported");
    this.ctx = ctx;
  }

  get hitAreas(): HitArea[] {
    return this._hitAreas;
  }

  set hoveredId(id: string | null) {
    this._hoveredId = id;
  }

  /** Apply a pixel scroll delta (from wheel events). */
  scroll(deltaPixels: number): void {
    this._scrollVelocity += deltaPixels;
    this._userScrolled = true;
  }

  /** Resize the text canvas. Recalculates column count. */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.cols = Math.floor((width - PADDING * 2) / (FONT_SIZE * 0.6));
  }

  /** Render the full CRT text display. */
  render(state: CRTTextState): void {
    const { ctx, canvas } = this;
    const now = performance.now();
    const theme = getTheme();
    this._hitAreas = [];

    // Use visibleHeight for layout (keyboard may cover the bottom)
    const visibleH = state.visibleHeight ?? canvas.height;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `bold ${FONT_SIZE}px "Commit Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";

    const lineH = FONT_SIZE * LINE_HEIGHT;

    // ── Back button at top ──
    const backY = PADDING;
    const isBackHovered = this._hoveredId === "back";
    ctx.fillStyle = isBackHovered ? theme.backHover : theme.back;
    ctx.fillText(BACK_TEXT, PADDING, backY);
    const backWidth = ctx.measureText(BACK_TEXT).width;
    const hitPad = 20;
    this._hitAreas.push({
      id: "back",
      x: PADDING - hitPad,
      y: backY - hitPad,
      width: backWidth + hitPad * 2,
      height: lineH + hitPad * 2,
    });

    // Content area bounds — use visibleH so input stays above keyboard
    const contentStartY = backY + lineH + BACK_PADDING_BOTTOM;
    const inputAreaHeight = lineH + 12;
    const suggestionsHeight = this.getSuggestionsHeight(state.suggestions, lineH);
    const contentHeight = visibleH - contentStartY - PADDING - inputAreaHeight - suggestionsHeight;

    // Extract all links from a message for lookup
    const extractLinks = (text: string): Map<string, string> => {
      const links = new Map<string, string>();
      for (const m of text.matchAll(MD_LINK_RE)) {
        links.set(m[1], m[2]);
      }
      return links;
    };

    // Build segments for a wrapped line using the link map
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

    // Build all lines from messages
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

    // Streaming text (partial response)
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

    // Calculate max scroll
    const totalContentHeight = lines.length * lineH;
    this._maxScrollY = Math.max(0, totalContentHeight - contentHeight);

    // Apply momentum scrolling
    if (Math.abs(this._scrollVelocity) > SCROLL_SNAP_THRESHOLD) {
      this._scrollY += this._scrollVelocity;
      this._scrollVelocity *= SCROLL_FRICTION;
    } else {
      this._scrollVelocity = 0;
    }

    // Clamp scroll position
    this._scrollY = Math.max(0, Math.min(this._maxScrollY, this._scrollY));

    // Auto-scroll to bottom when not user-scrolled
    if (!this._userScrolled) {
      this._scrollY = this._maxScrollY;
    }

    // Re-enable auto-scroll when at the bottom
    if (this._userScrolled && this._scrollY >= this._maxScrollY - 1) {
      this._userScrolled = false;
    }

    // Draw lines with clip region
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, contentStartY, canvas.width, contentHeight);
    ctx.clip();

    for (let i = 0; i < lines.length; i++) {
      const y = contentStartY + i * lineH - this._scrollY;
      // Skip lines outside visible area
      if (y + lineH < contentStartY || y > contentStartY + contentHeight) continue;

      const line = lines[i];
      let x = PADDING;

      for (const seg of line.segments) {
        const segWidth = ctx.measureText(seg.text).width;

        if (seg.url) {
          // Link: use underline + different color on hover
          const linkId = `link-${i}-${Math.round(x)}`;
          const isLinkHovered = this._hoveredId === linkId;
          ctx.fillStyle = isLinkHovered ? theme.backHover : theme.back;
          ctx.fillText(seg.text, x, y);
          // Underline
          const underlineY = y + FONT_SIZE + 2;
          ctx.fillRect(x, underlineY, segWidth, 1);
          // Hit area
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

    // Draw suggestions above input
    this.renderSuggestions(state.suggestions, theme, visibleH, lineH);

    // Draw input area at bottom of visible area
    this.renderInputLine(state, now, theme, visibleH);
  }

  private renderInputLine(
    state: CRTTextState,
    now: number,
    theme: ThemeColors,
    visibleH: number,
  ): void {
    const { ctx } = this;
    const lineH = FONT_SIZE * LINE_HEIGHT;
    const inputY = visibleH - PADDING - lineH;

    // Separator line
    ctx.fillStyle = theme.dim;
    const sepY = inputY - 8;
    ctx.fillRect(PADDING, sepY, this.canvas.width - PADDING * 2, 1);

    // Input text
    ctx.fillStyle = theme.prompt;
    let displayText = INPUT_PROMPT + state.inputText;

    // Blinking cursor
    if (state.inputFocused) {
      const cursorVisible = Math.floor(now / CURSOR_BLINK_RATE) % 2 === 0;
      if (cursorVisible) {
        displayText += "█";
      } else {
        displayText += " ";
      }
    }

    ctx.fillText(displayText, PADDING, inputY);
  }

  /** Split text on explicit newlines, then word-wrap each paragraph. */
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
    // Each suggestion: lineH for text + 1px border. Plus top border + padding.
    return suggestions.length * (lineH + 1) + 1 + 16;
  }

  private renderSuggestions(
    suggestions: string[] | undefined,
    theme: ThemeColors,
    visibleH: number,
    lineH: number,
  ): void {
    if (!suggestions?.length) return;
    const { ctx } = this;
    const totalH = this.getSuggestionsHeight(suggestions, lineH);
    const inputAreaHeight = lineH + 12;
    const startY = visibleH - PADDING - inputAreaHeight - totalH;
    const boxX = PADDING;
    const boxW = this.canvas.width - PADDING * 2;

    ctx.font = `bold ${FONT_SIZE}px "Commit Mono", ui-monospace, monospace`;

    // Top border
    ctx.fillStyle = theme.dim;
    ctx.fillRect(boxX, startY, boxW, 1);

    for (let i = 0; i < suggestions.length; i++) {
      const id = `suggestion-${i}`;
      const isHovered = this._hoveredId === id;
      const rowY = startY + 1 + i * (lineH + 1);

      // Hover: invert colors (teletext selection style)
      if (isHovered) {
        ctx.fillStyle = theme.text;
        ctx.fillRect(boxX, rowY, boxW, lineH);
        ctx.fillStyle = theme.bg;
      } else {
        ctx.fillStyle = theme.text;
      }

      // Truncate text if needed
      let label = suggestions[i];
      const maxChars = Math.floor((boxW - 24) / (FONT_SIZE * 0.6));
      if (label.length > maxChars) {
        label = label.slice(0, maxChars - 1) + "…";
      }

      ctx.fillText(label, boxX + 12, rowY + 2);

      // Bottom border
      ctx.fillStyle = theme.dim;
      ctx.fillRect(boxX, rowY + lineH, boxW, 1);

      // Hit area
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
