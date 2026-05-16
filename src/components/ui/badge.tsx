import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border-2 border-black px-2.5 py-0.5 text-xs font-display uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[2px_2px_0_0_hsl(0_0%_0%)]",
        secondary: "bg-secondary text-secondary-foreground shadow-[2px_2px_0_0_hsl(0_0%_0%)]",
        destructive: "bg-destructive text-destructive-foreground shadow-[2px_2px_0_0_hsl(0_0%_0%)]",
        accent: "bg-accent text-accent-foreground shadow-[2px_2px_0_0_hsl(0_0%_0%)]",
        outline: "bg-white text-foreground shadow-[2px_2px_0_0_hsl(0_0%_0%)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
