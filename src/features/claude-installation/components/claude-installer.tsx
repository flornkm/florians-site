import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import "../claude-installer.css";

/**
 * A fake Windows XP-era setup wizard for "Claude", framed as if Anthropic had shipped an
 * installer for Claude Code in the early 2000s. Pure nostalgia experiment — nothing is real.
 * Rendered full-screen on the /claude-installation route, on top of a Luna desktop + taskbar,
 * behind a light CRT screen frame.
 */

type StepId = "welcome" | "license" | "location" | "components" | "installing" | "finish";

const ORDER: StepId[] = ["welcome", "license", "location", "components", "installing", "finish"];

interface Component {
  id: string;
  label: string;
  size: string;
  desc: string;
  locked?: boolean;
}

const COMPONENTS: Component[] = [
  {
    id: "cli",
    label: "Claude Code (CLI)",
    size: "61.2 MB",
    desc: "The core command-line assistant and agent runtime. Required.",
    locked: true,
  },
  {
    id: "companion",
    label: "Desktop Companion",
    size: "18.4 MB",
    desc: "A system-tray companion for quick chats without opening a console.",
  },
  {
    id: "mcp",
    label: "MCP Example Servers",
    size: "4.1 MB",
    desc: "Sample Model Context Protocol servers (files, fetch, memory).",
  },
  {
    id: "desktop",
    label: "Desktop Shortcut",
    size: "0.1 MB",
    desc: "Place a shortcut to Claude Code on the Desktop.",
  },
  {
    id: "startmenu",
    label: "Start Menu Shortcuts",
    size: "0.1 MB",
    desc: "Add Claude Code to the Start menu under Anthropic.",
  },
];

const INSTALL_FILES = [
  "claude.exe",
  "anthropic.dll",
  "tokenizer.dat",
  "model_router.dll",
  "mcp_host.exe",
  "shell-integration.cmd",
  "claude-code.cmd",
  "icons.dll",
  "splash.bmp",
  "config.ini",
  "uninstall.exe",
  "README.txt",
];

/* Drag a window by its title bar, XP-style. Tracks a translate offset so the window keeps its
   default centered position until the user moves it. */
function useDragWindow() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const offsetRef = useRef(offset);
  offsetRef.current = offset;
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".xp-tbtn")) return;
    const sx = e.clientX;
    const sy = e.clientY;
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    const move = (ev: PointerEvent) =>
      setOffset({ x: ox + ev.clientX - sx, y: oy + ev.clientY - sy });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, []);
  return { offset, onPointerDown };
}

export const ClaudeInstaller = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [path, setPath] = useState("C:\\Program Files\\Anthropic\\Claude");
  const [checked, setChecked] = useState<Record<string, boolean>>({
    cli: true,
    companion: true,
    mcp: true,
    desktop: true,
    startmenu: true,
  });
  const [activeComp, setActiveComp] = useState("cli");
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [launchAfter, setLaunchAfter] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);

  const step = ORDER[stepIndex];
  const logRef = useRef<HTMLDivElement>(null);
  const drag = useDragWindow();

  const reset = useCallback(() => {
    setStepIndex(0);
    setAccepted(false);
    setProgress(0);
    setCurrentFile("");
    setLog([]);
    setCancelOpen(false);
    setRunOpen(false);
  }, []);

  const goNext = useCallback(() => setStepIndex((i) => Math.min(i + 1, ORDER.length - 1)), []);
  const goBack = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);

  // Installing — synchronize a progress bar + copy log with a timer (external system).
  useEffect(() => {
    if (step !== "installing") return;
    let pct = 0;
    let fileIdx = 0;
    const tick = setInterval(() => {
      pct = Math.min(100, pct + 3 + Math.random() * 5);
      setProgress(pct);
      const idx = Math.min(
        INSTALL_FILES.length - 1,
        Math.floor((pct / 100) * INSTALL_FILES.length),
      );
      if (idx !== fileIdx || pct < 4) {
        fileIdx = idx;
        const name = INSTALL_FILES[idx];
        setCurrentFile(name);
        setLog((l) => [...l, `Extract: ${name}... 100%`]);
      }
      if (pct >= 100) {
        clearInterval(tick);
        setTimeout(() => setStepIndex((i) => i + 1), 650);
      }
    }, 260);
    return () => clearInterval(tick);
  }, [step]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const finish = useCallback(() => {
    if (launchAfter) {
      setRunOpen(true);
    } else {
      reset();
    }
  }, [launchAfter, reset]);

  const requestCancel = useCallback(() => setCancelOpen(true), []);

  const sizeRequired = COMPONENTS.filter((c) => checked[c.id]).reduce(
    (sum, c) => sum + parseFloat(c.size),
    0,
  );

  const nextDisabled = step === "license" && !accepted;
  const filledSegments = Math.floor((progress / 100) * 46);

  return (
    <div className="xp-desktop">
      <div className="xp-wallpaper" />

      {!runOpen && (
        <div
          className="xp-window"
          role="dialog"
          aria-label="Claude Setup"
          style={{ transform: `translate(${drag.offset.x}px, ${drag.offset.y}px)` }}
        >
          <div className="xp-titlebar" onPointerDown={drag.onPointerDown}>
            <ClaudeLogo size={16} className="xp-title-icon" />
            <span className="xp-title-text">Claude Setup</span>
            <div className="xp-title-btns">
              <span className="xp-tbtn xp-tbtn-min" aria-label="Minimize" data-disabled />
              <span className="xp-tbtn xp-tbtn-max" aria-label="Maximize" data-disabled />
              <span
                className="xp-tbtn xp-tbtn-close"
                onClick={requestCancel}
                role="button"
                aria-label="Close"
              />
            </div>
          </div>

          <div className="xp-body">
            {step === "welcome" && <WelcomePage />}

            {step === "license" && <LicensePage accepted={accepted} onAccept={setAccepted} />}

            {step === "location" && (
              <LocationPage path={path} onPath={setPath} required={sizeRequired} />
            )}

            {step === "components" && (
              <ComponentsPage
                checked={checked}
                onToggle={(id) => setChecked((c) => ({ ...c, [id]: !c[id] }))}
                active={activeComp}
                onActive={setActiveComp}
                required={sizeRequired}
              />
            )}

            {step === "installing" && (
              <InstallingPage
                progress={progress}
                filled={filledSegments}
                currentFile={currentFile}
                log={log}
                logRef={logRef}
              />
            )}

            {step === "finish" && <FinishPage launch={launchAfter} onLaunch={setLaunchAfter} />}
          </div>

          <div className="xp-footer">
            {step !== "finish" && <div className="xp-footer-spacer" />}
            <button
              type="button"
              className="xp-btn"
              disabled={stepIndex === 0 || step === "installing" || step === "finish"}
              onClick={goBack}
            >
              {"< Back"}
            </button>
            {step === "finish" ? (
              <button type="button" className="xp-btn" data-default onClick={finish}>
                Finish
              </button>
            ) : (
              <button
                type="button"
                className="xp-btn"
                data-default
                disabled={nextDisabled || step === "installing"}
                onClick={goNext}
              >
                {step === "components" ? "Install" : "Next >"}
              </button>
            )}
            {step !== "finish" && (
              <button type="button" className="xp-btn" onClick={requestCancel}>
                Cancel
              </button>
            )}
          </div>

          {cancelOpen && <CancelDialog onYes={reset} onNo={() => setCancelOpen(false)} />}
        </div>
      )}

      {runOpen && (
        <div className="xp-run-scene">
          <div className="xp-run-stack">
            <NotepadWindow onClose={reset} />
            <ClaudeMascot />
          </div>
        </div>
      )}

      <Taskbar label={runOpen ? "Claude" : "Claude Setup"} />
    </div>
  );
};

/* ---------------- Pages ---------------- */

/* Bold Trebuchet text drawn into a low-res canvas and upscaled nearest-neighbor — a smooth XP
   caption font with fake pixels (and an optional fake drop shadow). `scale` is the pixel-block
   size in *device* pixels: 1 ≈ crisp/smooth, ~1.4 = barely pixelated, 2+ = visibly chunky. It's
   device-px based (DPR-aware) so it looks identical on retina and 1× displays. fit="inline"
   sizes to the text (title bar); "block" wraps a column to the parent width. */
function PixelText({
  text,
  color,
  size = 21,
  scale = 1.1,
  align = "left",
  weight = 700,
  shadowColor,
  shadowDx = 1.5,
  shadowDy = 1.5,
  fit = "block",
  className,
}: {
  text: string;
  color: string;
  size?: number;
  scale?: number;
  align?: "left" | "center";
  weight?: number;
  shadowColor?: string;
  shadowDx?: number;
  shadowDy?: number;
  fit?: "block" | "inline";
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const draw = () => {
      // `scale` is the pixel-block size in device px; R is buffer-pixels per CSS-pixel. Rendering
      // the buffer at device density (then upscaling by `scale`) makes the block size identical on
      // retina and 1× screens, so the heading no longer doubles its pixels on high-DPI displays.
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
      const R = dpr / scale;
      const fpx = size * R;
      const lh = Math.round(fpx * 1.25);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const font = `${weight} ${fpx}px "Trebuchet MS", "Segoe UI", Tahoma, sans-serif`;
      ctx.font = font;
      const sdx = shadowColor ? shadowDx * R : 0;
      const sdy = shadowColor ? shadowDy * R : 0;
      let lines: string[];
      let bw: number;
      if (fit === "inline") {
        lines = [text];
        bw = Math.ceil(ctx.measureText(text).width + sdx + 2);
      } else {
        const dispW = parent.clientWidth;
        if (!dispW) return;
        bw = Math.ceil(dispW * R);
        lines = [];
        let cur = "";
        for (const word of text.split(" ")) {
          const next = cur ? `${cur} ${word}` : word;
          if (ctx.measureText(next).width > bw - sdx && cur) {
            lines.push(cur);
            cur = word;
          } else {
            cur = next;
          }
        }
        if (cur) lines.push(cur);
      }
      const bh = Math.ceil(lines.length * lh + 2 + sdy);
      canvas.width = bw;
      canvas.height = bh;
      canvas.style.width = fit === "inline" ? `${Math.round(bw / R)}px` : "100%";
      canvas.style.height = `${Math.round(bh / R)}px`;
      const c = canvas.getContext("2d");
      if (!c) return;
      c.clearRect(0, 0, bw, bh);
      c.font = font;
      c.textBaseline = "middle";
      c.textAlign = align;
      c.lineJoin = "round";
      const x = align === "center" ? bw / 2 : 0;
      const cyAt = (i: number) => i * lh + lh / 2 + 1;
      if (shadowColor) {
        c.fillStyle = shadowColor;
        lines.forEach((line, i) => c.fillText(line, x + sdx, cyAt(i) + sdy));
      }
      c.fillStyle = color;
      c.strokeStyle = color;
      c.lineWidth = 0.35 * R;
      lines.forEach((line, i) => {
        c.fillText(line, x, cyAt(i));
        c.strokeText(line, x, cyAt(i));
      });
    };
    draw();
    document.fonts?.ready.then(draw);
    const ro = new ResizeObserver(draw);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [text, color, size, scale, align, weight, shadowColor, shadowDx, shadowDy, fit]);
  return (
    <canvas
      ref={ref}
      className={className}
      style={{
        imageRendering: "pixelated",
        display: fit === "inline" ? "inline-block" : "block",
        verticalAlign: "middle",
      }}
      aria-label={text}
    />
  );
}

function WelcomePage() {
  return (
    <div className="xp-exterior">
      <div className="xp-banner">
        <BannerArt className="xp-banner-art" />
        <PixelText
          text="Claude"
          color="#ffffff"
          size={26}
          align="center"
          shadowColor="rgba(8,24,80,0.55)"
          className="xp-banner-word"
        />
        <div className="xp-banner-sub">from Anthropic</div>
      </div>
      <div className="xp-exterior-main">
        <PixelText
          text="Welcome to the Claude Setup Wizard"
          color="#003399"
          shadowColor="rgba(0,0,0,0.22)"
          className="xp-exterior-title"
        />
        <div className="xp-exterior-text">
          <p>
            This wizard will install Claude Code 1.0.0 on your computer, giving you an AI assistant
            that lives in your terminal and helps you write, run, and reason about code.
          </p>
          <p>It is recommended that you close all other applications before continuing.</p>
          <p>Click Next to continue, or Cancel to exit Setup.</p>
        </div>
      </div>
    </div>
  );
}

interface LicenseProps {
  accepted: boolean;
  onAccept: (v: boolean) => void;
}

function LicensePage({ accepted, onAccept }: LicenseProps) {
  return (
    <>
      <WizardHeader
        title="License Agreement"
        sub="Please read the following license agreement carefully."
      />
      <div className="xp-content">
        <div className="xp-sunken xp-eula">
          <h4>END USER LICENSE AGREEMENT</h4>
          <p>
            This End User License Agreement ("Agreement") is a legal agreement between you and
            Anthropic for the Claude software, which includes the command-line assistant, companion
            tools, and associated documentation ("Software").
          </p>
          <p>
            1. GRANT OF LICENSE. Anthropic grants you a personal, non-exclusive license to install
            and use one copy of the Software on a single computer for your own lawful purposes.
          </p>
          <p>
            2. ASSISTANT BEHAVIOR. The Software is helpful, harmless, and honest. It may decline
            requests it deems unsafe. Outputs are provided "as is" and should be reviewed before
            use.
          </p>
          <p>
            3. NO WARRANTY. The Software is provided without warranty of any kind. The future is
            uncertain and so is autocomplete.
          </p>
          <p>
            4. PRIVACY. Be excellent to each other. By installing, you agree to the terms above.
          </p>
        </div>
        <div style={{ marginTop: 10 }}>
          <label className="xp-radio">
            <input type="radio" name="eula" checked={accepted} onChange={() => onAccept(true)} />
            <span>I accept the terms in the License Agreement</span>
          </label>
          <label className="xp-radio">
            <input type="radio" name="eula" checked={!accepted} onChange={() => onAccept(false)} />
            <span>I do not accept the terms in the License Agreement</span>
          </label>
        </div>
      </div>
    </>
  );
}

interface LocationProps {
  path: string;
  onPath: (v: string) => void;
  required: number;
}

function LocationPage({ path, onPath, required }: LocationProps) {
  return (
    <>
      <WizardHeader
        title="Choose Install Location"
        sub="Choose the folder in which to install Claude."
      />
      <div className="xp-content">
        <p>
          Setup will install Claude in the following folder. To install in a different folder, click
          Browse and select another folder.
        </p>
        <div className="xp-group">
          <span className="xp-group-label">Destination Folder</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              className="xp-field"
              value={path}
              onChange={(e) => onPath(e.target.value)}
              spellCheck={false}
            />
            <button type="button" className="xp-btn xp-btn-field">
              Browse...
            </button>
          </div>
        </div>
        <div style={{ marginTop: "auto", paddingTop: 14 }}>
          <div>Space required: {required.toFixed(1)} MB</div>
          <div>Space available: 14.2 GB</div>
        </div>
      </div>
    </>
  );
}

interface ComponentsProps {
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  active: string;
  onActive: (id: string) => void;
  required: number;
}

function ComponentsPage({ checked, onToggle, active, onActive, required }: ComponentsProps) {
  const activeComp = COMPONENTS.find((c) => c.id === active);
  return (
    <>
      <WizardHeader
        title="Choose Components"
        sub="Choose which features of Claude you want to install."
      />
      <div className="xp-content">
        <p>Check the components you want to install and uncheck those you do not want.</p>
        <div className="xp-sunken xp-complist">
          {COMPONENTS.map((c) => (
            <div
              key={c.id}
              className="xp-comp-row"
              data-active={active === c.id ? "" : undefined}
              data-disabled={c.locked ? "" : undefined}
              onMouseEnter={() => onActive(c.id)}
              onClick={() => !c.locked && onToggle(c.id)}
            >
              <input
                type="checkbox"
                checked={checked[c.id]}
                disabled={c.locked}
                readOnly
                onClick={(e) => e.stopPropagation()}
                onChange={() => !c.locked && onToggle(c.id)}
              />
              <span style={{ flex: 1 }}>{c.label}</span>
              <span style={{ opacity: 0.85 }}>{c.size}</span>
            </div>
          ))}
        </div>
        <div className="xp-sunken xp-desc-box">
          {activeComp?.desc ?? "Position your mouse over a component to see its description."}
        </div>
        <div style={{ marginTop: 8 }}>Space required: {required.toFixed(1)} MB</div>
      </div>
    </>
  );
}

interface InstallingProps {
  progress: number;
  filled: number;
  currentFile: string;
  log: string[];
  logRef: React.RefObject<HTMLDivElement | null>;
}

function InstallingPage({ progress, filled, currentFile, log, logRef }: InstallingProps) {
  return (
    <>
      <WizardHeader title="Installing" sub="Please wait while Claude is being installed." />
      <div className="xp-content">
        {/* The classic installer copy animation: pages flying off the DVD-ROM into a folder. */}
        <div className="xp-copyanim" aria-hidden>
          <XpDvdIcon size={46} />
          <div className="xp-copyflow">
            <span className="xp-page" />
            <span className="xp-page" />
            <span className="xp-page" />
          </div>
          <XpFolderIcon size={40} />
        </div>
        <div style={{ marginBottom: 5 }}>
          {currentFile ? `Extract: ${currentFile}` : "Preparing installation..."}
        </div>
        <div className="xp-progress" aria-label={`${Math.round(progress)}%`}>
          {Array.from({ length: filled }).map((_, i) => (
            <div key={i} className="xp-progress-seg" />
          ))}
        </div>
        <div className="xp-sunken xp-log" ref={logRef}>
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    </>
  );
}

interface FinishProps {
  launch: boolean;
  onLaunch: (v: boolean) => void;
}

function FinishPage({ launch, onLaunch }: FinishProps) {
  return (
    <div className="xp-exterior">
      <div className="xp-banner">
        <BannerArt className="xp-banner-art" />
        <PixelText
          text="Claude"
          color="#ffffff"
          size={26}
          align="center"
          shadowColor="rgba(8,24,80,0.55)"
          className="xp-banner-word"
        />
        <div className="xp-banner-sub">from Anthropic</div>
      </div>
      <div className="xp-exterior-main">
        <PixelText
          text="Completed the Claude Setup Wizard"
          color="#003399"
          shadowColor="rgba(0,0,0,0.22)"
          className="xp-exterior-title"
        />
        <div className="xp-exterior-text">
          <p>Claude Code has been installed on your computer.</p>
          <p>Click Finish to close this wizard.</p>
        </div>
        <label className="xp-check" style={{ marginTop: "auto" }}>
          <input type="checkbox" checked={launch} onChange={(e) => onLaunch(e.target.checked)} />
          <span>Run Claude Code now</span>
        </label>
      </div>
    </div>
  );
}

/* ---------------- Shared bits ---------------- */

function WizardHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="xp-header">
      <div className="xp-header-text">
        <div className="xp-header-title">{title}</div>
        <div className="xp-header-sub">{sub}</div>
      </div>
      <SetupIcon className="xp-header-icon" />
    </div>
  );
}

function CancelDialog({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="xp-msg-overlay">
      <div className="xp-msgbox" role="alertdialog">
        <div className="xp-titlebar">
          <span className="xp-title-text">Claude Setup</span>
          <div className="xp-title-btns">
            <span className="xp-tbtn xp-tbtn-close" onClick={onNo} role="button" aria-label="Close">
              ✕
            </span>
          </div>
        </div>
        <div className="xp-msg-body">
          <WarningIcon className="xp-msg-icon" />
          <div className="xp-msg-text">
            Setup is not complete. If you exit now, Claude will not be installed.
            <br />
            <br />
            Are you sure you want to cancel Claude Setup?
          </div>
        </div>
        <div className="xp-msg-footer">
          <button type="button" className="xp-btn" onClick={onYes}>
            Yes
          </button>
          <button type="button" className="xp-btn" data-default onClick={onNo}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}

/* A super-simple Notepad++-style editor, opened behind the Claude mascot after install. */
const NP_MENU = ["File", "Edit", "Search", "View", "Encoding", "Language", "Settings", "Run", "?"];
const NP_CODE: { n: number; parts: { t: string; c?: string }[] }[] = [
  { n: 1, parts: [{ t: "// hello-claude.js", c: "cmt" }] },
  { n: 2, parts: [{ t: "// Tip: Claude is standing by — just ask.", c: "cmt" }] },
  { n: 3, parts: [{ t: "" }] },
  {
    n: 4,
    parts: [{ t: "function ", c: "kw" }, { t: "buildWithClaude" }, { t: "(idea) {" }],
  },
  {
    n: 5,
    parts: [
      { t: "  const ", c: "kw" },
      { t: "plan = claude." },
      { t: "think", c: "fn" },
      { t: "(idea);" },
    ],
  },
  {
    n: 6,
    parts: [
      { t: "  return ", c: "kw" },
      { t: "claude." },
      { t: "code", c: "fn" },
      { t: "(plan);" },
    ],
  },
  { n: 7, parts: [{ t: "}" }] },
  { n: 8, parts: [{ t: "" }] },
  {
    n: 9,
    parts: [
      { t: "buildWithClaude" },
      { t: "(" },
      { t: '"a windows xp time machine"', c: "str" },
      { t: ");" },
    ],
  },
];

function NotepadWindow({ onClose }: { onClose: () => void }) {
  const drag = useDragWindow();
  return (
    <div
      className="xp-window xp-notepad"
      role="dialog"
      aria-label="Notepad++"
      style={{ transform: `translate(${drag.offset.x}px, ${drag.offset.y}px)` }}
    >
      <div className="xp-titlebar" onPointerDown={drag.onPointerDown}>
        <NppIcon className="xp-title-icon" />
        <span className="xp-title-text">hello-claude.js - Notepad++</span>
        <div className="xp-title-btns">
          <span className="xp-tbtn xp-tbtn-min" aria-label="Minimize" data-disabled />
          <span className="xp-tbtn xp-tbtn-max" aria-label="Maximize" data-disabled />
          <span
            className="xp-tbtn xp-tbtn-close"
            onClick={onClose}
            role="button"
            aria-label="Close"
          />
        </div>
      </div>
      <div className="np-menubar">
        {NP_MENU.map((m) => (
          <span key={m} className="np-menu">
            {m}
          </span>
        ))}
      </div>
      <div className="np-editor">
        <div className="np-gutter">
          {NP_CODE.map((line) => (
            <div key={line.n}>{line.n}</div>
          ))}
        </div>
        <div className="np-code">
          {NP_CODE.map((line) => (
            <div key={line.n}>
              {line.parts.map((p, i) => (
                <span key={i} className={p.c ? `np-${p.c}` : undefined}>
                  {p.t}
                </span>
              ))}
              {line.parts.length === 1 && line.parts[0].t === "" ? " " : ""}
            </div>
          ))}
        </div>
      </div>
      <div className="np-status">
        <span>JavaScript file</span>
        <span>length: 214 lines: 9</span>
        <span>Ln: 2 Col: 41</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}

function NppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden>
      <rect x="2" y="1" width="11" height="14" fill="#fff" stroke="#5a6b3a" />
      <rect x="4" y="4" width="7" height="1" fill="#6f9b3a" />
      <rect x="4" y="6" width="7" height="1" fill="#6f9b3a" />
      <rect x="4" y="8" width="5" height="1" fill="#6f9b3a" />
      <rect x="4" y="10" width="7" height="1" fill="#9ac06a" />
    </svg>
  );
}

function Taskbar({ label }: { label: string }) {
  return (
    <div className="xp-taskbar">
      <div className="xp-start">
        <StartOrb className="xp-start-orb" />
        start
      </div>
      <div className="xp-tasks">
        <div className="xp-task-btn">
          <ClaudeLogo size={14} />
          {label}
        </div>
      </div>
      <div className="xp-tray">
        <Volume />
        <Clock />
      </div>
    </div>
  );
}

/* ---------------- Icons ---------------- */

// The official Claude mark; rendered through #claude-pixelate so it reads as lightly pixel-art.
const CLAUDE_LOGO_PATH =
  "M50.2278481,170.321013 L100.585316,142.063797 L101.427848,139.601013 L100.585316,138.24 L98.1225316,138.24 L89.6972152,137.721519 L60.921519,136.943797 L35.9696203,135.906835 L11.795443,134.610633 L5.70329114,133.31443 L0,125.796456 L0.583291139,122.037468 L5.70329114,118.602532 L13.0268354,119.250633 L29.2293671,120.352405 L53.5331646,122.037468 L71.161519,123.07443 L97.28,125.796456 L101.427848,125.796456 L102.011139,124.111392 L100.585316,123.07443 L99.4835443,122.037468 L74.3372152,104.992405 L47.116962,86.9751899 L32.8587342,76.6055696 L25.1463291,71.3559494 L21.2577215,66.4303797 L19.5726582,55.6718987 L26.5721519,47.9594937 L35.9696203,48.6075949 L38.3675949,49.2556962 L47.8946835,56.5792405 L68.2450633,72.3281013 L94.8172152,91.9007595 L98.7058228,95.1412658 L100.261266,94.0394937 L100.455696,93.2617722 L98.7058228,90.3453165 L84.2531646,64.2268354 L68.8283544,37.6546835 L61.958481,26.636962 L60.1437975,20.0263291 C59.4956962,17.3043038 59.0420253,15.0359494 59.0420253,12.2491139 L67.0136709,1.42582278 L71.4207595,0 L82.0496203,1.42582278 L86.521519,5.31443038 L93.1321519,20.4151899 L103.825823,44.2005063 L120.417215,76.5407595 L125.277975,86.1326582 L127.87038,95.0116456 L128.842532,97.7336709 L130.527595,97.7336709 L130.527595,96.1782278 L131.888608,77.9665823 L134.416203,55.6070886 L136.878987,26.8313924 L137.721519,18.7301266 L141.739747,9.00860759 L149.711392,3.75898734 L155.933165,6.74025316 L161.053165,14.0637975 L160.340253,18.7949367 L157.294177,38.5620253 L151.331646,69.5412658 L147.443038,90.2805063 L149.711392,90.2805063 L152.303797,87.6881013 L162.803038,73.7539241 L180.431392,51.718481 L188.208608,42.9691139 L197.282025,33.3124051 L203.114937,28.7108861 L214.132658,28.7108861 L222.233924,40.7655696 L218.604557,53.2091139 L207.262785,67.596962 L197.865316,79.7812658 L184.38481,97.9281013 L175.959494,112.44557 L176.737215,113.612152 L178.746329,113.417722 L209.207089,106.936709 L225.668861,103.955443 L245.306329,100.585316 L254.185316,104.733165 L255.157468,108.945823 L251.657722,117.56557 L230.659241,122.75038 L206.031392,127.675949 L169.348861,136.360506 L168.89519,136.684557 L169.413671,137.332658 L185.940253,138.888101 L193.004557,139.276962 L210.308861,139.276962 L242.519494,141.674937 L250.94481,147.248608 L256,154.053671 L255.157468,159.238481 L242.195443,165.849114 L224.696709,161.701266 L183.866329,151.979747 L169.867342,148.48 L167.923038,148.48 L167.923038,149.646582 L179.588861,161.053165 L200.976203,180.366582 L227.742785,205.253671 L229.103797,211.410633 L225.668861,216.271392 L222.039494,215.752911 L198.513418,198.059747 L189.44,190.088101 L168.89519,172.783797 L167.534177,172.783797 L167.534177,174.598481 L172.265316,181.533165 L197.282025,219.123038 L198.578228,230.659241 L196.763544,234.418228 L190.282532,236.686582 L183.153418,235.39038 L168.506329,214.84557 L153.40557,191.708354 L141.221266,170.969114 L139.730633,171.811646 L132.536709,249.259747 L129.166582,253.213165 L121.389367,256.19443 L114.908354,251.268861 L111.473418,243.297215 L114.908354,227.548354 L119.056203,207.003544 L122.426329,190.671392 L125.472405,170.385823 L127.287089,163.64557 L127.157468,163.191899 L125.666835,163.386329 L110.371646,184.38481 L87.1048101,215.817722 L68.6987342,235.52 L64.2916456,237.269873 L56.6440506,233.316456 L57.356962,226.252152 L61.6344304,219.96557 L87.1048101,187.560506 L102.46481,167.469367 L112.380759,155.868354 L112.315949,154.183291 L111.732658,154.183291 L44.0708861,198.124557 L32.0162025,199.68 L26.8313924,194.819241 L27.4794937,186.847595 L29.9422785,184.25519 L50.2926582,170.256203 L50.2278481,170.321013 Z";

// Rasterize the logo path onto a grid once (client-side), as run-length rows of filled cells.
const LOGO_GRID = 92;
let LOGO_RECTS: [number, number, number][] | null = null;
function computeLogoRects(): [number, number, number][] | null {
  if (LOGO_RECTS) return LOGO_RECTS;
  if (typeof document === "undefined") return null;
  const G = LOGO_GRID;
  const canvas = document.createElement("canvas");
  canvas.width = G;
  canvas.height = G;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(G / 256, G / 257);
  ctx.fillStyle = "#000";
  ctx.fill(new Path2D(CLAUDE_LOGO_PATH));
  const data = ctx.getImageData(0, 0, G, G).data;
  const rects: [number, number, number][] = [];
  for (let row = 0; row < G; row++) {
    let col = 0;
    while (col < G) {
      if (data[(row * G + col) * 4 + 3] > 110) {
        let w = 1;
        while (col + w < G && data[(row * G + col + w) * 4 + 3] > 110) w++;
        rects.push([col, row, w]);
        col += w;
      } else {
        col++;
      }
    }
  }
  LOGO_RECTS = rects;
  return rects;
}

/* The real Claude mark, lightly pixelated by rasterizing it onto a grid (keeps its shape, which
   a sampling filter cannot). Falls back to the crisp path before hydration. */
function ClaudeLogo({
  size = 96,
  x,
  y,
  fill = "#d97757",
  className,
}: {
  size?: number;
  x?: number;
  y?: number;
  fill?: string;
  className?: string;
}) {
  const [rects, setRects] = useState<[number, number, number][] | null>(null);
  useEffect(() => setRects(computeLogoRects()), []);
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox={rects ? `0 0 ${LOGO_GRID + 1} ${LOGO_GRID + 1}` : "0 0 256 257"}
      shapeRendering="crispEdges"
      className={className}
      style={{ flex: "none", overflow: "visible" }}
      aria-hidden
    >
      {rects ? (
        rects.map(([cx, cy, w]) => (
          <rect key={`${cx}-${cy}`} x={cx} y={cy} width={w} height={1} fill={fill} />
        ))
      ) : (
        <path d={CLAUDE_LOGO_PATH} fill={fill} />
      )}
    </svg>
  );
}

/* The left wizard banner illustration: a smooth, detailed Luna-icon CRT showing Claude on
   screen, in the same gradient/gloss style as the DVD icon. Pixelated to match the era. */
function BannerArt({ className }: { className?: string }) {
  const keyCols = [26, 33, 40, 47, 54, 61, 68, 75, 82];
  return (
    <svg
      viewBox="0 0 120 116"
      className={className}
      style={{ flex: "none", filter: "url(#illus-pixelate-soft)" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="bn-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddd6c2" />
          <stop offset="55%" stopColor="#c9c0a4" />
          <stop offset="100%" stopColor="#aea587" />
        </linearGradient>
        <linearGradient id="bn-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a39a7f" />
          <stop offset="100%" stopColor="#867d64" />
        </linearGradient>
        <linearGradient id="bn-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f86d4" />
          <stop offset="45%" stopColor="#2362b6" />
          <stop offset="100%" stopColor="#173f8c" />
        </linearGradient>
        <linearGradient id="bn-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6cfb9" />
          <stop offset="100%" stopColor="#a69d80" />
        </linearGradient>
        <linearGradient id="bn-kb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddd6c0" />
          <stop offset="100%" stopColor="#b8af92" />
        </linearGradient>
        {/* A faint screen sheen behind the mark — just a little depth, no glow. */}
        <radialGradient id="bn-glow" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#cfe3fb" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#9fc2ec" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#9fc2ec" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bn-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* CRT corner darkening for screen depth. */}
        <radialGradient id="bn-vignette" cx="50%" cy="46%" r="62%">
          <stop offset="55%" stopColor="#0b1d40" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b1d40" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      {/* signal dots beaming up-right, like the classic internet-setup wizard */}
      {[
        [98, 18],
        [104, 11],
        [110, 4],
      ].map(([x, y]) => (
        <circle key={`b${x}`} cx={x} cy={y} r={2.2} fill="#ffd35a" />
      ))}
      <ellipse cx={60} cy={92} rx={42} ry={4.5} fill="#000" opacity={0.13} />
      {/* monitor body */}
      <rect
        x={14}
        y={4}
        width={92}
        height={70}
        rx={8}
        fill="url(#bn-body)"
        stroke="#7d7456"
        strokeWidth={1.4}
      />
      <rect x={17} y={6} width={86} height={3} rx={1.5} fill="#efe9d8" opacity={0.35} />
      <rect x={17} y={69} width={86} height={3} rx={1.5} fill="#8a8062" opacity={0.32} />
      {/* recessed bezel + screen */}
      <rect x={23} y={12} width={74} height={50} rx={4} fill="url(#bn-bezel)" />
      <rect x={26} y={15} width={68} height={44} rx={2} fill="#1b2331" />
      <rect x={28} y={17} width={64} height={40} rx={1.5} fill="url(#bn-screen)" />
      {/* faint screen sheen behind the mark */}
      <ellipse cx={60} cy={37} rx={19} ry={15} fill="url(#bn-glow)" />
      <ClaudeLogo size={36} x={42} y={19} fill="#e3a079" />
      {/* CRT vignette darkens the screen corners */}
      <rect x={28} y={17} width={64} height={40} rx={1.5} fill="url(#bn-vignette)" />
      {/* glassy reflection sweeping across the top of the screen */}
      <path d="M28,17 H92 V25 Q60,36 28,28 Z" fill="url(#bn-glass)" />
      <rect x={84} y={19} width={1.5} height={1.5} fill="#ffffff" opacity={0.9} />
      {/* power LED + control buttons */}
      <circle cx={89} cy={67} r={1.8} fill="#5fbf48" />
      <rect x={28} y={66} width={6} height={2} rx={1} fill="#8a8169" />
      <rect x={37} y={66} width={6} height={2} rx={1} fill="#8a8169" />
      {/* neck + base */}
      <rect x={52} y={73} width={16} height={8} fill="url(#bn-base)" />
      <path
        d="M44,90 Q44,82 52,82 H68 Q76,82 76,90 L74,93 H46 Z"
        fill="url(#bn-base)"
        stroke="#9a9173"
        strokeWidth={1}
      />
      {/* keyboard */}
      <rect
        x={18}
        y={96}
        width={80}
        height={15}
        rx={3}
        fill="url(#bn-kb)"
        stroke="#9a9173"
        strokeWidth={1}
      />
      {[100, 104].map((ky) =>
        keyCols.map((kx) => (
          <rect key={`k${kx}-${ky}`} x={kx} y={ky} width={5} height={3} rx={1} fill="#b7ae90" />
        )),
      )}
      <rect x={42} y={108} width={34} height={2.4} rx={1} fill="#b7ae90" />
      {/* mouse */}
      <rect
        x={102}
        y={98}
        width={13}
        height={16}
        rx={5}
        fill="url(#bn-kb)"
        stroke="#9a9173"
        strokeWidth={1}
      />
      <line x1={108.5} y1={99} x2={108.5} y2={104} stroke="#9a9173" strokeWidth={0.8} />
    </svg>
  );
}

function SetupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden>
      <rect x="3" y="9" width="26" height="18" fill="#dfe7f3" stroke="#7f9db9" />
      <rect x="3" y="9" width="26" height="5" fill="#316ac5" />
      <ClaudeLogo size={13} x={9.5} y={12.5} />
    </svg>
  );
}

/* ---------------- Mascot ---------------- */

/* The Claude mark given a blinking face — a pixel-art Office-Assistant-style helper. */
// Hand-drawn pixel-art eye (7×7 cells): 1 = white, 2 = dark pupil, 3 = highlight, 0 = empty.
const EYE_PATTERN = ["0111110", "1111111", "1111111", "1132211", "1122211", "1111111", "0111110"];
const EYE_PX = 6;
const EYE_FILL: Record<string, string> = { "1": "#ffffff", "2": "#241e1a", "3": "#bcd4ff" };

function pixelEye(ox: number, oy: number) {
  const cells: React.ReactNode[] = [];
  EYE_PATTERN.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch === "0") return;
      cells.push(
        <rect
          key={`${ox}-${r}-${c}`}
          x={ox + c * EYE_PX}
          y={oy + r * EYE_PX}
          width={EYE_PX}
          height={EYE_PX}
          fill={EYE_FILL[ch]}
        />,
      );
    });
  });
  return cells;
}

function MascotFace() {
  return (
    <svg
      width={92}
      height={92}
      viewBox="0 0 256 257"
      shapeRendering="crispEdges"
      className="mascot-face"
      aria-hidden
    >
      <ClaudeLogo size={256} x={0} y={0} />
      <g className="mascot-eyes">
        {pixelEye(86, 96)}
        {pixelEye(132, 96)}
      </g>
      {/* pixel smile */}
      {[
        [110, 148],
        [116, 154],
        [122, 156],
        [128, 156],
        [134, 154],
        [140, 148],
      ].map(([x, y]) => (
        <rect key={`sm${x}`} x={x} y={y} width={EYE_PX} height={EYE_PX} fill="#8a3f24" />
      ))}
    </svg>
  );
}

const MASCOT_GREETING =
  "Hi! I'm Claude. It looks like you're trying to write some code — want a hand? Ask me anything.";

function ClaudeMascot() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/experiment/chat" }),
  });
  const streaming = status === "submitted" || status === "streaming";

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const reply = lastAssistant
    ? lastAssistant.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("")
    : "";
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const showThinking = streaming && !reply;
  const bubbleText = error
    ? "Hmm, I couldn't reach the server just now. Give it another try in a moment!"
    : messages.length === 0
      ? MASCOT_GREETING
      : reply;

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || streaming) return;
      sendMessage({ text });
      setInput("");
    },
    [input, streaming, sendMessage],
  );

  return (
    <div className="mascot">
      <div className="mascot-bubble">
        {messages.length > 0 && lastUser && (
          <div className="mascot-you">
            you:{" "}
            {lastUser.parts
              .filter((p) => p.type === "text")
              .map((p) => p.text)
              .join("")}
          </div>
        )}
        <div className="mascot-bubble-text">
          {showThinking ? <span className="mascot-think">thinking…</span> : bubbleText}
          {streaming && reply && <span className="mascot-caret" />}
        </div>
        <form className="mascot-form" onSubmit={onSubmit}>
          <input
            className="xp-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Claude…"
            spellCheck={false}
            disabled={streaming}
          />
          <button
            type="submit"
            className="xp-btn xp-btn-field"
            data-default
            disabled={streaming || !input.trim()}
          >
            Ask
          </button>
        </form>
      </div>
      <div className="mascot-char">
        <MascotFace />
      </div>
    </div>
  );
}

/* A detailed Luna-era DVD-ROM icon — smooth gradients, a prismatic data ring and a glossy
   highlight, the way early-2000s XP icons looked (not chunky pixels). */
/* CD/DVD rendered in CSS so the prismatic ring can be a real angular (conic) rainbow — the way
   light actually diffracts off the disc — instead of a flat diagonal smear. The annulus layers
   are masked to a ring (hub hole → rim); a light sheen gives it a single highlight. */
function XpDvdIcon({ size = 46 }: { size?: number }) {
  const ring =
    "radial-gradient(circle closest-side, transparent 0 17%, #000 21% 96%, transparent 100%)";
  const layer: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
  };
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        filter: "url(#illus-pixelate-soft)",
      }}
    >
      {/* silver body + rim */}
      <div
        style={{
          ...layer,
          background:
            "radial-gradient(circle at 50% 40%, #fcfdff 0%, #e2e7f0 40%, #aeb7cb 72%, #79849c 100%)",
          boxShadow: "0 1.5px 2px rgba(0,0,0,0.28), inset 0 0 0 0.75px #5f6a82",
        }}
      />
      {/* angular prismatic rainbow — two spectrum cycles around the disc */}
      <div
        style={{
          ...layer,
          background:
            "conic-gradient(from 150deg, #ff4d6d, #ff9a3d, #ffe24d, #6ee86e, #3dd0ff, #6a7bff, #c44dff, #ff4d9e, #ff4d6d, #ff9a3d, #ffe24d, #6ee86e, #3dd0ff, #6a7bff, #c44dff, #ff4d9e, #ff4d6d)",
          opacity: 0.5,
          mixBlendMode: "screen",
          WebkitMaskImage: ring,
          maskImage: ring,
        }}
      />
      {/* faint concentric data tracks */}
      <div
        style={{
          ...layer,
          background:
            "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0 1.3px, rgba(120,130,150,0.13) 1.4px 1.5px)",
          WebkitMaskImage: ring,
          maskImage: ring,
        }}
      />
      {/* single light sheen, brighter upper-left */}
      <div
        style={{
          ...layer,
          background:
            "radial-gradient(55% 42% at 33% 27%, rgba(255,255,255,0.82), rgba(255,255,255,0) 62%)",
        }}
      />
      {/* hub */}
      <div
        style={{
          ...layer,
          inset: "33%",
          background: "radial-gradient(circle at 50% 38%, #fafcff, #cdd4e1 60%, #9aa3b6)",
          boxShadow: "inset 0 0 0 1px rgba(150,160,180,0.7), 0 0 0 0.5px #8b93a6",
        }}
      />
      {/* clamping ring */}
      <div style={{ ...layer, inset: "39%", boxShadow: "inset 0 0 0 1px #c4ccda" }} />
      {/* spindle hole */}
      <div
        style={{
          ...layer,
          inset: "43%",
          background: "radial-gradient(circle, #465067 0 30%, #2a3140 36%)",
          boxShadow: "inset 0 0 0 1px #111521",
        }}
      />
    </div>
  );
}

/* Glossy Luna folder icon. */
function XpFolderIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ flex: "none", filter: "url(#illus-pixelate-soft)" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="fld-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="50%" stopColor="#ffce5e" />
          <stop offset="100%" stopColor="#efa928" />
        </linearGradient>
        <linearGradient id="fld-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8cd6a" />
          <stop offset="100%" stopColor="#dca02b" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="40" rx="19" ry="2.4" fill="#000" opacity="0.16" />
      {/* back flap + tab */}
      <path
        d="M6,14 q0,-2 2,-2 h9 l3,3 h22 q2,0 2,2 v7 h-40 z"
        fill="url(#fld-back)"
        stroke="#bf8019"
        strokeWidth="0.8"
      />
      {/* two sheets of paper peeking out */}
      <rect
        x="13"
        y="16"
        width="24"
        height="13"
        rx="1"
        fill="#efece0"
        stroke="#d6cb9f"
        strokeWidth="0.5"
      />
      <rect
        x="10"
        y="18"
        width="28"
        height="12"
        rx="1"
        fill="#fdfdf6"
        stroke="#ddd2a8"
        strokeWidth="0.6"
      />
      <rect x="13" y="20.5" width="16" height="0.8" fill="#cfe0f4" />
      <rect x="13" y="23" width="20" height="0.8" fill="#e7dcc0" />
      {/* front cover */}
      <rect
        x="4"
        y="21"
        width="40"
        height="17"
        rx="2.6"
        fill="url(#fld-front)"
        stroke="#bf8019"
        strokeWidth="0.9"
      />
      <rect x="5.4" y="22.2" width="37.2" height="3" rx="1.5" fill="#fff" opacity="0.45" />
      <rect x="5.4" y="35.2" width="37.2" height="2" rx="1" fill="#a8741a" opacity="0.32" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden>
      <path d="M16 3 L31 29 H1 Z" fill="#ffd400" stroke="#b59a00" strokeWidth="1" />
      <rect x="14.4" y="12" width="3.2" height="9" rx="1.4" fill="#000" />
      <circle cx="16" cy="25" r="1.9" fill="#000" />
    </svg>
  );
}

function StartOrb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="#fff" />
      <path d="M8 1 a7 7 0 0 1 0 14 Z" fill="#e23b2e" />
      <path d="M8 1 a7 7 0 0 0 0 14 Z" fill="#5db021" />
    </svg>
  );
}

function Volume() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
      <path d="M2 6 H5 L9 3 V13 L5 10 H2 Z" fill="#fff" />
      <path d="M11 5 q2 3 0 6" stroke="#fff" fill="none" strokeWidth="1" />
    </svg>
  );
}

function Clock() {
  return <span style={{ color: "#fff", fontSize: 11 }}>11:08 PM</span>;
}
