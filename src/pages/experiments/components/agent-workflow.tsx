import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, animate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const COL = {
  memory: 100,
  main: 220,
  web: 340,
  thinking: 460,
};

const ROW = 56;
const DOT_R = 4;
const CANVAS_W = 560;

interface NodeDef {
  id: string;
  label: string;
  agent: string;
  x: number;
  y: number;
  phase: number;
}

const NODES: NodeDef[] = [
  { id: "m1", label: "Initialize task", agent: "main", x: COL.main, y: 1 * ROW, phase: 0 },
  { id: "m2", label: "Parse request", agent: "main", x: COL.main, y: 2 * ROW, phase: 1 },
  { id: "m3", label: "Plan execution", agent: "main", x: COL.main, y: 3 * ROW, phase: 2 },

  { id: "mem1", label: "Load context", agent: "memory", x: COL.memory, y: 5 * ROW, phase: 4 },
  { id: "mem2", label: "Retrieve history", agent: "memory", x: COL.memory, y: 6 * ROW, phase: 5 },

  { id: "w1", label: "Search sources", agent: "web", x: COL.web, y: 5 * ROW, phase: 4 },
  { id: "w2", label: "Extract data", agent: "web", x: COL.web, y: 6 * ROW, phase: 5 },
  { id: "w3", label: "Validate findings", agent: "web", x: COL.web, y: 7 * ROW, phase: 6 },

  { id: "t1", label: "Analyze problem", agent: "thinking", x: COL.thinking, y: 5 * ROW, phase: 4 },
  { id: "t2", label: "Generate options", agent: "thinking", x: COL.thinking, y: 6 * ROW, phase: 5 },
  { id: "t3", label: "Evaluate tradeoffs", agent: "thinking", x: COL.thinking, y: 7 * ROW, phase: 6 },
  { id: "t4", label: "Select approach", agent: "thinking", x: COL.thinking, y: 8 * ROW, phase: 7 },

  { id: "m4", label: "Merge results", agent: "main", x: COL.main, y: 10 * ROW, phase: 9 },
  { id: "m5", label: "Compose response", agent: "main", x: COL.main, y: 11 * ROW, phase: 10 },
  { id: "m6", label: "Deliver output", agent: "main", x: COL.main, y: 12 * ROW, phase: 11 },
];

const TOTAL_PHASES = 12;
const PHASE_DURATION = 0.35;

const COLORS: Record<string, string> = {
  main: "var(--text-primary)",
  memory: "var(--text-tertiary)",
  web: "var(--text-quaternary)",
  thinking: "var(--text-secondary)",
};

const TEXT_CLASSES: Record<string, string> = {
  main: "text-primary",
  memory: "text-tertiary",
  web: "text-quaternary",
  thinking: "text-secondary",
};

interface Seg {
  from: [number, number];
  to: [number, number];
  agent: string;
  phase: number;
}

const LINES: Seg[] = [
  { from: [COL.main, 1 * ROW], to: [COL.main, 3 * ROW], agent: "main", phase: 0 },
  { from: [COL.main, 3 * ROW], to: [COL.memory, 5 * ROW], agent: "memory", phase: 3 },
  { from: [COL.main, 3 * ROW], to: [COL.web, 5 * ROW], agent: "web", phase: 3 },
  { from: [COL.main, 3 * ROW], to: [COL.thinking, 5 * ROW], agent: "thinking", phase: 3 },
  { from: [COL.memory, 5 * ROW], to: [COL.memory, 6 * ROW], agent: "memory", phase: 4 },
  { from: [COL.web, 5 * ROW], to: [COL.web, 7 * ROW], agent: "web", phase: 4 },
  { from: [COL.thinking, 5 * ROW], to: [COL.thinking, 8 * ROW], agent: "thinking", phase: 4 },
  { from: [COL.memory, 6 * ROW], to: [COL.main, 10 * ROW], agent: "memory", phase: 8 },
  { from: [COL.web, 7 * ROW], to: [COL.main, 10 * ROW], agent: "web", phase: 8 },
  { from: [COL.thinking, 8 * ROW], to: [COL.main, 10 * ROW], agent: "thinking", phase: 8 },
  { from: [COL.main, 10 * ROW], to: [COL.main, 12 * ROW], agent: "main", phase: 9 },
];

interface AgentLabel {
  label: string;
  agent: string;
  x: number;
  y: number;
  phase: number;
}

const AGENT_LABELS: AgentLabel[] = [
  { label: "Main Agent", agent: "main", x: COL.main, y: 0.3 * ROW, phase: 0 },
  { label: "Memory", agent: "memory", x: COL.memory, y: 4.2 * ROW, phase: 3 },
  { label: "Research", agent: "web", x: COL.web, y: 4.2 * ROW, phase: 3 },
  { label: "Thinking", agent: "thinking", x: COL.thinking, y: 4.2 * ROW, phase: 3 },
];

function curvePath(fx: number, fy: number, tx: number, ty: number): string {
  if (fx === tx) return `M${fx},${fy}L${tx},${ty}`;
  const my = fy + (ty - fy) * 0.45;
  return `M${fx},${fy}C${fx},${my} ${tx},${my} ${tx},${ty}`;
}

function labelSide(agent: string): "left" | "right" {
  if (agent === "memory") return "left";
  return "right";
}

const VIEWPORT_H = 380;
const CANVAS_H = 13.5 * ROW;

function bottomYAtPhase(phase: number): number {
  let maxY = 0;
  for (const n of NODES) {
    if (n.phase <= phase) maxY = Math.max(maxY, n.y);
  }
  return maxY;
}

export const AgentWorkflow = () => {
  const [playing, setPlaying] = useState(false);
  const [key, setKey] = useState(0);
  const [buttonVisible, setButtonVisible] = useState(true);
  const scrollY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const trigger = useCallback(() => {
    setButtonVisible(false);
    setTimeout(() => {
      setPlaying(false);
      setKey((k) => k + 1);
      requestAnimationFrame(() => {
        setPlaying(true);
      });
    }, 300);
  }, []);

  useEffect(() => {
    if (!playing) {
      scrollY.set(0);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    for (let p = 0; p <= TOTAL_PHASES; p++) {
      const t = setTimeout(() => {
        const bottom = bottomYAtPhase(p);
        const targetScroll = Math.max(0, bottom - VIEWPORT_H + 100);
        animate(scrollY, -targetScroll, { duration: 0.5, ease: "easeInOut" });
      }, p * PHASE_DURATION * 1000 + 200);
      timeouts.push(t);
    }

    const resetTimeout = setTimeout(() => {
      setButtonVisible(true);
    }, (TOTAL_PHASES + 2) * PHASE_DURATION * 1000 + 600);
    timeouts.push(resetTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, [playing, key, scrollY]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <AnimatePresence>
        {buttonVisible && (
          <motion.button
            onClick={trigger}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="rounded-full border border-secondary bg-primary px-5 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-surface-secondary"
          >
            Trigger
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {playing && (
          <motion.div
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center overflow-hidden relative"
            style={{ height: VIEWPORT_H }}
            ref={containerRef}
          >
            <motion.div style={{ y: scrollY }} className="relative">
              <svg
                width={CANVAS_W}
                height={CANVAS_H}
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                className="overflow-visible"
              >
                {LINES.map((seg, i) => {
                  const d = curvePath(seg.from[0], seg.from[1], seg.to[0], seg.to[1]);
                  const delay = seg.phase * PHASE_DURATION;
                  return (
                    <motion.path
                      key={`l${i}`}
                      d={d}
                      fill="none"
                      stroke={COLORS[seg.agent]}
                      strokeWidth={1}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      transition={{ delay, duration: 0.4, ease: "easeInOut" }}
                    />
                  );
                })}

                {NODES.map((node) => {
                  const delay = node.phase * PHASE_DURATION;
                  const side = labelSide(node.agent);
                  const tx = side === "left" ? node.x - 10 : node.x + 10;
                  const anchor = side === "left" ? "end" : "start";

                  return (
                    <g key={node.id}>
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={DOT_R}
                        fill={COLORS[node.agent]}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay, duration: 0.2, ease: "easeOut" }}
                      />
                      <motion.text
                        x={tx}
                        y={node.y + 3.5}
                        textAnchor={anchor}
                        fill="currentColor"
                        className={cn("text-[10px]", TEXT_CLASSES[node.agent])}
                        style={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: delay + 0.1, duration: 0.25 }}
                      >
                        {node.label}
                      </motion.text>
                    </g>
                  );
                })}

                {AGENT_LABELS.map((al) => {
                  const delay = al.phase * PHASE_DURATION;
                  return (
                    <motion.text
                      key={`al-${al.agent}`}
                      x={al.x}
                      y={al.y}
                      textAnchor="middle"
                      fill="currentColor"
                      className={cn(
                        "text-[9px] font-medium uppercase tracking-widest",
                        TEXT_CLASSES[al.agent],
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ delay, duration: 0.3 }}
                    >
                      {al.label}
                    </motion.text>
                  );
                })}
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
