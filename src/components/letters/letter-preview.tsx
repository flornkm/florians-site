import { useCallback, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Letter } from "./letter";
import { useLetterEditor } from "./letter-editor-context";

export default function LetterPreview() {
  const { formValues, signature, isEmpty } = useLetterEditor();
  const nodeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <div className="w-full px-8 py-8 flex-1 sticky flex justify-center items-center h-full bg-neutral-100 overflow-hidden dark:bg-neutral-950">
      <Draggable nodeRef={nodeRef} position={position} onStart={handleDragStart} onStop={handleDragStop}>
        <Letter
          ref={nodeRef}
          variant="preview"
          message={formValues.message}
          handle={formValues.handle}
          signature={signature}
          isEmpty={isEmpty}
          isDragging={isDragging}
        />
      </Draggable>
    </div>
  );
}
