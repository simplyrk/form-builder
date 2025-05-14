import React from "react"

import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  centered?: boolean
  gutter?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", centered = false, gutter = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto",
          size === "sm" && "max-w-screen-sm",
          size === "md" && "max-w-screen-md",
          size === "lg" && "max-w-screen-lg",
          size === "xl" && "max-w-screen-xl",
          size === "full" && "max-w-full",
          gutter && "px-4 sm:px-6 md:px-8",
          centered && "flex flex-col items-center",
          className
        )}
        {...props}
      />
    )
  }
)

Container.displayName = "Container"

export { Container }