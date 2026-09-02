import { Link as RouterLink } from "@tanstack/react-router";
import React from "react";

type AnchorProps = React.ComponentPropsWithRef<"a">;

export const Link = React.forwardRef<HTMLAnchorElement, AnchorProps>(function Link(props, ref) {
  const { href, target, ...rest } = props;

  const isExternal =
    !href ||
    target === "_blank" ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#");

  if (isExternal) {
    return <a ref={ref} href={href} target={target} {...rest} />;
  }

  return <RouterLink ref={ref} to={href} {...rest} />;
});

Link.displayName = "Link";
