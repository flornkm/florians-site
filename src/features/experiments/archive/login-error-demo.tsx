import { cn } from "@/lib/utils";
import { IconCheckmark1Small } from "central-icons/IconCheckmark1Small";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";

const SPRING = { type: "spring", stiffness: 700, damping: 40, mass: 0.6 } as const;

type Variant = "bad" | "good";
const VARIANTS: { id: Variant; label: string }[] = [
  { id: "bad", label: "Bad" },
  { id: "good", label: "Good" },
];

// The same failed submit, two ways. "Bad" spells the error out in red and shoves the
// layout down to make room; "good" just nudges the checkbox, trusting the user to connect
// "nothing happened" to "the one thing I skipped".
export const LoginError = () => {
  const [variant, setVariant] = useState<Variant>("bad");
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [scope, animate] = useAnimate();

  const submit = () => {
    if (accepted) {
      setShowError(false);
      return;
    }
    if (variant === "bad") {
      setShowError(true);
    } else {
      animate(
        scope.current,
        { x: [0, -6, 6, -5, 5, -3, 3, 0] },
        { duration: 0.5, ease: "easeInOut" },
      );
    }
  };

  const toggleAccept = () => {
    setAccepted((a) => !a);
    setShowError(false);
  };

  const selectVariant = (next: Variant) => {
    setVariant(next);
    setShowError(false);
  };

  return (
    <div className="font-pretendard relative flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-[19rem] flex-col gap-6 px-8">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-base font-semibold text-primary">Sign in</h2>
          <p className="text-[13px] text-tertiary">Continue to your account</p>
        </div>

        <div className="flex flex-col gap-2">
          <ProviderButton
            icon={<GoogleLogo className="size-[18px]" />}
            label="Continue with Google"
            onClick={submit}
            className="z-0"
          />
          <ProviderButton
            icon={<GithubLogo className="size-[18px]" />}
            label="Continue with GitHub"
            onClick={submit}
            className="z-10"
          />
        </div>

        <div className="flex flex-col items-center">
          <motion.button
            ref={scope}
            type="button"
            role="checkbox"
            aria-checked={accepted}
            onClick={toggleAccept}
            className="flex cursor-pointer items-center gap-2.5 rounded-md text-left outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-default"
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-[7px] transition-colors",
                accepted ? "bg-accent-primary text-accent-foreground" : "bg-surface shadow-ring-xs",
              )}
            >
              <AnimatePresence>
                {accepted && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={SPRING}
                  >
                    <IconCheckmark1Small className="size-[18px]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className="text-[13px] text-secondary">
              I accept the{" "}
              <span className="text-primary underline decoration-black/20 decoration-dotted underline-offset-4 dark:decoration-white/20">
                Terms &amp; Conditions
              </span>
            </span>
          </motion.button>

          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                // Appears instantly — full height right away so the layout shift is snappy.
                animate={{
                  height: "auto",
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: { duration: 0 },
                }}
                // Leaves smoothly — collapses its height and blurs out so switching eases the
                // content back instead of snapping it.
                exit={{
                  height: 0,
                  opacity: 0,
                  filter: "blur(4px)",
                  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                }}
                // Height animates on this wrapper (no padding here) so the collapse can't jump a
                // frame; the spacing lives on the inner <p>, inside the measured height.
                className="overflow-hidden [will-change:height,opacity,filter]"
              >
                <p className="text-balance pt-3 text-center text-xs text-destructive">
                  You must accept the Terms &amp; Conditions to continue.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div
        role="group"
        aria-label="Error behavior"
        className="absolute bottom-4 left-1/2 grid -translate-x-1/2 grid-cols-2 rounded-full bg-surface-tertiary p-1"
      >
        <motion.span
          layout
          transition={SPRING}
          style={{ gridColumn: variant === "bad" ? 1 : 2, gridRow: 1 }}
          className="pointer-events-none rounded-full bg-surface shadow-ring-sm"
        />
        {VARIANTS.map((v, i) => {
          const active = variant === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => selectVariant(v.id)}
              aria-pressed={active}
              style={{ gridColumn: i + 1, gridRow: 1 }}
              className={cn(
                "relative cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-tertiary hover:text-secondary",
              )}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function ProviderButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      className={cn(
        // hover uses the interactive token, not surface-secondary — in dark the latter equals
        // the dialog background, so the button would melt into the page on hover.
        "relative flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-surface px-4 py-2.5 text-[13px] font-medium text-primary shadow-ring-sm transition-colors will-change-transform hover:bg-interactive-hover",
        className,
      )}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return <img src="/images/google-logo.svg" alt="" aria-hidden="true" className={className} />;
}

function GithubLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}
