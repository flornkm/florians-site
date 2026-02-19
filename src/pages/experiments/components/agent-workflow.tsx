import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, animate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const COL_GAP = 120;
const COL_START = 40;
const COLS = {
  main: COL_START,
  memory: COL_START + COL_GAP,
  web: COL_START + COL_GAP * 2,
  thinking: COL_START + COL_GAP * 3,
};

const ROW_H = 48;
const DOT_R = 4.5;
const STROKE_W = 1.5;
const CANVAS_W = COL_START + COL_GAP * 3 + 140;

const STEP_DELAY = 0.6;

type Agent = "main" | "memory" | "web" | "thinking";

interface Step {
  id: string;
  label: string;
  agent: Agent;
  col: number;
  row: number;
  seq: number;
}

const STEPS: Step[] = [
  { id: "m1", label: "Initialize task", agent: "main", col: COLS.main, row: 0, seq: 0 },
  { id: "m2", label: "Parse request", agent: "main", col: COLS.main, row: 1, seq: 1 },
  { id: "m3", label: "Plan execution", agent: "main", col: COLS.main, row: 2, seq: 2 },

  { id: "mem1", label: "Load context", agent: "memory", col: COLS.memory, row: 4, seq: 4 },
  { id: "mem2", label: "Retrieve history", agent: "memory", col: COLS.memory, row: 5, seq: 5 },

  { id: "w1", label: "Search sources", agent: "web", col: COLS.web, row: 4, seq: 4 },
  { id: "w2", label: "Extract data", agent: "web", col: COLS.web, row: 5, seq: 5 },
  { id: "w3", label: "Validate findings", agent: "web", col: COLS.web, row: 6, seq: 6 },

  { id: "t1", label: "Analyze problem", agent: "thinking", col: COLS.thinking, row: 4, seq: 4 },
  { id: "t2", label: "Generate options", agent: "thinking", col: COLS.thinking, row: 5, seq: 5 },
  { id: "t3", label: "Evaluate tradeoffs", agent: "thinking", col: COLS.thinking, row: 6, seq: 6 },
  { id: "t4", label: "Select approach", agent: "thinking", col: COLS.thinking, row: 7, seq: 7 },

  { id: "m4", label: "Merge results", agent: "main", col: COLS.main, row: 9, seq: 9 },
  { id: "m5", label: "Compose response", agent: "main", col: COLS.main, row: 10, seq: 10 },
  { id: "m6", label: "Deliver output", agent: "main", col: COLS.main, row: 11, seq: 11 },
];

const TOTAL_SEQ = 12;

const Y_OFFSET = 50;

function nodeY(row: number): number {
  return Y_OFFSET + row * ROW_H;
}

const AGENT_COLORS: Record<Agent, string> = {
  main: "var(--text-primary)",
  memory: "var(--text-tertiary)",
  web: "var(--text-tertiary)",
  thinking: "var(--text-tertiary)",
};

const AGENT_TEXT: Record<Agent, string> = {
  main: "text-primary",
  memory: "text-tertiary",
  web: "text-tertiary",
  thinking: "text-tertiary",
};

interface LineDef {
  d: string;
  agent: Agent;
  seq: number;
}

function buildLines(): LineDef[] {
  const lines: LineDef[] = [];

  for (let i = 0; i < 2; i++) {
    const y1 = nodeY(i);
    const y2 = nodeY(i + 1);
    lines.push({
      d: `M${COLS.main},${y1}L${COLS.main},${y2}`,
      agent: "main",
      seq: i,
    });
  }

  const branchY = nodeY(2);
  const forkEndY = nodeY(3);
  const branchAgents: Agent[] = ["memory", "web", "thinking"];
  for (const a of branchAgents) {
    const col = COLS[a];
    lines.push({
      d: `M${COLS.main},${branchY}L${COLS.main},${forkEndY}L${col},${forkEndY}L${col},${nodeY(4)}`,
      agent: a,
      seq: 3,
    });
  }

  const branchCommits: { agent: Agent; rows: number[] }[] = [
    { agent: "memory", rows: [4, 5] },
    { agent: "web", rows: [4, 5, 6] },
    { agent: "thinking", rows: [4, 5, 6, 7] },
  ];
  for (const bc of branchCommits) {
    for (let i = 0; i < bc.rows.length - 1; i++) {
      lines.push({
        d: `M${COLS[bc.agent]},${nodeY(bc.rows[i])}L${COLS[bc.agent]},${nodeY(bc.rows[i + 1])}`,
        agent: bc.agent,
        seq: bc.rows[i],
      });
    }
  }

  const mergeY = nodeY(8);
  const mergeTargetY = nodeY(9);
  const mergeSources: { agent: Agent; lastRow: number }[] = [
    { agent: "memory", lastRow: 5 },
    { agent: "web", lastRow: 6 },
    { agent: "thinking", lastRow: 7 },
  ];
  for (const ms of mergeSources) {
    const col = COLS[ms.agent];
    lines.push({
      d: `M${col},${nodeY(ms.lastRow)}L${col},${mergeY}L${COLS.main},${mergeY}L${COLS.main},${mergeTargetY}`,
      agent: ms.agent,
      seq: 8,
    });
  }

  for (let i = 9; i < 11; i++) {
    lines.push({
      d: `M${COLS.main},${nodeY(i)}L${COLS.main},${nodeY(i + 1)}`,
      agent: "main",
      seq: i,
    });
  }

  return lines;
}

const LINES = buildLines();

interface AgentLabel {
  label: string;
  agent: Agent;
  x: number;
  y: number;
  seq: number;
}

const AGENT_LABELS: AgentLabel[] = [
  { label: "Main Agent", agent: "main", x: COLS.main, y: nodeY(0) - 20, seq: 0 },
  { label: "Memory", agent: "memory", x: COLS.memory, y: nodeY(4) - 16, seq: 3 },
  { label: "Research", agent: "web", x: COLS.web, y: nodeY(4) - 16, seq: 3 },
  { label: "Thinking", agent: "thinking", x: COLS.thinking, y: nodeY(4) - 16, seq: 3 },
];

const VIEWPORT_H = 420;
const CANVAS_H = nodeY(12) + 40;

export const AgentWorkflow = () => {
  const [playing, setPlaying] = useState(false);
  const [activeSeq, setActiveSeq] = useState(-1);
  const [key, setKey] = useState(0);
  const [buttonVisible, setButtonVisible] = useState(true);
  const scrollY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const trigger = useCallback(() => {
    setButtonVisible(false);
    setTimeout(() => {
      setActiveSeq(-1);
      setPlaying(false);
      setKey((k) => k + 1);
      requestAnimationFrame(() => {
        setPlaying(true);
      });
    }, 250);
  }, []);

  useEffect(() => {
    if (!playing) {
      scrollY.set(0);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    for (let s = 0; s <= TOTAL_SEQ; s++) {
      const t = setTimeout(() => {
        setActiveSeq(s);

        let maxY = 0;
        for (const step of STEPS) {
          if (step.seq <= s) maxY = Math.max(maxY, nodeY(step.row));
        }
        const targetScroll = Math.max(0, maxY - VIEWPORT_H + 120);
        animate(scrollY, -targetScroll, { duration: 0.45, ease: "easeInOut" });
      }, s * STEP_DELAY * 1000 + 150);
      timeouts.push(t);
    }

    const resetTimeout = setTimeout(() => {
      setButtonVisible(true);
    }, (TOTAL_SEQ + 2) * STEP_DELAY * 1000 + 400);
    timeouts.push(resetTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, [playing, key, scrollY]);

  return (
    <div className="flex flex-col items-start gap-6 w-full h-full px-8 py-6">
      <div className="w-full flex justify-start">
        <AnimatePresence>
          {buttonVisible && (
            <motion.button
              onClick={trigger}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-full border border-secondary bg-primary px-5 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-secondary"
            >
              Trigger
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {playing && (
          <motion.div
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full overflow-hidden relative"
            style={{ height: VIEWPORT_H }}
            ref={containerRef}
          >
            <motion.div style={{ y: scrollY }}>
              <svg
                width={CANVAS_W}
                height={CANVAS_H}
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                className="overflow-visible"
              >
                {LINES.map((line, i) => {
                  const visible = activeSeq >= line.seq;
                  return (
                    <motion.path
                      key={`line-${key}-${i}`}
                      d={line.d}
                      fill="none"
                      stroke={AGENT_COLORS[line.agent]}
                      strokeWidth={STROKE_W}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={
                        visible
                          ? { pathLength: 1, opacity: line.agent === "main" ? 0.6 : 0.35 }
                          : { pathLength: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  );
                })}

                {AGENT_LABELS.map((al) => {
                  const visible = activeSeq >= al.seq;
                  return (
                    <motion.text
                      key={`label-${key}-${al.agent}`}
                      x={al.x}
                      y={al.y}
                      textAnchor="start"
                      fill="currentColor"
                      className={cn(
                        "text-[9px] font-medium uppercase tracking-[0.12em]",
                        AGENT_TEXT[al.agent],
                      )}
                      initial={{ opacity: 0 }}
                      animate={visible ? { opacity: 0.45 } : { opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {al.label}
                    </motion.text>
                  );
                })}

                {STEPS.map((step) => {
                  const isActive = activeSeq === step.seq;
                  const isComplete = activeSeq > step.seq;
                  const isVisible = activeSeq >= step.seq;
                  const x = step.col;
                  const y = nodeY(step.row);

                  return (
                    <g key={`node-${key}-${step.id}`}>
                      {isActive && (
                        <motion.circle
                          cx={x}
                          cy={y}
                          r={12}
                          fill="none"
                          stroke={AGENT_COLORS[step.agent]}
                          strokeWidth={1}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.15, 0.3, 0.15] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}

                      <motion.circle
                        cx={x}
                        cy={y}
                        r={DOT_R}
                        fill={AGENT_COLORS[step.agent]}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={
                          isVisible
                            ? { scale: 1, opacity: isComplete ? 1 : 0.8 }
                            : { scale: 0, opacity: 0 }
                        }
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />

                      <motion.text
                        x={x + 14}
                        y={y + 4}
                        textAnchor="start"
                        fill="currentColor"
                        className={cn(
                          "text-[11px]",
                          step.agent === "main" ? "text-primary" : "text-tertiary",
                        )}
                        initial={{ opacity: 0, x: x + 10 }}
                        animate={
                          isVisible
                            ? { opacity: isActive ? 0.9 : 0.55, x: x + 14 }
                            : { opacity: 0, x: x + 10 }
                        }
                        transition={{ duration: 0.25 }}
                      >
                        {step.label}
                      </motion.text>
                    </g>
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
