import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Body1 } from "../design-system/body";
import { Letter } from "./letter";

interface LetterData {
  handle: string;
  message: string;
  signature: string | null;
  email?: string;
  createdAt?: string;
}

interface ApiResponse {
  letters: Record<string, LetterData>;
}

const THRESHOLD = 150;

function DraggableLetter({
  children,
  initialX = 0,
  initialY = 0,
  style,
  onReorder,
}: {
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  style?: React.CSSProperties;
  onReorder?: () => void;
}) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasReordered, setHasReordered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setHasReordered(false);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    setPosition({ x: newX, y: newY });

    if (!hasReordered && (Math.abs(newX) > THRESHOLD || Math.abs(newY) > THRESHOLD)) {
      setHasReordered(true);
      onReorder?.();
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: initialX, y: initialY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  return (
    <div
      ref={elementRef}
      style={{
        ...style,
        transform: `translate(${position.x}px, ${position.y}px) ${style?.transform || ""}`,
        transition: isDragging ? "none" : "all 0.3s ease-out",
      }}
      className="rounded-xl touch-manipulation overflow-hidden md:max-w-[450px] aspect-a4 w-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
    >
      {children}
    </div>
  );
}

export function LetterStack() {
  const { data, isLoading } = useQuery({
    queryKey: ["letters"],
    queryFn: ({ signal }) =>
      axios.get<ApiResponse>("/api/letters", {
        signal,
      }),
  });

  const [letterOrder, setLetterOrder] = useState<string[]>([]);

  useEffect(() => {
    if (data?.data?.letters) {
      const initialOrder = Object.keys(data.data.letters).reverse();
      setLetterOrder(initialOrder);
    }
  }, [data]);

  const handleReorder = (draggedId: string) => {
    setLetterOrder((current) => {
      const newOrder = current.filter((id) => id !== draggedId);
      return [...newOrder, draggedId];
    });
  };

  const letters = data?.data?.letters;

  if (!letters || isLoading)
    return (
      <div className="aspect-a4 my-8 max-w-[450px] w-full md:h-80 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-lg"></div>
    );

  if (letterOrder.length === 0)
    return (
      <div className="aspect-a4 my-8 max-w-[450px] w-full md:h-80 flex justify-center items-center border border-dashed rounded-lg border-neutral-200 dark:border-neutral-800">
        <Body1 className="text-neutral-500 dark:text-neutral-400">No letters available.</Body1>
      </div>
    );

  return (
    <div className="relative h-72 md:h-96 md:w-[512px] w-full flex flex-col justify-center items-center">
      <>
        {letterOrder.map((id, index) => {
          const letter = letters[id];
          if (!letter) return null;

          return (
            <DraggableLetter
              key={id}
              initialX={0}
              initialY={0}
              style={{
                position: "absolute",
                top: `calc(50% + ${index * -14}px)`,
                left: "50%",
                transform: `translate(-50%, -50%) scale(${1 - index * 0.05})`,
                zIndex: letterOrder.length - index,
                boxShadow: `0px ${index * 18 + 12 * index}px ${index * 2 + 8}px rgba(0, 0, 0, 0.05)`,
              }}
              onReorder={() => handleReorder(id)}
            >
              <Letter
                handle={letter.handle}
                message={letter.message}
                signature={letter.signature}
                className="select-none"
              />
            </DraggableLetter>
          );
        })}
      </>
    </div>
  );
}
