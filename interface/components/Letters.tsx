import { useRef, useState, useEffect } from "preact/hooks"
import SignaturePad from "signature_pad"
import Close from "~icons/eva/close-outline"
import NoPrerender from "./NoPrerender"
import { useWindowResize } from "../hooks/useWindowResize"

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

  //   const letterWritten = () => {
  //     letterInput.current!.value.length > 0 &&

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
              className="w-full h-full bg-zinc-100 px-4 py-3 resize-none rounded-xl transition-all outline-transparent focus:outline-4 focus:outline-zinc-500/10 focus:border-zinc-300 outline-offset-1 border border-zinc-200"
            ></textarea>
          </div>
          <div className="md:w-[1px] h-[1px] w-full md:h-full bg-zinc-200 flex-shrink-0" />
          <div className="w-full md:h-full h-3/5 p-6 flex items-end">
            <div
              className={
                "w-full md:h-auto h-full text-zinc-400 text-sm relative " +
                (letterInput.current?.value.length === 0
                  ? "cursor-not-allowed"
                  : "")
              }
            >
              <canvas
                ref={canvasRef}
                className={
                  "md:h-56 h-48 w-full cursor-draw transition-colors border border-transparent hover:border-zinc-100 rounded-t-xl rounded-br-xl relative -bottom-[1px] " +
                  (letterInput.current?.value.length === 0
                    ? "pointer-events-none"
                    : "")
                }
              />
              <div className="h-[1px] border-t w-3/5 border-zinc-300 border-dotted mb-2" />
              Signature
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
