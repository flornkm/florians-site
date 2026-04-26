import Toggle from "@/components/ui/toggle";
import { useState } from "react";
import "./scroll-mask-fade-demo.css";

type Msg = { from: "user" | "ai"; text: string };

const CONVO: Msg[] = [
  { from: "user", text: "What should I cook tonight? I've got chicken thighs and not much else." },
  {
    from: "ai",
    text: "Sheet-pan chicken with whatever vegetables are wilting in your fridge. Lemon, garlic, olive oil, 30 minutes at 220°C.",
  },
  { from: "user", text: "I have half a cabbage and one sad-looking onion." },
  {
    from: "ai",
    text: "Perfect, actually. Cut the cabbage into wedges, slice the onion thick, toss everything together. The chicken fat soaks into the cabbage as it roasts.",
  },
  { from: "user", text: "Any seasoning beyond salt and pepper?" },
  {
    from: "ai",
    text: "Smoked paprika if you have it, otherwise dried oregano. A spoonful of mustard rubbed on the chicken skin works wonders.",
  },
  { from: "user", text: "Done. How do I know when it's ready?" },
  {
    from: "ai",
    text: "When the skin is deep golden and the cabbage edges have charred a bit. Juices should run clear when you poke the thickest thigh.",
  },
];

export const ScrollMaskFade = () => {
  const [masked, setMasked] = useState(true);

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className={`smf-scrollbar ${masked ? "smf-scroller" : ""} h-64 w-96 px-10 overflow-y-auto`}
      >
        <div className="flex flex-col gap-5 p-3">
          {CONVO.map((m, i) =>
            m.from === "user" ? (
              <div
                key={i}
                className="self-end max-w-[80%] rounded-xl border border-primary bg-surface px-3 py-2 text-[13px] leading-snug text-primary shadow-sm shadow-muted"
              >
                {m.text}
              </div>
            ) : (
              <p
                key={i}
                className="self-start max-w-[85%] px-1 text-[13px] leading-snug text-primary"
              >
                {m.text}
              </p>
            ),
          )}
        </div>
      </div>
      <label className="inline-flex items-center gap-3 text-xs text-tertiary select-none">
        <Toggle checked={masked} onCheckedChange={setMasked} />
        <span>Mask</span>
      </label>
    </div>
  );
};
