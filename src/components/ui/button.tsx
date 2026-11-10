import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-primary-foreground shadow-cta font-semibold tracking-wide transition-transform active:scale-[0.98] hover:brightness-105",
        glass:
          "glass text-foreground font-semibold transition-transform active:scale-[0.98] hover:bg-glass-strong",
        accent:
          "bg-gradient-accent text-accent-foreground shadow-soft font-semibold transition-transform active:scale-[0.98]",
        quiet: "text-muted-foreground hover:text-foreground",
        cta: "bg-cta text-cocoa font-bold tracking-tight hover:brightness-[1.03] active:scale-[0.99] transition-[transform,filter] disabled:opacity-60",
        vessa: "bg-gradient-primary text-ink font-semibold shadow-lift transition-transform active:scale-[0.98] hover:brightness-[1.03]",
        soft: "bg-peach/80 text-cocoa font-semibold hover:bg-peach active:scale-[0.99]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-14 rounded-full px-8 text-base [&_svg]:size-5",
        pill: "h-11 rounded-full px-5 text-sm",
        icon: "h-9 w-9",
        "icon-lg": "h-14 w-14 rounded-full [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
