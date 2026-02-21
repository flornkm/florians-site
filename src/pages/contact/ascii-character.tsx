import { useChatStatusEvents } from "@/components/chat/chat-status";
import { useEffect, useRef, useState } from "react";

type Face = { eyes: string; mouth: string };

const FACES: Record<string, Face> = {
  ready: { eyes: "^   ^", mouth: " w " },
  submitted: { eyes: "o   o", mouth: " . " },
  streaming: { eyes: "^   ^", mouth: " o " },
};

export function AsciiCharacter() {
  const [face, setFace] = useState<Face>(FACES.ready);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEvents = useChatStatusEvents();

  useEffect(() => {
    const unsub = chatEvents.subscribe((status) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (status === "streaming") {
        let toggle = false;
        intervalRef.current = setInterval(() => {
          toggle = !toggle;
          setFace({ eyes: "^   ^", mouth: toggle ? " o " : " _ " });
        }, 400);
      } else {
        setFace(FACES[status] ?? FACES.ready);
      }
    });

    return () => {
      unsub();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [chatEvents]);

  return (
    <div className="flex items-center justify-center py-8">
      <pre className="font-mono text-tertiary text-center leading-tight select-none transition-all duration-300">
        {"(  " + face.eyes + "  )\n"}
        {"(  " + face.mouth + "  )"}
      </pre>
    </div>
  );
}
