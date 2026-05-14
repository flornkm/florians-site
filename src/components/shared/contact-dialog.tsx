import { CONTACTS } from "@/const/contacts";
import { cn } from "@/lib/utils";
import { IconCrossSmall } from "central-icons/IconCrossSmall";
import { IconEmail2 } from "central-icons/IconEmail2";
import { IconGithub } from "central-icons/IconGithub";
import { IconInstagram } from "central-icons/IconInstagram";
import { IconLinkedin } from "central-icons/IconLinkedin";
import { IconPhone } from "central-icons/IconPhone";
import { IconX } from "central-icons/IconX";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import type { ComponentType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  "X (Twitter)": IconX,
  GitHub: IconGithub,
  LinkedIn: IconLinkedin,
  Instagram: IconInstagram,
  Email: IconEmail2,
  iMessage: IconPhone,
};

const SOCIAL_LINKS = CONTACTS.map((c) => ({
  name: c.name,
  handle: c.handle,
  href: c.href,
  icon: ICON_MAP[c.name],
})).filter((l) => l.icon);

export default function ContactDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isOpen, close]);

  return (
    <MotionConfig transition={{ type: "spring", visualDuration: 0.2, bounce: 0 }}>
      <div ref={containerRef} className="relative z-10 hidden min-[350px]:flex items-center">
        <div className="h-7.5 md:h-6.5 px-2.5 text-sm font-medium invisible">Contact</div>
        <motion.div
          layout
          onClick={() => !isOpen && setIsOpen(true)}
          className={cn(
            "absolute right-0 bottom-0 md:bottom-auto md:top-0 bg-accent-primary text-accent-foreground overflow-hidden",
            isOpen
              ? "w-64 border border-white/10 dark:border-black/10"
              : "cursor-pointer hover:bg-accent-primary-hover",
          )}
          style={{ borderRadius: 14 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {isOpen ? (
              <motion.div
                key="panel"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="p-1.5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold pl-1">Contact</span>
                  <button
                    onClick={close}
                    className="size-6 flex items-center justify-center rounded-full hover:bg-white/15 dark:hover:bg-black/10 transition-colors cursor-pointer"
                  >
                    <IconCrossSmall className="size-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-0.5">
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-lg hover:bg-white/15 dark:hover:bg-black/10 transition-colors text-sm"
                    >
                      <link.icon className="size-4 shrink-0" />
                      <span className="font-medium">{link.name}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.span
                key="button"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="text-sm font-medium leading-none whitespace-nowrap px-2.5 h-7.5 md:h-6.5 flex items-center"
              >
                Contact
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
