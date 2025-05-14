import * as React from "react"

import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:translate-y-0.5 border border-transparent",
        destructive:
          "bg-danger text-danger-foreground shadow-sm hover:bg-danger/90 active:translate-y-0.5 border border-transparent",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:translate-y-0.5 border border-transparent",
        ghost: 
          "hover:bg-accent/40 hover:text-accent-foreground active:translate-y-0.5",
        link: 
          "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground shadow-sm hover:bg-success/90 active:translate-y-0.5 border border-transparent",
        warning:
          "bg-warning text-warning-foreground shadow-sm hover:bg-warning/90 active:translate-y-0.5 border border-transparent",
        info:
          "bg-info text-info-foreground shadow-sm hover:bg-info/90 active:translate-y-0.5 border border-transparent",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3 py-1.5 text-xs",
        lg: "h-11 rounded-md px-8 py-2.5 text-base",
        xl: "h-12 rounded-md px-10 py-3 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 text-xs",
        "icon-lg": "h-12 w-12 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }