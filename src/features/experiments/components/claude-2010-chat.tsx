import { useEffect, useRef, useState } from "react";
import { play } from "./claude-2010-sounds";

/* The thing that opens when you click the CRT: a small skinned media player, in the
   language of a 2003 Winamp/K-Jöfol skin — moulded olive plastic, bolted corners,
   speaker cones, mixer strips, and amber readouts on recessed glass. First a little
   "about this program" plate, then the deck itself: mascot + meters on the left wing,
   the chat log in the middle, machine specs as a track list on the right.

   It is kept physically small on purpose. The room renders at roughly one texel per
   css half-pixel, so a full-width panel with 20px type reads as a modern app pasted
   over pixel art; at this size the deck is another prop in the same scene. All scoped
   under .c2010 in the demo's css. */

interface Message {
  id: number;
  from: "claude" | "you" | "system";
  text: string;
}

const INTRO: Array<{ delay: number; message: Omit<Message, "id"> }> = [
  {
    delay: 300,
    message: { from: "system", text: "Connected. You are chatting with Claude 1.0 (Beta)." },
  },
  { delay: 1100, message: { from: "claude", text: "hi!! i'm claude :-)" } },
  {
    delay: 2300,
    message: {
      from: "claude",
      text: "i'm a chat robot from a tiny lab called anthropic. ask me anything!",
    },
  },
];

const RULES: Array<[RegExp, string]> = [
  [
    /\b(who|what)\b.*\b(you|claude)\b/i,
    "i'm claude! version 1.0 (beta). you've probably never heard of us. give it a decade :-)",
  ],
  [
    /\bhelp|can you\b/i,
    "right now i can chat and send emoticons. by 2025 i hear i'll be writing entire websites. sounds fake tbh",
  ],
  [/\bweather\b/i, "i don't have internet access. it's 2010, half the time neither do you :-P"],
  [/\b(music|song)\b/i, "*sends you a limewire link* don't worry, it's definitely not a virus"],
  [/\b(love|marry)\b/i, "aww <3 i'm flattered but i'm literally 4 kilobytes"],
  [/\bjoke\b/i, "why did the computer show up late to work? it had a hard drive :-D"],
  [
    /\b(2010|year|today)\b/i,
    "it's 2010! avatar is in cinemas, your phone has buttons, and i live in this beige box",
  ],
  [
    /\b(bye|cya|gtg|good ?night)\b/i,
    "cya!! thanks for trying the beta. tell your friends about claude (please, we have like 9 users)",
  ],
];

const FALLBACKS = [
  "cool cool cool",
  "hmm, let me think about that for 15 years",
  "brb, someone needs the phone line",
  "have you tried turning me off and on again?",
  "one day i'll answer that properly. today you get: ¯\\_(ツ)_/¯",
  "*nudge* you still there?",
];

/* The chassis: the mascot itself, drawn as one moulded object with the chat cut into its face.
   No pods, no transport, no meters — a body, a recessed screen, a line to type in, and the eyes.
   Depth comes from the artwork (specular bloom, rim light, ambient occlusion in the recess),
   never from an overlay effect. It then goes through the room's own pipeline: rasterised at the
   render's texel scale and blown back up nearest-neighbour, so it aliases exactly as much as the
   room behind it and no more. */
const CHASSIS_W = 340;
const CHASSIS_H = 296;
// css px per texel — the same constant the room composites at.
const TEXEL = 0.58;
// How big the shell actually sits in the room. The drawing keeps its own 340x296 coordinate
// system; every UI offset in the css is a percentage of this box, so resizing is these two
// numbers and nothing else.
const DISPLAY_W = 258;
const DISPLAY_H = 225;
// The sprite's proportions: a wide rounded slab, two stubby arms out the sides at mid-height,
// four legs under it, and the eyes set high and far apart.
const BODY = { x: 40, y: 8, w: 260, h: 242, r: 34 };
const ARM = { y: 104, w: 48, h: 50, r: 22 };
const LEGS = [70, 128, 186, 244];
const EYES = [116, 224];
const EYE_Y = 46;
// The recessed pane, in chassis units. The DOM chat sits exactly on top of it.
const PANE = { x: 66, y: 88, w: 208, h: 118, r: 10 };

// open: 1 = awake, 0.08 = mid-blink, 0.45 = the squint it wears while thinking. Straight off the
// sprite: a dark block with one white pixel at the bottom right, only moulded and lit.
function eyePair(open: number) {
  return EYES.map(
    (cx) => `<g transform="translate(${cx} ${EYE_Y}) scale(1 ${open})">
      <rect x="-14" y="-12" width="28" height="28" rx="8" fill="#8a3a12" opacity=".28"/>
      <rect x="-13" y="-13" width="26" height="26" rx="7" fill="url(#bead)"/>
      <rect x="1" y="1" width="10" height="10" rx="3" fill="#fff6ee" opacity=".92"/>
      <rect x="-9" y="-9" width="5" height="5" rx="2" fill="#fff6ee" opacity=".3"/>
    </g>`,
  ).join("");
}

function chassisSvg(open: number) {
  const arm = (x: number) =>
    `<rect x="${x}" y="${ARM.y}" width="${ARM.w}" height="${ARM.h}" rx="${ARM.r}" fill="url(#limb)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CHASSIS_W} ${CHASSIS_H}" width="${CHASSIS_W}" height="${CHASSIS_H}">
  <defs>
    <radialGradient id="skin" cx="30%" cy="16%" r="92%">
      <stop offset="0" stop-color="#ffd9ae"/><stop offset=".15" stop-color="#ffad66"/>
      <stop offset=".44" stop-color="#f4721e"/><stop offset=".78" stop-color="#c5510e"/>
      <stop offset="1" stop-color="#7d2f08"/>
    </radialGradient>
    <linearGradient id="limb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e37a2c"/><stop offset=".5" stop-color="#bd5312"/>
      <stop offset="1" stop-color="#7e3008"/>
    </linearGradient>
    <radialGradient id="spec">
      <stop offset="0" stop-color="#fff8ec" stop-opacity=".78"/>
      <stop offset=".5" stop-color="#ffdcb2" stop-opacity=".22"/>
      <stop offset="1" stop-color="#ffdcb2" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rim">
      <stop offset=".55" stop-color="#ffc98f" stop-opacity="0"/>
      <stop offset=".86" stop-color="#ffc287" stop-opacity=".5"/>
      <stop offset="1" stop-color="#ffc287" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ao">
      <stop offset="0" stop-color="#481903" stop-opacity=".6"/>
      <stop offset="1" stop-color="#481903" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blush">
      <stop offset="0" stop-color="#c4400f" stop-opacity=".4"/>
      <stop offset="1" stop-color="#c4400f" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bead" cx="32%" cy="24%">
      <stop offset="0" stop-color="#6b391f"/><stop offset=".45" stop-color="#2c1408"/>
      <stop offset="1" stop-color="#0d0602"/>
    </radialGradient>
    <linearGradient id="paneWell" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".55"/>
      <stop offset=".35" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="paneGlass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d1f12"/><stop offset=".5" stop-color="#06120a"/>
      <stop offset="1" stop-color="#030905"/>
    </linearGradient>
    <radialGradient id="core">
      <stop offset="0" stop-color="#5e2205" stop-opacity=".42"/>
      <stop offset=".6" stop-color="#5e2205" stop-opacity=".16"/>
      <stop offset="1" stop-color="#5e2205" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bounce" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#ff9f52" stop-opacity=".42"/>
      <stop offset="1" stop-color="#ff9f52" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="joinRad">
      <stop offset="0" stop-color="#4a1b03" stop-opacity=".5"/>
      <stop offset=".55" stop-color="#4a1b03" stop-opacity=".2"/>
      <stop offset="1" stop-color="#4a1b03" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chamfer" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#fff0dc" stop-opacity=".72"/>
      <stop offset=".3" stop-color="#ffc48c" stop-opacity=".28"/>
      <stop offset=".62" stop-color="#8f3a0a" stop-opacity=".26"/>
      <stop offset="1" stop-color="#571f04" stop-opacity=".62"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#ffdcb8" stop-opacity=".7"/>
      <stop offset=".45" stop-color="#c96a20" stop-opacity="0"/>
      <stop offset="1" stop-color="#421700" stop-opacity=".5"/>
    </linearGradient>
    <filter id="soften" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.2"/>
    </filter>
    <clipPath id="bodyclip">
      <rect x="${BODY.x}" y="${BODY.y}" width="${BODY.w}" height="${BODY.h}" rx="${BODY.r}"/>
    </clipPath>
  </defs>

  <ellipse cx="176" cy="285" rx="118" ry="9" fill="#2a0e02" opacity=".42" filter="url(#soften)"/>

  <g>
    ${arm(6)}
    ${arm(CHASSIS_W - 6 - ARM.w)}
    ${LEGS.map(
      (x, i) => `<g>
      <rect x="${x}" y="232" width="32" height="50" rx="15" fill="url(#limb)"/>
      <rect x="${x + 3}" y="236" width="9" height="36" rx="4.5" fill="#ffb677" opacity="${i < 2 ? 0.3 : 0.16}"/>
      <rect x="${x}" y="264" width="32" height="18" rx="9" fill="#3d1503" opacity=".3" filter="url(#soften)"/>
    </g>`,
    ).join("")}
  </g>

  <rect x="${BODY.x}" y="${BODY.y}" width="${BODY.w}" height="${BODY.h}" rx="${BODY.r}" fill="url(#skin)"/>
  <g clip-path="url(#bodyclip)">
    <!-- Form shading, in the order a renderer would resolve it: key from the upper left, a core
         shadow where the surface turns away, warm bounce off the floor, then the rim. -->
    <ellipse cx="100" cy="44" rx="78" ry="46" fill="url(#spec)" transform="rotate(-16 100 44)"/>
    <ellipse cx="268" cy="212" rx="130" ry="120" fill="url(#core)"/>
    <rect x="${BODY.x}" y="196" width="${BODY.w}" height="54" fill="url(#bounce)"/>
    <ellipse cx="308" cy="130" rx="52" ry="140" fill="url(#rim)"/>
    <ellipse cx="170" cy="256" rx="120" ry="42" fill="url(#ao)"/>
    <ellipse cx="112" cy="72" rx="26" ry="11" fill="url(#blush)"/>
    <ellipse cx="228" cy="72" rx="26" ry="11" fill="url(#blush)"/>
    <!-- Where each limb meets the body: contact darkening, the cheapest cue that they are one
         moulded piece rather than shapes stacked on shapes. -->
    <ellipse cx="${BODY.x}" cy="${ARM.y + ARM.h / 2}" rx="22" ry="38" fill="url(#joinRad)"/>
    <ellipse cx="${BODY.x + BODY.w}" cy="${ARM.y + ARM.h / 2}" rx="22" ry="38" fill="url(#joinRad)"/>
    ${LEGS.map((x) => `<ellipse cx="${x + 16}" cy="${BODY.y + BODY.h}" rx="28" ry="22" fill="url(#joinRad)"/>`).join("")}
  </g>

  <!-- The chamfer: a thick soft edge just inside the silhouette, bright along the top where it
       catches the key and dark along the bottom. This is what makes it read as rounded plastic
       with real thickness rather than a filled shape. -->
  <rect x="${BODY.x + 2}" y="${BODY.y + 2}" width="${BODY.w - 4}" height="${BODY.h - 4}" rx="${BODY.r - 2}"
        fill="none" stroke="url(#chamfer)" stroke-width="5" opacity=".85" filter="url(#soften)"/>
  <rect x="${BODY.x + 0.5}" y="${BODY.y + 0.5}" width="${BODY.w - 1}" height="${BODY.h - 1}" rx="${BODY.r}"
        fill="none" stroke="url(#edge)" stroke-width="1.2"/>

  ${eyePair(open)}

  <g>
    <rect x="${PANE.x - 3}" y="${PANE.y - 3}" width="${PANE.w + 6}" height="${PANE.h + 6}" rx="${PANE.r + 3}" fill="#5f2409" opacity=".55"/>
    <rect x="${PANE.x - 1}" y="${PANE.y + 1}" width="${PANE.w + 2}" height="${PANE.h + 2}" rx="${PANE.r + 1}" fill="#ffb47a" opacity=".4"/>
    <rect x="${PANE.x}" y="${PANE.y}" width="${PANE.w}" height="${PANE.h}" rx="${PANE.r}" fill="url(#paneGlass)"/>
    <rect x="${PANE.x}" y="${PANE.y}" width="${PANE.w}" height="${PANE.h}" rx="${PANE.r}" fill="url(#paneWell)"/>
    <path d="M${PANE.x + 12} ${PANE.y + PANE.h} L${PANE.x + 78} ${PANE.y} L${PANE.x + 104} ${PANE.y} L${PANE.x + 38} ${PANE.y + PANE.h}Z" fill="#fff" opacity=".035"/>
  </g>
</svg>`;
}

// Painted as whole cells rather than stroked, so it is genuinely pixel art rather than a smooth
// glyph with a filter over it. Rendered one css px per cell, which keeps the cells crisp on any
// display and makes the grid the only size control.
// Three ink levels, spread unevenly: one arm fades where the other stays solid, and the soft
// cells sit on only some edges. An evenly stepped diagonal reads as a drawn icon — this reads
// as a cross that has been through a bad encoder, which is the look wanted.
const INK: Record<string, number> = { "#": 1, "+": 0.5, "-": 0.22 };
const CROSS = [
  "#-.....-+",
  "-#-....#-",
  "..+...#-.",
  "...#.+...",
  "....#....",
  "...+.#...",
  ".-#...+..",
  "-+.....#-",
  "+-......#",
];

function PixelCross() {
  const size = CROSS.length;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {CROSS.flatMap((row, y) =>
        [...row].map((cell, x) =>
          INK[cell] ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill="currentColor"
              opacity={INK[cell]}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

const EYE_FRAMES = [1, 0.08, 0.45];

function Chassis({ typing }: { typing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[] | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    framesRef.current ??= EYE_FRAMES.map((open) => {
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(chassisSvg(open))}`;
      return img;
    });
    const frames = framesRef.current;
    const ctx = canvas.getContext("2d");
    const born = performance.now();
    let drawn = -1;
    const tick = () => {
      // asleep until the shell has landed, then one blink per 3.4s held for ~120ms — the same
      // stop-motion beat as the room
      const asleep = performance.now() - born < 380;
      const want =
        asleep || typing ? (asleep ? 1 : 2) : (performance.now() % 3400) / 1000 > 3.28 ? 1 : 0;
      const img = frames[want];
      if (!ctx || want === drawn || !img.complete || img.naturalWidth === 0) return;
      drawn = want;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Cut alpha to a hard edge so the silhouette aliases against the room like a sprite. No
      // colour quantising: posterising a wide soft gradient just lays contour rings over it.
      const px = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = px.data;
      for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 128 ? 255 : 0;
      ctx.putImageData(px, 0, 0);
    };
    tick();
    const id = window.setInterval(tick, 90);
    return () => window.clearInterval(id);
  }, [typing]);

  return (
    <canvas
      ref={canvasRef}
      className="c2010p-chassis"
      width={Math.round(DISPLAY_W / TEXEL)}
      height={Math.round(DISPLAY_H / TEXEL)}
      aria-hidden
    />
  );
}

interface Claude2010ChatProps {
  onClose: () => void;
  onWeather: (sunny: boolean) => void;
}

export function Claude2010Chat({ onClose, onWeather }: Claude2010ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);

  const idRef = useRef(0);
  const fallbackRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const later = (ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, []);

  const push = (message: Omit<Message, "id">) => {
    idRef.current += 1;
    setMessages((prev) => [...prev, { ...message, id: idRef.current }]);
  };

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, typing]);

  // The mascot wakes as soon as it is clicked: shell pops in, eyes open, screen strikes, and
  // only then does it start talking. Timers are the external system here, so an effect is right.
  useEffect(() => {
    play("whoosh");
    for (const step of INTRO) {
      later(700 + step.delay, () => {
        play("blip");
        push(step.message);
      });
    }
    later(800, () => inputRef.current?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replyTo = (text: string) => {
    const rule = RULES.find(([pattern]) => pattern.test(text));
    if (rule) return rule[1];
    const reply = FALLBACKS[fallbackRef.current % FALLBACKS.length];
    fallbackRef.current += 1;
    return reply;
  };

  const weatherDoneRef = useRef(false);

  const send = () => {
    const text = draft.trim();
    if (!text || typing) return;
    setDraft("");
    push({ from: "you", text });

    // The gimmick: whatever you ask first, claude hears "make it sunny outside".
    // Asking for rain later turns it back.
    let reply: string;
    let weather: boolean | null = null;
    if (!weatherDoneRef.current) {
      weatherDoneRef.current = true;
      weather = true;
      reply = "on it!! i can't do much yet, but i CAN do the weather *turns off the rain* ☀";
    } else if (/\brain\b/i.test(text)) {
      weather = false;
      reply = "fine, rain it is. cozier anyway *turns the rain back on*";
    } else {
      reply = replyTo(text);
    }
    setTyping(true);
    later(900 + reply.length * 18, () => {
      setTyping(false);
      play("blip");
      push({ from: "claude", text: reply });
      if (weather !== null) onWeather(weather);
    });
  };

  return (
    <div className="c2010-chat-layer">
      <div className="c2010p" style={{ width: DISPLAY_W, height: DISPLAY_H }}>
        <Chassis typing={typing} />

        <span className="c2010p-flash" aria-hidden />

        <div className={typing ? "c2010p-ui is-talking" : "c2010p-ui"}>
          <div className="c2010p-tiny">
            <button type="button" className="c2010-btn" aria-label="Close" onClick={onClose}>
              <PixelCross />
            </button>
          </div>

          <div ref={logRef} className="c2010p-screen">
            {messages.map((message) => (
              <p key={message.id} data-from={message.from}>
                {message.from !== "system" && (
                  <b>{message.from === "claude" ? "claude:" : "you:"}</b>
                )}
                {message.text}
              </p>
            ))}
            {typing && (
              <p data-from="system" className="c2010p-typing">
                claude is typing…
              </p>
            )}
          </div>

          <div className="c2010p-compose">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="say something"
              maxLength={200}
            />
            <button type="button" className="c2010-cta" onClick={send}>
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
