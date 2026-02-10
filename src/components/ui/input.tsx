import { cn } from "@/lib/utils";

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full text-base outline-0 transition-all duration-150 focus-visible:-outline-offset-2 focus-visible:outline-2 rounded-xl border border-primary outline-primary h-10 px-3 bg-transparent focus-visible:bg-surface-secondary focus-visible:outline-secondary focus-visible:border-secondary",
        props.className,
      )}
    />
  );
}
