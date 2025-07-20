import { cn } from "@/lib/utils";

export default function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cn("text-ms font-medium", props.className)} />;
}
