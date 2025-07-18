import { cn } from "@/lib/utils";

export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full text-sm rounded-xl border border-neutral-200 py-2 scroll-py-2 px-3 focus-visible:bg-neutral-50",
        props.className,
      )}
    />
  );
}
