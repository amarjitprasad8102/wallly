import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display uppercase tracking-wide text-sm border-[3px] border-black ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        outline:
          "border-[3px] border-black bg-white text-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        accent:
          "bg-accent text-accent-foreground shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        ghost:
          "border-transparent shadow-none hover:bg-accent hover:text-accent-foreground hover:border-black",
        link:
          "border-transparent shadow-none text-primary underline-offset-4 hover:underline normal-case font-body",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
