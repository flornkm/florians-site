import React from "react";

export function Link(props: React.ComponentProps<"a">) {
  return <a href={props.href} {...props} />;
}
