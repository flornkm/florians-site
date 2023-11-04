import { useRef, useState, useEffect, StateUpdater } from "preact/hooks"
import SignaturePad from "signature_pad"
import Close from "~icons/eva/close-outline"
import Plus from "~icons/eva/plus-outline"
import Expand from "~icons/eva/expand-outline"
import Collapse from "~icons/eva/collapse-outline"
import NoPrerender from "../components/NoPrerender"
import Button from "../components/Button"
import Tooltip from "../components/Tooltip"
import LoadingSpinner from "#components/LoadingSpinner"

export type Letter = {
  id: string
  text: string
  signature: string
  handle: string
}

async function fetchLetters() {
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
    <div class="overflow-hidden pt-56" onClick={() => setZoom(-1)}>
      <h3
        class={
          "text-2xl font-semibold text-center transition-transform mb-8 " +
          (zoom !== -1 ? "md:translate-y-0 -translate-y-12" : "")
        }
      >
        Letters sent to this site
      </h3>
      <div>
        <div ref={popup} style={{ opacity: "0%", pointerEvents: "none" }}>
          <NoPrerender>
            <SendLetter setShowLetter={setShowLetter} setLetters={setLetters} />
          </NoPrerender>
        </div>
        <div class="w-full h-[512px] relative flex items-end justify-center group/letter">
          {letterArray.length > 0 ? (
            letterArray.map((letter) => {
              return (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
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
                  }}
                  class={
                    "rounded-3xl group/singleletter md:w-2/3 w-full mx-auto p-6 border border-zinc-200 bg-zinc-50 absolute shadow-2xl shadow-black/5 transition-all dark:border-zinc-800 dark:bg-zinc-950 " +
                    (zoom === letterArray.indexOf(letter)
                      ? "bg-white dark:bg-zinc-900"
                      : "md:hover:-translate-y-8 hover:bg-white hover:shadow-black/10 dark:hover:bg-zinc-900 dark:hover:shadow-none")
                  }
                >
                  {letterArray.indexOf(letter) !== zoom ? (
                    <Expand
                      onClick={() => {
                        setZoom(letterArray.indexOf(letter))
                      }}
                      className="absolute z-10 top-4 border right-4 w-9 h-9 p-1 text-white bg-black hover:bg-zinc-800 border-zinc-800 hover:border-zinc-600 transition-colors rounded-full cursor-pointer dark:text-black dark:bg-white dark:hover:bg-zinc-200 dark:border-zinc-200 dark:hover:border-zinc-400"
                    />
                  ) : (
                    <Collapse
                      onClick={() => {
                        setZoom(-1)
                      }}
                      className="absolute z-10 top-4 border right-4 w-9 h-9 p-1 text-white bg-black hover:bg-zinc-800 border-zinc-800 hover:border-zinc-600 transition-colors rounded-full cursor-pointer dark:text-black dark:bg-white dark:hover:bg-zinc-200 dark:border-zinc-200 dark:hover:border-zinc-400"
                    />
                  )}
                  <img
                    src="/images/letter/stamp.png"
                    class="pointer-events-none w-20 absolute top-8 md:block hidden right-8 rotate-6"
                    alt="Signature Stamp"
                  />
                  <div class="w-full h-80 flex gap-4 md:flex-row flex-col">
                    <div
                      class={
                        "w-full h-full overflow-x-scroll " +
                        (zoom === letterArray.indexOf(letter)
                          ? "text-black dark:text-white"
                          : "text-zinc-400 group-hover/singleletter:text-black dark:group-hover/singleletter:text-white")
                      }
                    >
                      <p class="pr-8">{letter.text}</p>
                    </div>
                    <div className="md:w-[1px] h-[1px] w-full md:h-full bg-zinc-200 flex-shrink-0 dark:bg-zinc-800" />
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
                          className="w-6 h-6 rounded-full"
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
              message="💌 Fetching letters from endpoint"
              class="-translate-y-32"
            />
          )}
          <div class="absolute w-full bottom-0 z-10 md:pb-32 pt-24 pb-16">
            <div
              class={
                "relative group transition-opacity " +
                (zoom !== -1 ? "opacity-0" : "")
              }
            >
              {disableButton && (
                <Tooltip position="top" class="-translate-y-3.5">
                  Letter already sent
                </Tooltip>
              )}
              <Button
                type="secondary"
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
                  Write a letter
                </>
              </Button>
            </div>
            <div class="absolute bg-light-zinc inset-0 blur-lg dark:bg-black" />
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

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      props.setShowLetter()
      window.removeEventListener("keydown", () => {})
    }
  })

  return (
    <div
      className="fixed inset-0 bg-black/25 z-[52] flex justify-center items-center"
      onClick={props.setShowLetter}
    >
      <div className="w-full md:h-3/5 h-auto max-w-6xl md:px-10 px-6">
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          style={{
            opacity: "0%",
            transform: "scale(0.95)",
          }}
          className="w-full h-full bg-white rounded-3xl relative flex justify-between md:flex-row flex-col transition-all dark:bg-zinc-900"
        >
          <Close
            onClick={props.setShowLetter}
            className="absolute z-10 top-4 border right-4 w-9 h-9 p-1 text-black bg-zinc-50 hover:bg-white hover:text-zinc-800 border-zinc-200 transition-colors rounded-full cursor-pointer shadow-xl dark:text-black dark:bg-white dark:hover:bg-zinc-200 dark:border-zinc-200 dark:hover:border-zinc-400"
          />
          <div className="w-full md:h-full h-64 p-6">
            <textarea
              type="text"
              ref={letterInput}
              onInput={(e) => {
                ;(e.target as HTMLTextAreaElement).value.length > 0
                  ? setLetterWritten(true)
                  : setLetterWritten(false)
              }}
              className="w-full h-full bg-zinc-100 px-4 py-3 resize-none rounded-xl transition-all outline-transparent focus:outline-4 focus:outline-zinc-500/10 focus:border-zinc-300 outline-offset-1 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:outline-none"
            ></textarea>
          </div>
          <div className="md:w-[1px] h-[1px] w-full md:h-full bg-zinc-200 flex-shrink-0 dark:bg-zinc-800" />
          <div
            className={
              "w-full md:h-full h-3/5 p-6 flex items-end " +
              (!letterWritten ? "cursor-not-allowed" : "")
            }
          >
            <div
              className={
                "w-full md:h-auto h-full text-zinc-400 text-sm relative " +
                (!letterWritten ? "pointer-events-none" : "")
              }
            >
              <canvas
                ref={canvasRef}
                onClick={() => {
                  saveSignature()
                }}
                className={
                  "md:h-56 h-32 w-full cursor-draw transition-colors border border-transparent hover:border-zinc-100 rounded-t-xl rounded-br-xl relative -bottom-[1px] dark:hover:border-zinc-800/5 dark:invert " +
                  (!letterWritten ? "pointer-events-none" : "")
                }
              />
              <div className="h-[1px] border-t w-[calc(100%-16px)] border-zinc-300 border-dotted dark:border-zinc-800" />
              <div class="flex md:justify-between md:items-end gap-8 flex-col md:flex-row items-start">
                <div class="flex items-start flex-col justify-between w-full">
                  <p class="flex-shrink-0 mt-2.5">Signature</p>
                  <div class="flex items-center gap-0.5 mt-8 w-full">
                    <p class="text-black pb-0.5 flex-shrink-0 dark:text-white">
                      @
                    </p>
                    <input
                      ref={handleInput}
                      type="text"
                      placeholder="floriandwt"
                      class="placeholder:text-zinc-400 text-black w-full disabled:opacity-30 disabled:cursor-not-allowed outline-0 outline-zinc-500/0 transition-all focus:outline-none focus:border-b-zinc-400 outline-offset-1 py-1 bg-white border-b border-dotted border-b-zinc-300 dark:text-white dark:bg-zinc-900 dark:border-zinc-700 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:outline-none"
                    />
                  </div>
                  <p class="flex-shrink-0 mt-2">
                    Social Media Handle (Optional)
                  </p>
                </div>
                <Button
                  type="primary"
                  rounded
                  chevron
                  disabled={signature.length === 0}
                  function={async () => {
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
                      })
                    } else console.error("Could not send letter")
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
            <figure className="md:w-24 w-14 absolute top-16 md:top-8 right-8 rotate-6 group hidden md:block">
              <img
                src="/images/letter/stamp.png"
                class="pointer-events-none"
                alt="Signature Stamp"
              />
              <figcaption class="text-[10px] text-zinc-400 mt-1.5 break-all opacity-0 transition-opacity group-hover:opacity-100">
                Did I timetravel to the roman empire?
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  )
}
