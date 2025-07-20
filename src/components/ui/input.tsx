import { cn } from "@/lib/utils";

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full text-ms rounded-xl border border-neutral-200 h-10 px-3 focus-visible:bg-neutral-50",
        props.className,
      )}
    />
  );
}
