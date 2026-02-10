import { cn } from "@/lib/utils";

export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full text-base rounded-xl border transition-all focus-visible:outline-2 focus-visible:-outline-offset-2 duration-150 border-border-primary py-2 scroll-py-2 px-3 outline-border-primary bg-transparent focus-visible:bg-surface-secondary focus-visible:border-border-secondary focus-visible:outline-border-secondary",
        props.className,
      )}
    />
  );
}
