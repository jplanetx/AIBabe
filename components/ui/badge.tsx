import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        personality: {
          SUPPORTIVE: "border-transparent bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
          PLAYFUL: "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
          INTELLECTUAL: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          ADMIRER: "border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
          GROWTH: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
        },
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };