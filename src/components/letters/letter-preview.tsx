import { cn } from "@/lib/utils";
import { FormValues } from "./letter-form";

export interface LetterPreviewProps {
  formValues: FormValues;
  signature: string | null;
  isFormEmpty: boolean;
}

export default function LetterPreview({ formValues, signature, isFormEmpty }: LetterPreviewProps) {
  return (
    <div className="w-full px-8 py-8 flex-1 sticky flex justify-center items-center h-full bg-neutral-100 dark:bg-neutral-950">
      <div
        className={cn(
          "aspect-[1.4142857143/1] shrink-0 w-full transition-all duration-300 ease-out mx-auto max-w-xs md:max-w-sm p-4 bg-white dark:bg-neutral-900 dark:border-neutral-800 rounded-xl border border-neutral-200 flex",
          isFormEmpty && "scale-95",
          !isFormEmpty && "scale-100 shadow-2xl shadow-black/5",
        )}
      >
        <div className="flex-1 max-w-1/2 flex flex-col gap-4 pr-8">
          <div
            className={cn(
              "transition-all duration-300 w-full flex-1",
              formValues.message && "opacity-100",
              !formValues.message && "opacity-0",
            )}
          >
            <p className="text-ms max-w-xs break-all">
              <span className="font-semibold">Dear Website,</span> <br />
              {formValues.message}
            </p>
          </div>
          <div
            className={cn("flex-1 flex items-end", formValues.name && "opacity-100", !formValues.name && "opacity-0")}
          >
            <p className="text-ms font-medium text-neutral-500">
              Sincerely,
              <span className="inline-flex ml-2 items-center gap-1 translate-y-[3px]">
                <div className="w-4 h-4 rounded-full border border-neutral-200 relative">
                  <img
                    src={`https://unavatar.io/${formValues.name}`}
                    alt={formValues.name}
                    className="relative z-10 rounded-full"
                  />
                  <div className="absolute inset-0 animate-pulse" />
                </div>
                @{formValues.name}
              </span>
            </p>
          </div>
        </div>
        <div className="h-full shrink-0 w-px bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex-1 shrink-0 w-full flex flex-col h-full items-end justify-between">
          <img
            src="/images/letters/letter-stamp.webp"
            alt="Stamp"
            className={cn(
              "w-18 mr-4 transition-all duration-300 delay-100 ease-out perspective-normal origin-bottom-left relative z-10 dark:invert dark:selection:bg-amber-500/25",
              isFormEmpty && "opacity-0 mr-2 scale-105 shadow-2xl dark:shadow-white rotate-2",
              !isFormEmpty && "opacity-100 scale-100 rotate-4",
            )}
          />
          {signature && (
            <div className="w-full max-w-[200px]">
              <img src={signature} alt="Signature" className="w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
