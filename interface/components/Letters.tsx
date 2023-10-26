import { useRef, useState, useEffect } from "preact/hooks"
import SignaturePad from "signature_pad"
import Close from "~icons/eva/close-outline"
import Plus from "~icons/eva/plus-outline"
import NoPrerender from "./NoPrerender"
import Button from "./Button"

export type Letter = {
  id: string
  text: string
  signature: string
  handle: string
}

export default function Letters({ letters }: { letters: Letter[] }) {
  const popup = useRef<HTMLDivElement>(null)
  const [disableButton, setDisableButton] = useState(false)

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
    }
  }

  return (
    <>
      <div class="mb-16">
        <h3 class="text-2xl font-semibold text-center mb-8">
          Letters sent to this site
        </h3>
        <Button
          type="secondary"
          class="mx-auto pl-4"
          small
          disabled={disableButton}
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
      <div>
        <div ref={popup} style={{ opacity: "0%", pointerEvents: "none" }}>
          <NoPrerender>
            <SendLetter setShowLetter={setShowLetter} />
          </NoPrerender>
        </div>
        {letters.map((letter) => (
          <p>
            {letter.text}
            <img src={letter.signature} alt="Signature" />
            <p>{letter.handle}</p>
          </p>
        ))}
      </div>
    </>
  )
}

function SendLetter(props: { setShowLetter: any }) {
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
      className="fixed inset-0 bg-black/25 z-50 flex justify-center items-center"
      onClick={props.setShowLetter}
    >
      <div className="w-full md:h-3/5 h-3/4 max-w-6xl px-10">
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          style={{
            opacity: "0%",
            transform: "scale(0.95)",
          }}
          className="w-full h-full bg-white rounded-3xl relative flex justify-between md:flex-row flex-col transition-all"
        >
          <Close
            onClick={props.setShowLetter}
            className="absolute z-10 top-4 border right-4 w-9 h-9 p-1 text-black bg-zinc-50 hover:bg-white hover:text-zinc-800 border-zinc-200 transition-colors rounded-full cursor-pointer shadow-xl"
          />
          <div className="w-full h-full p-6">
            <textarea
              type="text"
              ref={letterInput}
              onInput={(e) => {
                ;(e.target as HTMLTextAreaElement).value.length > 0
                  ? setLetterWritten(true)
                  : setLetterWritten(false)
              }}
              className="w-full h-full bg-zinc-100 px-4 py-3 resize-none rounded-xl transition-all outline-transparent focus:outline-4 focus:outline-zinc-500/10 focus:border-zinc-300 outline-offset-1 border border-zinc-200"
            ></textarea>
          </div>
          <div className="md:w-[1px] h-[1px] w-full md:h-full bg-zinc-200 flex-shrink-0" />
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
                  "md:h-56 h-48 w-full cursor-draw transition-colors border border-transparent hover:border-zinc-100 rounded-t-xl rounded-br-xl relative -bottom-[1px] " +
                  (!letterWritten ? "pointer-events-none" : "")
                }
              />
              <div className="h-[1px] border-t w-[calc(100%-16px)] border-zinc-300 border-dotted" />
              <div class="flex justify-between items-end gap-8">
                <div class="flex items-start flex-col justify-between w-full">
                  <p class="flex-shrink-0 mt-2.5">Signature</p>
                  <input
                    ref={handleInput}
                    type="text"
                    placeholder="@floriandwt"
                    class="placeholder:text-zinc-400 mt-8 text-black w-full disabled:opacity-30 disabled:cursor-not-allowed outline-0 outline-zinc-500/0 transition-all focus:outline-none focus:border-b-zinc-400 outline-offset-1 py-1 bg-white border-b border-dotted border-b-zinc-300"
                  />
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
                    // const link = document.createElement("a")
                    // link.download = "letter.png"
                    // link.href = signature
                    // link.click()
                    props.setShowLetter(true)
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
            <figure className="w-32 absolute top-8 right-8 rotate-6 group">
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
