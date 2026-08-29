import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border text-[0.75rem] font-bold tracking-[0.04em] uppercase whitespace-nowrap transition-[background-color,border-color,color] duration-[90ms] ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:pointer-events-none disabled:border-[var(--hair-2)] disabled:bg-[var(--wash)] disabled:text-[var(--ink-disabled)] aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[var(--accent)] bg-primary text-primary-foreground hover:border-[var(--ink)] hover:bg-[var(--ink)]",
        destructive:
          "border-[var(--danger)] bg-destructive text-white hover:border-[var(--ink)] hover:bg-[var(--ink)]",
        outline:
          "border-[var(--rule)] bg-card text-foreground hover:bg-[var(--signal)]",
        secondary:
          "border-[var(--hair-2)] bg-secondary text-secondary-foreground hover:border-[var(--rule)] hover:bg-[var(--signal)]",
        ghost:
          "border-transparent text-[var(--ink-2)] hover:border-[var(--rule)] hover:bg-[var(--signal)] hover:text-foreground",
        link: "border-transparent normal-case tracking-[-0.005em] font-semibold text-[var(--accent)] underline-offset-[0.2em] hover:underline",
      },
      size: {
        default: "h-8 px-3 has-[>svg]:px-2.5",
        xs: "h-6 gap-1 px-2 text-[0.625rem] has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 px-2.5 text-[0.6875rem] has-[>svg]:px-2",
        lg: "h-10 px-5 text-[0.8125rem] has-[>svg]:px-4",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
