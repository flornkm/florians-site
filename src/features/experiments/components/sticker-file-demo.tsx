import { StickerFileCanvas } from "./sticker-file-canvas";

export function StickerFile() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <StickerFileCanvas />
    </div>
  );
}
