import { cn } from "@/lib/utils";

export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full text-ms rounded-xl border border-neutral-200 py-2 scroll-py-2 px-3 dark:border-neutral-800 focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-950 dark:focus-visible:border-neutral-700 outline-neutral-100 dark:outline-neutral-900 dark:focus-visible:!outline-neutral-900",
        props.className,
      )}
    />
  );
}
