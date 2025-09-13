import { cn } from "@/lib/utils";

export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full text-base rounded-xl border transition-all focus-visible:outline-2 focus-visible:-outline-offset-2 duration-150 border-neutral-200 py-2 scroll-py-2 px-3 outline-neutral-200 dark:border-neutral-800 focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-950 dark:focus-visible:border-neutral-700 dark:outline-neutral-900 dark:bg-neutral-900 dark:focus-visible:outline-neutral-700",
        props.className,
      )}
    />
  );
}
