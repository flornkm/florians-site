import { cn } from "@/lib/utils";

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full text-base outline-0 transition-all duration-150 focus-visible:-outline-offset-2 focus-visible:outline-2 rounded-xl border border-neutral-200 outline-neutral-100 dark:border-neutral-800 h-10 px-3 focus-visible:bg-neutral-50 focus-visible:outline-neutral-200 dark:focus-visible:bg-neutral-950 dark:focus-visible:border-neutral-700 dark:outline-neutral-900 dark:focus-visible:outline-neutral-700",
        props.className,
      )}
    />
  );
}
