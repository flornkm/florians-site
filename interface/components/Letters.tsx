import { useRef, useState, useEffect } from "preact/hooks"
import Close from "~icons/eva/close-outline"
import NoPrerender from "./NoPrerender"

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
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  if (typeof window !== "undefined") document.body.style.overflow = "hidden"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="w-full h-3/5 max-w-6xl px-10">
        <div className="w-full h-full bg-white rounded-2xl relative flex justify-between">
          <Close className="absolute top-4 right-4 w-9 h-9 p-1 bg-zinc-100 rounded-full cursor-pointer transition-colors hover:bg-zinc-200" />
          <div className="w-full h-full p-6">
            <textarea
              type="text"
              className="w-full h-full bg-zinc-100 px-4 py-3 resize-none rounded-xl transition-all outline-transparent focus:outline-4 focus:outline-zinc-500/10 focus:border-zinc-300 outline-offset-1 border border-zinc-200"
            ></textarea>
          </div>
          <div className="w-[1px] h-full bg-zinc-200 flex-shrink-0" />
          <div className="w-full h-full p-6 flex items-end">
            <div className="w-full text-zinc-400 text-sm relative">
              {/* <canvas
                ref={canvasRef}
                className="h-56 w-3/4 cursor-draw"
              /> */}
              <svg className="h-56 w-3/4 cursor-draw" />
              <div className="h-[1px] border-t w-3/5 border-zinc-300 border-dotted mb-2" />
              Signature
            </div>
            <img
              className="w-48 absolute bottom-0 right-0 pointer-events-none"
              src="/images/letter/signature-stamp.png"
              alt="Signature Stamp"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
