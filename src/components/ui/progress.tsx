import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { accent?: "ink" | "gold" | "mint" }
>(({ className, value, accent = "gold", ...props }, ref) => {
  const bar =
    accent === "ink" ? "bg-[var(--color-ink)]" :
    accent === "mint" ? "bg-[var(--color-mint)]" :
    "bg-[var(--color-gold)]";
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-[3px] w-full overflow-hidden rounded-full bg-[var(--color-border)]",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]", bar)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
