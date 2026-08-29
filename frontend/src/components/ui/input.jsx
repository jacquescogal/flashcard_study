import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 border border-input bg-card px-2.5 py-1 text-[0.875rem] transition-[border-color] duration-[90ms] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-[0.8125rem] file:font-semibold file:text-foreground placeholder:text-[var(--ink-4)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--hair-2)] disabled:bg-[var(--wash)] disabled:text-[var(--ink-disabled)] md:text-[0.8125rem]",
        "focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        "aria-invalid:border-destructive aria-invalid:bg-[var(--danger-q)] aria-invalid:focus-visible:outline-destructive",
        className
      )}
      {...props} />
  );
}

export { Input }
