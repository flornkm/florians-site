import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

interface CommitNode {
  id: string;
  label: string;
  agent: string;
  x: number;
  y: number;
}

interface PathSegment {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

const AGENT_COLORS: Record<string, { dot: string; line: string; label: string }> = {
  main: {
    dot: "var(--text-primary)",
    line: "var(--text-primary)",
    label: "text-primary",
  },
  memory: {
    dot: "var(--text-tertiary)",
    line: "var(--text-tertiary)",
    label: "text-tertiary",
  },
  web: {
    dot: "var(--text-quaternary)",
    line: "var(--text-quaternary)",
    label: "text-quaternary",
  },
  thinking: {
    dot: "var(--text-secondary)",
    line: "var(--text-secondary)",
    label: "text-secondary",
  },
};

const COL = {
  memory: 60,
  main: 160,
  web: 260,
  thinking: 360,
};

const ROW_HEIGHT = 52;
const NODE_RADIUS = 5;
const SVG_WIDTH = 420;

const COMMITS: CommitNode[] = [
  { id: "m1", label: "Initialize task", agent: "main", x: COL.main, y: 1 * ROW_HEIGHT },
  { id: "m2", label: "Parse user request", agent: "main", x: COL.main, y: 2 * ROW_HEIGHT },
  { id: "m3", label: "Plan execution", agent: "main", x: COL.main, y: 3 * ROW_HEIGHT },

  { id: "mem1", label: "Load context", agent: "memory", x: COL.memory, y: 4.5 * ROW_HEIGHT },
  { id: "mem2", label: "Retrieve history", agent: "memory", x: COL.memory, y: 5.5 * ROW_HEIGHT },

  { id: "w1", label: "Search sources", agent: "web", x: COL.web, y: 4.5 * ROW_HEIGHT },
  { id: "w2", label: "Extract data", agent: "web", x: COL.web, y: 5.5 * ROW_HEIGHT },
  { id: "w3", label: "Validate findings", agent: "web", x: COL.web, y: 6.5 * ROW_HEIGHT },

  { id: "t1", label: "Analyze problem", agent: "thinking", x: COL.thinking, y: 4.5 * ROW_HEIGHT },
  { id: "t2", label: "Generate options", agent: "thinking", x: COL.thinking, y: 5.5 * ROW_HEIGHT },
  { id: "t3", label: "Evaluate tradeoffs", agent: "thinking", x: COL.thinking, y: 6.5 * ROW_HEIGHT },
  { id: "t4", label: "Select approach", agent: "thinking", x: COL.thinking, y: 7.5 * ROW_HEIGHT },

  { id: "m4", label: "Merge results", agent: "main", x: COL.main, y: 9 * ROW_HEIGHT },
  { id: "m5", label: "Compose response", agent: "main", x: COL.main, y: 10 * ROW_HEIGHT },
  { id: "m6", label: "Deliver output", agent: "main", x: COL.main, y: 11 * ROW_HEIGHT },
];

const BRANCH_PATHS: PathSegment[] = [
  { from: { x: COL.main, y: 3 * ROW_HEIGHT }, to: { x: COL.memory, y: 4.5 * ROW_HEIGHT } },
  { from: { x: COL.main, y: 3 * ROW_HEIGHT }, to: { x: COL.web, y: 4.5 * ROW_HEIGHT } },
  { from: { x: COL.main, y: 3 * ROW_HEIGHT }, to: { x: COL.thinking, y: 4.5 * ROW_HEIGHT } },
];

const MERGE_PATHS: PathSegment[] = [
  { from: { x: COL.memory, y: 5.5 * ROW_HEIGHT }, to: { x: COL.main, y: 9 * ROW_HEIGHT } },
  { from: { x: COL.web, y: 6.5 * ROW_HEIGHT }, to: { x: COL.main, y: 9 * ROW_HEIGHT } },
  { from: { x: COL.thinking, y: 7.5 * ROW_HEIGHT }, to: { x: COL.main, y: 9 * ROW_HEIGHT } },
];

const AGENT_LINE_SEGMENTS: PathSegment[] = [
  { from: { x: COL.main, y: 1 * ROW_HEIGHT }, to: { x: COL.main, y: 3 * ROW_HEIGHT } },
  { from: { x: COL.memory, y: 4.5 * ROW_HEIGHT }, to: { x: COL.memory, y: 5.5 * ROW_HEIGHT } },
  { from: { x: COL.web, y: 4.5 * ROW_HEIGHT }, to: { x: COL.web, y: 6.5 * ROW_HEIGHT } },
  { from: { x: COL.thinking, y: 4.5 * ROW_HEIGHT }, to: { x: COL.thinking, y: 7.5 * ROW_HEIGHT } },
  { from: { x: COL.main, y: 9 * ROW_HEIGHT }, to: { x: COL.main, y: 11 * ROW_HEIGHT } },
];

const AGENT_LABELS: { agent: string; label: string; x: number; y: number }[] = [
  { agent: "main", label: "Main Agent", x: COL.main, y: 0.3 * ROW_HEIGHT },
  { agent: "memory", label: "Memory Recap", x: COL.memory, y: 3.8 * ROW_HEIGHT },
  { agent: "web", label: "Web Research", x: COL.web, y: 3.8 * ROW_HEIGHT },
  { agent: "thinking", label: "Deep Thinking", x: COL.thinking, y: 3.8 * ROW_HEIGHT },
];

const LABEL_SIDE: Record<string, "left" | "right"> = {
  main: "left",
  memory: "left",
  web: "right",
  thinking: "right",
};

function getAgentForSegment(seg: PathSegment): string {
  if (seg.from.x === COL.memory || seg.to.x === COL.memory) return "memory";
  if (seg.from.x === COL.thinking || seg.to.x === COL.thinking) return "thinking";
  if (seg.from.x === COL.web || seg.to.x === COL.web) return "web";
  return "main";
}

function buildCurvePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  if (from.x === to.x) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  const midY = from.y + (to.y - from.y) * 0.4;
  return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
}

const TOTAL_SVG_HEIGHT = 12 * ROW_HEIGHT;

const PHASE_TIMING = {
  mainInitial: 0,
  labels: 0.3,
  branching: 1.2,
  branchCommits: 1.6,
  merging: 3.2,
  mainFinal: 3.8,
};

const AnimatedPath = ({
  d,
  color,
  delay,
  duration = 0.5,
}: {
  d: string;
  color: string;
  delay: number;
  duration?: number;
}) => (
  <motion.path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={1.5}
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ delay, duration, ease: "easeInOut" }}
  />
);

const AnimatedDot = ({
  cx,
  cy,
  color,
  delay,
}: {
  cx: number;
  cy: number;
  color: string;
  delay: number;
}) => (
  <motion.circle
    cx={cx}
    cy={cy}
    r={NODE_RADIUS}
    fill={color}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, duration: 0.25, ease: "easeOut" }}
  />
);

const AnimatedCommitLabel = ({
  x,
  y,
  label,
  agentKey,
  delay,
}: {
  x: number;
  y: number;
  label: string;
  agentKey: string;
  delay: number;
}) => {
  const side = LABEL_SIDE[agentKey] || "right";
  const textX = side === "left" ? x - 14 : x + 14;
  const textAnchor = side === "left" ? "end" : "start";

  return (
    <motion.text
      x={textX}
      y={y + 4}
      textAnchor={textAnchor}
      fill="currentColor"
      className={cn("text-[11px]", AGENT_COLORS[agentKey].label)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      {label}
    </motion.text>
  );
};

export const AgentWorkflow = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const handleTrigger = useCallback(() => {
    setIsPlaying(false);
    setAnimKey((k) => k + 1);
    requestAnimationFrame(() => {
      setIsPlaying(true);
    });
  }, []);

  const getCommitDelay = (commit: CommitNode): number => {
    if (commit.agent === "main" && commit.y <= 3 * ROW_HEIGHT) {
      const index = ["m1", "m2", "m3"].indexOf(commit.id);
      return PHASE_TIMING.mainInitial + index * 0.3;
    }

    if (commit.agent === "memory") {
      const index = ["mem1", "mem2"].indexOf(commit.id);
      return PHASE_TIMING.branchCommits + index * 0.3;
    }
    if (commit.agent === "web") {
      const index = ["w1", "w2", "w3"].indexOf(commit.id);
      return PHASE_TIMING.branchCommits + index * 0.3;
    }
    if (commit.agent === "thinking") {
      const index = ["t1", "t2", "t3", "t4"].indexOf(commit.id);
      return PHASE_TIMING.branchCommits + index * 0.3;
    }

    if (commit.id === "m4") return PHASE_TIMING.mainFinal;
    if (commit.id === "m5") return PHASE_TIMING.mainFinal + 0.3;
    if (commit.id === "m6") return PHASE_TIMING.mainFinal + 0.6;

    return 0;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={handleTrigger}
        className="rounded-full bg-accent-primary px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-primary-hover"
      >
        Trigger
      </button>
      <AnimatePresence mode="wait">
        {isPlaying && (
          <motion.div
            key={animKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <svg
              width={SVG_WIDTH}
              height={TOTAL_SVG_HEIGHT}
              viewBox={`0 0 ${SVG_WIDTH} ${TOTAL_SVG_HEIGHT}`}
              className="overflow-visible"
            >
              {AGENT_LINE_SEGMENTS.map((seg, i) => {
                const agent = getAgentForSegment(seg);
                let delay: number;
                if (seg.from.y <= 3 * ROW_HEIGHT && seg.to.y <= 3 * ROW_HEIGHT) {
                  delay = PHASE_TIMING.mainInitial;
                } else if (seg.from.y >= 9 * ROW_HEIGHT) {
                  delay = PHASE_TIMING.mainFinal;
                } else {
                  delay = PHASE_TIMING.branchCommits;
                }
                return (
                  <AnimatedPath
                    key={`line-${i}`}
                    d={`M ${seg.from.x} ${seg.from.y} L ${seg.to.x} ${seg.to.y}`}
                    color={AGENT_COLORS[agent].line}
                    delay={delay}
                    duration={0.6}
                  />
                );
              })}

              {BRANCH_PATHS.map((seg, i) => {
                const agent = getAgentForSegment(seg);
                return (
                  <AnimatedPath
                    key={`branch-${i}`}
                    d={buildCurvePath(seg.from, seg.to)}
                    color={AGENT_COLORS[agent].line}
                    delay={PHASE_TIMING.branching + i * 0.1}
                    duration={0.4}
                  />
                );
              })}

              {MERGE_PATHS.map((seg, i) => {
                const agent = getAgentForSegment(seg);
                return (
                  <AnimatedPath
                    key={`merge-${i}`}
                    d={buildCurvePath(seg.from, seg.to)}
                    color={AGENT_COLORS[agent].line}
                    delay={PHASE_TIMING.merging + i * 0.15}
                    duration={0.5}
                  />
                );
              })}

              {COMMITS.map((commit) => (
                <AnimatedDot
                  key={commit.id}
                  cx={commit.x}
                  cy={commit.y}
                  color={AGENT_COLORS[commit.agent].dot}
                  delay={getCommitDelay(commit)}
                />
              ))}

              {COMMITS.map((commit) => (
                <AnimatedCommitLabel
                  key={`label-${commit.id}`}
                  x={commit.x}
                  y={commit.y}
                  label={commit.label}
                  agentKey={commit.agent}
                  delay={getCommitDelay(commit) + 0.1}
                />
              ))}

              {AGENT_LABELS.map((al) => (
                <motion.text
                  key={`agent-label-${al.agent}`}
                  x={al.x}
                  y={al.y}
                  textAnchor="middle"
                  fill="currentColor"
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    AGENT_COLORS[al.agent].label,
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: al.agent === "main" ? PHASE_TIMING.labels : PHASE_TIMING.branching,
                    duration: 0.3,
                  }}
                >
                  {al.label}
                </motion.text>
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
