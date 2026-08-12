import { resolvePostIcon } from "@/features/writing/lib/post-icon";

export function PostIcon({ slug, className }: { slug: string; className?: string }) {
  const icon = resolvePostIcon(slug);
  return (
    <svg
      viewBox={icon.viewBox}
      className={className}
      role="img"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: icon.inner }}
    />
  );
}
