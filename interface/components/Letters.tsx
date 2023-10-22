import { useRef, useState, useEffect } from "preact/hooks"
import SignaturePad from "signature_pad"
import Close from "~icons/eva/close-outline"
import NoPrerender from "./NoPrerender"
import Button from "./Button"

export default function Letters() {
  return (
    <div>
      <NoPrerender>
        <SendLetter />
      </NoPrerender>
    </div>
  )
}

function SendLetter() {
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

  if (typeof window !== "undefined") document.body.style.overflow = "hidden"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="w-full md:h-3/5 h-3/4 max-w-6xl px-10">
        <div className="w-full h-full bg-white rounded-2xl relative flex justify-between md:flex-row flex-col">
          <Close className="absolute top-4 right-4 w-9 h-9 p-1 bg-zinc-100 rounded-full cursor-pointer transition-colors hover:bg-zinc-200" />
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
              <div className="h-[1px] border-t w-3/5 border-zinc-300 border-dotted mb-2" />
              <div class="flex justify-between items-end">
                <div class="flex items-start flex-col justify-between w-full gap-4">
                  <p class="flex-shrink-0">Signature</p>
                  <div class="flex">
                    <p class="border border-l-zinc-200 text-black bg-zinc-100 border-r-transparent flex items-center px-2 rounded-l-full">
                      @
                    </p>
                    <input
                      ref={handleInput}
                      type="text"
                      placeholder="Social Media Handle (Optional)"
                      class="placeholder:text-zinc-400 text-black w-56 disabled:opacity-30 disabled:cursor-not-allowed outline-0 outline-zinc-500/0 transition-all focus:outline-4 focus:outline-zinc-500/10 focus:border-zinc-300 outline-offset-1 px-2 py-1 rounded-r-full bg-white border border-zinc-200"
                    />
                  </div>
                </div>
                <Button
                  type="primary"
                  rounded
                  chevron
                  disabled={signature.length === 0}
                  function={() => {
                    const link = document.createElement("a")
                    link.download = "letter.png"
                    link.href = signature
                    link.click()
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
            <img
              className="w-48 absolute top-0 right-0 pointer-events-none"
              src="/images/letter/signature-stamp.png"
              alt="Signature Stamp"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
