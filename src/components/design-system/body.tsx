import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import React from "react";

export const bodyVariants = cva("text-neutral-500 dark:text-neutral-400", {
  variants: {
    variant: {
      body1: "text-base",
      body2: "text-ms",
      body3: "text-sm",
      body4: "text-xs",
    },
  },
});

export const Body1 = (props: React.ButtonHTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p {...props} className={cn(bodyVariants({ variant: "body1" }), props.className)}>
      {props.children}
    </p>
  );
};

export const Body2 = (props: React.ButtonHTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p {...props} className={cn(bodyVariants({ variant: "body2" }), props.className)}>
      {props.children}
    </p>
  );
};

export const Body3 = (props: React.ButtonHTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p {...props} className={cn(bodyVariants({ variant: "body3" }), props.className)}>
      {props.children}
    </p>
  );
};

export const Body4 = (props: React.ButtonHTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p {...props} className={cn(bodyVariants({ variant: "body4" }), props.className)}>
      {props.children}
    </p>
  );
};
