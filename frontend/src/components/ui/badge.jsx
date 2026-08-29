import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] tabular-nums whitespace-nowrap transition-[color,background-color,border-color] duration-[90ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-[var(--accent)] bg-[var(--accent)] text-white [a&]:hover:bg-[var(--ink)] [a&]:hover:border-[var(--ink)]",
        secondary:
          "border-[var(--rule)] bg-[var(--w)] text-[var(--ink)] [a&]:hover:bg-[var(--signal)]",
        destructive:
          "border-[var(--danger)] bg-[var(--danger-q)] text-[var(--danger)] [a&]:hover:bg-[var(--danger)] [a&]:hover:text-white",
        outline:
          "border-[var(--hair-2)] bg-card text-[var(--ink-3)] [a&]:hover:border-[var(--rule)] [a&]:hover:text-[var(--ink)]",
        ghost: "border-transparent text-[var(--ink-3)] [a&]:hover:bg-[var(--wash)]",
        link: "border-transparent text-[var(--accent)] underline-offset-[0.2em] [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
