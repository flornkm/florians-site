import { cn } from "../../lib/utils";

const variants = {
  primary: "bg-black text-white hover:bg-neutral-800",
  secondary: "bg-neutral-200 text-neutral-900 hover:bg-neutral-100",
};

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return (
    <button
      className={cn(
        "rounded-lg cursor-pointer text-sm font-medium px-2.5 py-1 transition-all duration-200 ease-in-out",
        variants[props.variant ?? "primary"],
        props.className,
      )}
      {...props}
    >
      {props.children}
    </button>
  );
}
