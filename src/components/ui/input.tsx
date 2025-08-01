import { cn } from "@/lib/utils";

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full text-ms rounded-xl border border-neutral-200 dark:border-neutral-800 h-10 px-3 focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-950 dark:focus-visible:border-neutral-800 outline-neutral-900 dark:focus-visible:!outline-neutral-900",
        props.className,
      )}
    />
  );
}
