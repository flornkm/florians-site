import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const SP = { stiffness: 400, damping: 26, mass: 0.8 };
const SP_SOFT = { stiffness: 300, damping: 24, mass: 1 };

type IconStyle = "line" | "solid" | "duotone";

const STYLES: { label: string; value: IconStyle }[] = [
  { label: "Line", value: "line" },
  { label: "Solid", value: "solid" },
  { label: "Duotone", value: "duotone" },
];

const sw = 1.5;
const vb = "0 0 24 24";

function IconHome({ style }: { style: IconStyle }) {
  if (style === "solid")
    return (
      <svg viewBox={vb} fill="currentColor">
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1V10.5z" />
      </svg>
    );
  if (style === "duotone")
    return (
      <svg viewBox={vb} fill="none">
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" fill="currentColor" opacity={0.12} />
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
        <rect x="9" y="14" width="6" height="8" rx="0.5" fill="var(--bg-primary)" stroke="currentColor" strokeWidth={sw} />
      </svg>
    );
  return (
    <svg viewBox={vb} fill="none">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      <path d="M9 22v-7a1 1 0 011-1h4a1 1 0 011 1v7" stroke="currentColor" strokeWidth={sw} />
    </svg>
  );
}

function IconCamera({ style }: { style: IconStyle }) {
  if (style === "solid")
    return (
      <svg viewBox={vb} fill="currentColor">
        <path d="M2 7a2 2 0 012-2h2.5l1.2-2h4.6l1.2 2H20a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" />
        <circle cx="12" cy="13" r="3.5" fill="var(--bg-primary)" />
      </svg>
    );
  if (style === "duotone")
    return (
      <svg viewBox={vb} fill="none">
        <path d="M2 7a2 2 0 012-2h2.5l1.2-2h4.6l1.2 2H20a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" fill="currentColor" opacity={0.12} />
        <path d="M2 7a2 2 0 012-2h2.5l1.2-2h4.6l1.2 2H20a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth={sw} />
        <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth={sw} />
      </svg>
    );
  return (
    <svg viewBox={vb} fill="none">
      <path d="M2 7a2 2 0 012-2h2.5l1.2-2h4.6l1.2 2H20a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth={sw} />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth={sw} />
    </svg>
  );
}

function IconHeart({ style }: { style: IconStyle }) {
  const d = "M12 21s-8-5.5-8-11a4.5 4.5 0 018-2.9A4.5 4.5 0 0120 10c0 5.5-8 11-8 11z";
  if (style === "solid") return <svg viewBox={vb} fill="currentColor"><path d={d} /></svg>;
  if (style === "duotone")
    return (
      <svg viewBox={vb} fill="none">
        <path d={d} fill="currentColor" opacity={0.12} />
        <path d={d} stroke="currentColor" strokeWidth={sw} />
      </svg>
    );
  return <svg viewBox={vb} fill="none"><path d={d} stroke="currentColor" strokeWidth={sw} /></svg>;
}

function IconStar({ style }: { style: IconStyle }) {
  const d = "M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.8 3 1.1-6.5L2.6 8.8l6.5-.9L12 2z";
  if (style === "solid") return <svg viewBox={vb} fill="currentColor"><path d={d} /></svg>;
  if (style === "duotone")
    return (
      <svg viewBox={vb} fill="none">
        <path d={d} fill="currentColor" opacity={0.12} />
        <path d={d} stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      </svg>
    );
  return <svg viewBox={vb} fill="none"><path d={d} stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /></svg>;
}

function IconCompass({ style }: { style: IconStyle }) {
  if (style === "solid")
    return (
      <svg viewBox={vb} fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="var(--bg-primary)" />
      </svg>
    );
  if (style === "duotone")
    return (
      <svg viewBox={vb} fill="none">
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={sw} />
        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox={vb} fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={sw} />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  );
}

function IconMusic({ style }: { style: IconStyle }) {
  if (style === "solid")
    return (
      <svg viewBox={vb} fill="currentColor">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  if (style === "duotone")
    return (
      <svg viewBox={vb} fill="none">
        <circle cx="6" cy="18" r="3" fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={sw} />
        <circle cx="18" cy="16" r="3" fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={sw} />
        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth={sw} />
      </svg>
    );
  return (
    <svg viewBox={vb} fill="none">
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth={sw} />
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth={sw} />
      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth={sw} />
    </svg>
  );
}

function IconBolt({ style }: { style: IconStyle }) {
  const d = "M13 2L3 14h9l-1 8 10-12h-9l1-8z";
  if (style === "solid") return <svg viewBox={vb} fill="currentColor"><path d={d} /></svg>;
  if (style === "duotone")
    return (
      <svg viewBox={vb} fill="none">
        <path d={d} fill="currentColor" opacity={0.12} />
        <path d={d} stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      </svg>
    );
  return <svg viewBox={vb} fill="none"><path d={d} stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /></svg>;
}

function IconGlobe({ style }: { style: IconStyle }) {
  if (style === "solid")
    return (
      <svg viewBox={vb} fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <ellipse cx="12" cy="12" rx="4" ry="10" fill="var(--bg-primary)" opacity={0.3} />
        <path d="M2 12h20" stroke="var(--bg-primary)" strokeWidth={sw} opacity={0.5} />
      </svg>
    );
  if (style === "duotone")
    return (
      <svg viewBox={vb} fill="none">
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={sw} />
        <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth={sw} />
        <path d="M2 12h20" stroke="currentColor" strokeWidth={sw} />
      </svg>
    );
  return (
    <svg viewBox={vb} fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={sw} />
      <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth={sw} />
      <path d="M2 12h20" stroke="currentColor" strokeWidth={sw} />
    </svg>
  );
}

function IconShield({ style }: { style: IconStyle }) {
  const d = "M12 2l7 3.5v5c0 5-3 8.5-7 10.5-4-2-7-5.5-7-10.5v-5L12 2z";
  if (style === "solid") return <svg viewBox={vb} fill="currentColor"><path d={d} /></svg>;
  if (style === "duotone")
    return (
      <svg viewBox={vb} fill="none">
        <path d={d} fill="currentColor" opacity={0.12} />
        <path d={d} stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      </svg>
    );
  return <svg viewBox={vb} fill="none"><path d={d} stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" /></svg>;
}

const ICONS = [
  { name: "Home", Component: IconHome },
  { name: "Camera", Component: IconCamera },
  { name: "Heart", Component: IconHeart },
  { name: "Star", Component: IconStar },
  { name: "Compass", Component: IconCompass },
  { name: "Music", Component: IconMusic },
  { name: "Bolt", Component: IconBolt },
  { name: "Globe", Component: IconGlobe },
  { name: "Shield", Component: IconShield },
];

function StyleSwitcher({ value, onChange }: { value: IconStyle; onChange: (v: IconStyle) => void }) {
  return (
    <div className="flex gap-1 rounded-xl bg-tertiary p-1">
      {STYLES.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={cn(
            "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer",
            value === s.value ? "text-primary" : "text-tertiary hover:text-secondary",
          )}
        >
          {value === s.value && (
            <motion.div
              layoutId="style-pill"
              className="absolute inset-0 rounded-lg bg-primary shadow-sm shadow-black/5"
              transition={{ type: "spring", ...SP }}
            />
          )}
          <span className="relative z-10">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

function IconTile({
  icon,
  style,
  index,
  selected,
  onSelect,
}: {
  icon: (typeof ICONS)[number];
  style: IconStyle;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      transition={{
        type: "spring",
        ...SP_SOFT,
        delay: index * 0.04,
      }}
      onClick={onSelect}
      className="group flex cursor-pointer flex-col items-center gap-2"
    >
      <motion.div
        layout
        animate={{
          scale: selected ? 1.08 : 1,
          boxShadow: selected
            ? "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)"
            : "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", ...SP }}
        className={cn(
          "relative flex items-center justify-center rounded-2xl p-4 transition-colors duration-150",
          "aspect-square w-full",
          selected
            ? "bg-accent-primary text-accent-foreground"
            : "bg-secondary text-primary group-hover:bg-tertiary",
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={style}
            initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
            transition={{ type: "spring", stiffness: 500, damping: 25, mass: 0.6 }}
            className="w-7 h-7"
          >
            <icon.Component style={style} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <motion.span
        animate={{ opacity: selected ? 1 : 0.5 }}
        className="text-[11px] font-medium text-primary"
      >
        {icon.name}
      </motion.span>
    </motion.button>
  );
}

export function IconGeneratorDemo() {
  const [style, setStyle] = useState<IconStyle>("line");
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xs">
      <StyleSwitcher value={style} onChange={setStyle} />
      <motion.div layout className="grid grid-cols-3 gap-3 w-full">
        <AnimatePresence mode="popLayout">
          {ICONS.map((icon, i) => (
            <IconTile
              key={icon.name}
              icon={icon}
              style={style}
              index={i}
              selected={selected === i}
              onSelect={() => setSelected(selected === i ? null : i)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
