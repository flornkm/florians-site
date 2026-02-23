import { useState, useEffect } from "react";

export const PaperRollDemo = () => {
  const [roll, setRoll] = useState(0.35);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    if (!grabbing) return;
    const release = () => setGrabbing(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [grabbing]);

  const rollPercent = roll * 100;
  const visibleHeight = 100 - rollPercent;

  const tubeRadius = 6 + roll * 18;
  const tubeDiameter = tubeRadius * 2;

  const rollTurns = roll * 3;
  const spiralLines = Math.floor(rollTurns * 4);

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-md px-6 select-none">
      <div
        className="relative"
        style={{
          width: 240,
          height: 320,
          perspective: "800px",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: `${visibleHeight}%`,
              background: "linear-gradient(135deg, #f5f0e8 0%, #ece6d9 30%, #f0ebe3 60%, #e8e2d5 100%)",
              borderRadius: "0 0 2px 2px",
              boxShadow: `
                4px 4px 12px rgba(0,0,0,0.12),
                -1px 0 4px rgba(0,0,0,0.04),
                inset 0 0 30px rgba(0,0,0,0.02)
              `,
              overflow: "hidden",
              transition: grabbing ? "none" : "height 0.1s ease-out",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `
                  repeating-linear-gradient(
                    transparent,
                    transparent 27px,
                    rgba(120, 160, 200, 0.15) 27px,
                    rgba(120, 160, 200, 0.15) 28px
                  )
                `,
                paddingTop: 32,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: 32,
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(200, 100, 100, 0.18)",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 12,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.06), transparent)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", padding: "36px 20px 20px 44px" }}>
              {[
                "Dear Reader,",
                "",
                "This is a demonstration",
                "of a pure CSS paper",
                "roll effect. The sheet",
                "curls up from the top",
                "as you drag the slider.",
                "",
                "Notice the realistic",
                "shadows, the paper",
                "texture, and how the",
                "tube grows thicker as",
                "more paper wraps",
                "around it.",
              ].map((line, i) => (
                <div
                  key={i}
                  style={{
                    height: 28,
                    fontFamily: "'Caveat', 'Segoe Script', cursive",
                    fontSize: 15,
                    color: "rgba(30, 40, 80, 0.7)",
                    lineHeight: "28px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `
                  linear-gradient(
                    90deg,
                    rgba(0,0,0,0.03) 0%,
                    transparent 3%,
                    transparent 97%,
                    rgba(0,0,0,0.02) 100%
                  )
                `,
                pointerEvents: "none",
              }}
            />
          </div>

          {roll > 0.01 && (
            <div
              style={{
                position: "absolute",
                left: -8,
                right: -8,
                top: `${visibleHeight}%`,
                transform: `translateY(-${tubeDiameter}px)`,
                height: tubeDiameter,
                transition: grabbing ? "none" : "all 0.1s ease-out",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: `${tubeRadius}px`,
                  background: `
                    linear-gradient(
                      to bottom,
                      rgba(0,0,0,0.08) 0%,
                      rgba(200,195,180,1) 8%,
                      rgba(240,235,225,1) 20%,
                      rgba(250,247,240,1) 35%,
                      rgba(255,252,245,1) 45%,
                      rgba(250,247,240,1) 55%,
                      rgba(235,230,218,1) 70%,
                      rgba(215,210,198,1) 85%,
                      rgba(195,190,178,1) 95%,
                      rgba(175,170,160,0.9) 100%
                    )
                  `,
                  boxShadow: `
                    0 ${Math.max(2, tubeRadius * 0.4)}px ${Math.max(6, tubeRadius * 0.8)}px rgba(0,0,0,0.15),
                    0 ${Math.max(1, tubeRadius * 0.15)}px ${Math.max(2, tubeRadius * 0.3)}px rgba(0,0,0,0.1),
                    inset 0 1px 0 rgba(255,255,255,0.5),
                    inset 0 -1px 2px rgba(0,0,0,0.05)
                  `,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "15%",
                  height: "20%",
                  borderRadius: `${tubeRadius}px`,
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0) )",
                  pointerEvents: "none",
                }}
              />

              {spiralLines > 0 && Array.from({ length: Math.min(spiralLines, 12) }).map((_, i) => {
                const offset = (i / Math.max(spiralLines, 1)) * tubeDiameter * 0.6;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: `${15 + offset}%`,
                      height: 1,
                      background: `rgba(0,0,0,${0.02 + (i % 2) * 0.01})`,
                      pointerEvents: "none",
                    }}
                  />
                );
              })}

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "35%",
                  borderRadius: `0 0 ${tubeRadius}px ${tubeRadius}px`,
                  background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.06))",
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: -2,
                  top: "20%",
                  bottom: "30%",
                  width: 6,
                  borderRadius: "3px 0 0 3px",
                  background: `
                    radial-gradient(
                      ellipse at right center,
                      rgba(210,205,195,1) 0%,
                      rgba(185,180,170,1) 60%,
                      rgba(160,155,145,1) 100%
                    )
                  `,
                  boxShadow: "-1px 0 3px rgba(0,0,0,0.1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: -2,
                  top: "20%",
                  bottom: "30%",
                  width: 6,
                  borderRadius: "0 3px 3px 0",
                  background: `
                    radial-gradient(
                      ellipse at left center,
                      rgba(210,205,195,1) 0%,
                      rgba(185,180,170,1) 60%,
                      rgba(160,155,145,1) 100%
                    )
                  `,
                  boxShadow: "1px 0 3px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          )}

          {roll > 0.01 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${visibleHeight}%`,
                height: 20,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.08), transparent)",
                transform: "translateY(-2px)",
                transition: grabbing ? "none" : "top 0.1s ease-out",
                zIndex: 5,
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full max-w-[240px]">
        <span className="text-xs text-quaternary shrink-0">Flat</span>
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min={0}
            max={0.85}
            step={0.005}
            value={roll}
            onChange={(e) => setRoll(parseFloat(e.target.value))}
            onPointerDown={() => setGrabbing(true)}
            className={[
              "w-full h-[3px] appearance-none rounded-full outline-none bg-surface-tertiary",
              grabbing ? "cursor-grabbing" : "cursor-grab",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:w-3",
              "[&::-webkit-slider-thumb]:h-3",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-[var(--text-quaternary)]",
              "[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--bg-primary)]",
              "[&::-webkit-slider-thumb]:transition-transform",
              "[&::-webkit-slider-thumb]:duration-300",
              "[&::-webkit-slider-thumb]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
              grabbing
                ? "[&::-webkit-slider-thumb]:scale-75"
                : "[&::-webkit-slider-thumb]:scale-100",
              grabbing
                ? "[&::-webkit-slider-thumb]:cursor-grabbing"
                : "[&::-webkit-slider-thumb]:cursor-grab",
              "[&::-moz-range-thumb]:w-3",
              "[&::-moz-range-thumb]:h-3",
              "[&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-[var(--text-quaternary)]",
              "[&::-moz-range-thumb]:border-[2px]",
              "[&::-moz-range-thumb]:border-solid",
              "[&::-moz-range-thumb]:[border-color:var(--bg-primary)]",
              "[&::-moz-range-thumb]:transition-transform",
              "[&::-moz-range-thumb]:duration-300",
              "[&::-moz-range-thumb]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
              grabbing
                ? "[&::-moz-range-thumb]:scale-75"
                : "[&::-moz-range-thumb]:scale-100",
              grabbing
                ? "[&::-moz-range-thumb]:cursor-grabbing"
                : "[&::-moz-range-thumb]:cursor-grab",
            ].join(" ")}
          />
        </div>
        <span className="text-xs text-quaternary shrink-0">Rolled</span>
      </div>
    </div>
  );
};
