import { useRef, useState, useEffect, StateUpdater } from "preact/hooks"
import SignaturePad from "signature_pad"
import {
  Alert,
  ArrowLeft,
  Close,
  Collapse,
  Expand,
  Plus,
} from "#design-system/Icons"
import NoPrerender from "../components/NoPrerender"
import Button, { ButtonWrapper } from "../components/Button"
import Tooltip from "../components/Tooltip"
import LoadingSpinner from "#components/LoadingSpinner"
import * as m from "#lang/paraglide/messages"

export type Letter = {
  id: string
  text: string
  signature: string
  handle: string
}

const fetchLetters = async () => {
  try {
    const latestLetters = await fetch("/api/letters")
    return await latestLetters.json()
  } catch (error) {
    console.error(error)
  }
}

export default function Letters() {
  const popup = useRef<HTMLDivElement>(null)
  const [disableButton, setDisableButton] = useState(false)
  const [letters, setLetters] = useState<Record<string, Letter>>({})

  useEffect(() => {
    fetchLetters().then((data) => {
      setLetters(data)
    })
  }, [])

  let letterArray = letters ? Object.values(letters) : []

  // -1 zoom means nothing is zoomed
  const [zoom, setZoom] = useState<number>(-1)

  const setShowLetter = (animation?: boolean) => {
    const wrapper = popup.current
    const container = popup.current?.children[0].children[0]
      .children[0] as HTMLElement
    if (typeof animation !== "boolean" || !animation) {
      if (wrapper?.style.pointerEvents === "none") {
        container.style.opacity = "100%"
        container.style.transform = "scale(1)"
        wrapper.style.pointerEvents = "auto"
        wrapper.style.opacity = "100%"
        if (typeof window !== "undefined")
          document.body.style.overflow = "hidden"
      } else if (wrapper?.style.pointerEvents === "auto") {
        container.style.opacity = "0%"
        container.style.transform = "scale(0.95)"
        wrapper.style.pointerEvents = "none"
        setTimeout(() => {
          wrapper.style.opacity = "0%"
        }, 150)
        if (typeof window !== "undefined") document.body.style.overflow = "auto"
      }
    } else if (wrapper) {
      wrapper.style.overflow = "hidden"
      container.style.opacity = "0%"
      container.style.transform = "translateX(100%)"
      wrapper.style.pointerEvents = "none"
      setDisableButton(true)
      setTimeout(() => {
        wrapper.style.opacity = "0%"
        wrapper.style.display = "none"
      }, 150)
      if (typeof window !== "undefined") document.body.style.overflow = "auto"
    }
  }

  return (
    <div
      class="overflow-hidden pt-16 max-w-4xl mx-auto md:px-8 px-5"
      onClick={() => setZoom(-1)}
    >
      <h3 class="text-2xl font-semibold text-center md:mb-8">
        {m.letters_title()}
      </h3>
      <div>
        <div ref={popup} style={{ opacity: "0%", pointerEvents: "none" }}>
          <NoPrerender>
            <SendLetter setShowLetter={setShowLetter} setLetters={setLetters} />
          </NoPrerender>
        </div>
        <div
          style={{
            perspective: "1000px",
          }}
          class="w-full h-[616px] mt-20 relative flex items-end justify-center group/letter"
        >
          {letterArray.length > 0 ? (
            letterArray.map((letter) => {
              return (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    if (zoom === -1) setZoom(letterArray.indexOf(letter))
                    else setZoom(-1)
                  }}
                  style={{
                    top:
                      zoom === letterArray.indexOf(letter)
                        ? 0
                        : letterArray.indexOf(letter) * 64,
                    scale:
                      zoom === letterArray.indexOf(letter)
                        ? "1"
                        : `0.9${4 * letterArray.indexOf(letter)}`,
                    zIndex:
                      zoom === letterArray.indexOf(letter)
                        ? 20
                        : letterArray.indexOf(letter),
                    opacity:
                      zoom !== -1 && zoom !== letterArray.indexOf(letter)
                        ? 0
                        : 1,
                    transform:
                      zoom !== -1
                        ? "rotateX(0)"
                        : `rotateX(-${
                            letterArray.indexOf(letter) * 12
                          }deg) translateZ(0)`,
                    borderTopWidth:
                      zoom === -1
                        ? letterArray.indexOf(letter) === 0
                          ? "0"
                          : letterArray.indexOf(letter) === 1
                          ? "2px"
                          : "3px"
                        : "0",
                  }}
                  class={
                    "rounded-3xl group/singleletter cursor-pointer w-full mx-auto p-6 bg-neutral-50 absolute shadow-2xl border-t border-t-neutral-200 shadow-black/5 transition-all dark:border-neutral-800 dark:hover:border-neutral-700 " +
                    (zoom === letterArray.indexOf(letter)
                      ? "bg-white dark:bg-neutral-800"
                      : "hover:bg-white hover:shadow-black/10 dark:hover:bg-neutral-800 dark:hover:shadow-none dark:bg-neutral-900")
                  }
                >
                  <Alert
                    onClick={(e) => {
                      e!.stopPropagation()
                      if (typeof window !== "undefined")
                        window.open(
                          "https://twitter.com/messages/compose?recipient_id=1053753388289155073&text=There%20is%20a%20weird%20letter%20on%20your%20website!"
                        )
                    }}
                    class={
                      "absolute -top-11 aspect-square right-4 w-9 h-9 p-1.5 rounded-md flex items-center justify-center z-50 bg-amber-400 hover:bg-amber-300 dark:hover:bg-amber-500 transition-all " +
                      (zoom === letterArray.indexOf(letter)
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none")
                    }
                  />
                  <img
                    src="/images/letter/stamp.png"
                    class="pointer-events-none w-20 absolute top-8 md:block hidden right-8 rotate-6"
                    alt="Signature Stamp"
                  />
                  <div class="w-full md:h-96 h-80 flex gap-4 md:flex-row flex-col">
                    <div
                      class={
                        "w-full h-full " +
                        (zoom === letterArray.indexOf(letter)
                          ? "text-black dark:text-white"
                          : "text-neutral-400 group-hover/singleletter:text-black dark:group-hover/singleletter:text-white")
                      }
                    >
                      <p class="pr-8">{letter.text}</p>
                    </div>
                    <div
                      class={
                        "md:w-[1px] h-[1px] w-full md:h-full bg-neutral-200 flex-shrink-0 " +
                        (zoom === letterArray.indexOf(letter)
                          ? "dark:bg-neutral-700"
                          : "dark:bg-neutral-800 dark:group-hover/singleletter:bg-neutral-700")
                      }
                    />
                    <div class="w-full h-1/3 md:h-full flex flex-col justify-end">
                      <img
                        src={letter.signature}
                        alt="Signature"
                        class="md:w-64 w-64 md:h-auto object-contain dark:invert"
                      />
                    </div>
                  </div>
                  {letter.handle && (
                    <div
                      style={{
                        opacity:
                          zoom === letterArray.indexOf(letter) ? "100%" : "0%",
                      }}
                      class={
                        "absolute -top-8 transition-opacity pointer-events-none flex " +
                        (zoom === letterArray.indexOf(letter)
                          ? "opacity-100"
                          : "opacity-0 md:group-hover/singleletter:opacity-100")
                      }
                    >
                      <div class="flex items-center gap-3">
                        <img
                          src={`https://unavatar.io/${letter.handle}`}
                          class="w-6 h-6 rounded-full"
                        />{" "}
                        <p>{letter.handle}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <LoadingSpinner
              message={m.letters_loading()}
              class="-translate-y-32"
            />
          )}
          <div class="absolute w-full bottom-0 z-10 md:pb-24 pt-24 pb-16">
            <div
              class={
                "relative group transition-opacity " +
                (zoom !== -1 ? "opacity-0" : "")
              }
            >
              {disableButton && (
                <Tooltip position="top" class="-translate-y-3.5">
                  {m.tooltip_letter_send()}
                </Tooltip>
              )}
              <Button
                type="primary"
                class={
                  "mx-auto pl-4 relative z-20 " +
                  (disableButton || letterArray.length === 0
                    ? "opacity-30"
                    : "")
                }
                small
                disabled={disableButton || letterArray.length === 0}
                function={() => {
                  if (popup.current!.style.overflow !== "hidden") {
                    setShowLetter()
                  }
                }}
              >
                <>
                  <Plus class="mr-1" />
                  {m.button_write_letter()}
                </>
              </Button>
            </div>
            <div class="absolute bg-neutral-100 inset-0 blur-lg dark:bg-[#101010]" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SendLetter(props: {
  setShowLetter: any
  setLetters: StateUpdater<Record<string, Letter>>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const letterInput = useRef<HTMLTextAreaElement>(null)
  const handleInput = useRef<HTMLInputElement>(null)
  const [letterWritten, setLetterWritten] = useState(false)
  const [signature, setSignature] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const signField = new SignaturePad(canvasRef.current!)
    const ratio = window.devicePixelRatio || 1
    canvasRef.current!.width = canvasRef.current!.offsetWidth * ratio
    canvasRef.current!.height = canvasRef.current!.offsetHeight * ratio
    const context = canvasRef.current!.getContext("2d")!
    context.scale(ratio, ratio)

    return () => {
      signField.clear()
    }
  }, [])

  const saveSignature = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL("image/png")
      setSignature(dataURL)
    }
  }

  return (
    <div
      class="fixed inset-0 bg-black/25 z-[52] flex justify-center items-center"
      id="letter-popup"
      onClick={props.setShowLetter}
    >
      <div class="w-full md:h-3/5 h-auto max-w-6xl md:px-10 px-6">
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          style={{
            opacity: "0%",
            transform: "scale(0.95)",
          }}
          class="w-full h-full bg-white rounded-3xl relative flex justify-between md:flex-row flex-col transition-all dark:bg-neutral-900"
        >
          <Button
            type="secondary"
            rounded
            function={props.setShowLetter}
            class="absolute top-4 right-5 w-10 h-10 flex items-center justify-center z-50 backdrop-blur-lg"
          >
            <Close class="w-6 h-6 flex-shrink-0" />
          </Button>
          <div class="w-full md:h-full h-64 p-6">
            <textarea
              type="text"
              ref={letterInput}
              onInput={(e) => {
                ;(e.target as HTMLTextAreaElement).value.length > 0
                  ? setLetterWritten(true)
                  : setLetterWritten(false)
              }}
              maxLength={100}
              class="w-full h-full bg-neutral-100 px-4 py-3 resize-none rounded-xl transition-all outline-transparent focus:outline-4 focus:outline-neutral-500/10 focus:border-neutral-200 outline-offset-1 border border-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:outline-none"
            ></textarea>
          </div>
          <div class="md:w-[1px] h-[1px] w-full md:h-full bg-neutral-200 flex-shrink-0 dark:bg-neutral-800" />
          <div
            class={
              "w-full md:h-full h-3/5 p-6 flex items-end " +
              (!letterWritten ? "cursor-not-allowed" : "")
            }
          >
            <div
              class={
                "w-full md:h-auto h-full text-neutral-400 text-sm relative " +
                (!letterWritten ? "pointer-events-none" : "")
              }
            >
              <div class="relative">
                <canvas
                  ref={canvasRef}
                  onClick={() => {
                    saveSignature()
                  }}
                  onTouchEnd={() => {
                    saveSignature()
                  }}
                  class={
                    "md:h-56 h-32 w-full cursor-draw transition-colors border border-transparent hover:border-neutral-200 rounded-t-xl rounded-br-xl relative -bottom-[1px] dark:hover:border-neutral-800/5 dark:invert " +
                    (!letterWritten ? "pointer-events-none" : "")
                  }
                />
                <Button
                  type="text"
                  class="absolute right-2 -bottom-8"
                  function={() => {
                    setSignature("")
                    new SignaturePad(canvasRef.current!)
                  }}
                >
                  Reset
                </Button>
              </div>
              <div class="h-[1px] border-t w-[calc(100%-16px)] border-neutral-300 border-dotted dark:border-neutral-800" />
              <div class="flex md:justify-between md:items-end gap-8 flex-col md:flex-row items-start">
                <div class="flex items-start flex-col justify-between w-full">
                  <p class="flex-shrink-0 mt-2.5">{m.letter_signature()}</p>
                  <div class="flex items-center gap-0.5 mt-8 w-full">
                    <p class="text-black pb-0.5 flex-shrink-0 dark:text-white">
                      @
                    </p>
                    <input
                      ref={handleInput}
                      type="text"
                      placeholder="flornkm"
                      class="placeholder:text-neutral-400 text-black w-full disabled:opacity-30 disabled:cursor-not-allowed outline-0 outline-neutral-500/0 transition-all focus:outline-none focus:border-b-neutral-400 outline-offset-1 py-1 bg-white border-b border-dotted border-b-neutral-300 dark:text-white dark:bg-neutral-900 dark:border-neutral-700 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:outline-none"
                    />
                  </div>
                  <p class="flex-shrink-0 mt-2">{m.letter_handle()}</p>
                </div>
                <Button
                  type="primary"
                  rounded
                  chevron
                  disabled={signature.length === 0 || loading}
                  function={async () => {
                    setLoading(true)
                    const sendLetter = await fetch("/api/letters", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        text: letterInput.current!.value,
                        signature: signature,
                        handle: handleInput.current!.value,
                      }),
                    })

                    if (sendLetter.status === 200) {
                      props.setShowLetter(true)
                      fetchLetters().then((data) => {
                        props.setLetters(data)
                        setLoading(false)
                      })
                    } else console.error("Could not send letter")
                  }}
                >
                  {m.button_send()}
                </Button>
              </div>
            </div>
            <figure class="md:w-24 w-14 absolute top-16 md:top-8 right-8 rotate-6 group hidden md:block">
              <img
                src="/images/letter/stamp.png"
                class="pointer-events-none"
                alt="Signature Stamp"
              />
              <figcaption class="text-[10px] text-neutral-400 mt-1.5 break-all opacity-0 transition-opacity group-hover:opacity-100">
                {m.letter_roman_empire()}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  )
}
