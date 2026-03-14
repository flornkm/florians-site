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
}

const FONT_SIZE = 26;
const LINE_HEIGHT = 1.4;
const PADDING = 48;
const CURSOR_BLINK_RATE = 530; // ms
const USER_LABEL = "YOU> ";
const CLONE_LABEL = "FLO> ";
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
    const contentHeight = visibleH - contentStartY - PADDING - inputAreaHeight;

    // Build all lines from messages
    const lines: { text: string; color: string }[] = [];

    for (const msg of state.messages) {
      const label = msg.role === "user" ? USER_LABEL : CLONE_LABEL;
      const color = msg.role === "user" ? theme.dim : theme.text;
      const wrapped = this.wrapText(label + msg.text, this.cols);
      for (const line of wrapped) {
        lines.push({ text: line, color });
      }
      lines.push({ text: "", color: theme.text });
    }

    // Streaming text (partial response)
    if (state.isStreaming && state.streamedText) {
      const wrapped = this.wrapText(CLONE_LABEL + state.streamedText, this.cols);
      for (const line of wrapped) {
        lines.push({ text: line, color: theme.text });
      }
      const cursorVisible = Math.floor(now / CURSOR_BLINK_RATE) % 2 === 0;
      if (cursorVisible) {
        const lastLine = lines[lines.length - 1];
        if (lastLine) lastLine.text += "█";
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
      ctx.fillStyle = lines[i].color;
      ctx.fillText(lines[i].text, PADDING, y);
    }

    ctx.restore();

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
