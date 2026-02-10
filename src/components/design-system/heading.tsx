import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React from "react";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const headingVariants = cva("font-semibold text-primary", {
  variants: {
    size: {
      h1: "text-lg font-semibold",
      h2: "text-base font-semibold",
      h3: "text-ms font-semibold",
      h4: "text-sm font-medium",
      h5: "text-xs font-medium",
      h6: "text-xs font-normal",
    },
  },
});

export const H1 = ({ children, className = "", ...props }: HeadingProps) => {
  return (
    <h1 className={cn(headingVariants({ size: "h1" }), className)} {...props}>
      {children}
    </h1>
  );
};

export const H2 = ({ children, className = "", ...props }: HeadingProps) => {
  return (
    <h2 className={cn(headingVariants({ size: "h2" }), className)} {...props}>
      {children}
    </h2>
  );
};

export const H3 = ({ children, className = "", ...props }: HeadingProps) => {
  return (
    <h3 className={cn(headingVariants({ size: "h3" }), className)} {...props}>
      {children}
    </h3>
  );
};

export const H4 = ({ children, className = "", ...props }: HeadingProps) => {
  return (
    <h4 className={cn(headingVariants({ size: "h4" }), className)} {...props}>
      {children}
    </h4>
  );
};

export const H5 = ({ children, className = "", ...props }: HeadingProps) => {
  return (
    <h5 className={cn(headingVariants({ size: "h5" }), className)} {...props}>
      {children}
    </h5>
  );
};

export const H6 = ({ children, className = "", ...props }: HeadingProps) => {
  return (
    <h6 className={cn(headingVariants({ size: "h6" }), className)} {...props}>
      {children}
    </h6>
  );
};
