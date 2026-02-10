import React from "react";

type AnchorProps = React.ComponentPropsWithRef<"a">;

export const Link = React.forwardRef<HTMLAnchorElement, AnchorProps>(function Link(props, ref) {
  const { href, ...rest } = props;
  return <a ref={ref} href={href} {...rest} />;
});

Link.displayName = "Link";
