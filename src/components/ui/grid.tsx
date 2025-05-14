import React from "react"

import { cn } from "@/lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  responsive?: boolean
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 3, gap = "md", responsive = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          gap === "none" && "gap-0",
          gap === "sm" && "gap-4",
          gap === "md" && "gap-6",
          gap === "lg" && "gap-8",
          gap === "xl" && "gap-10",
          responsive
            ? {
                1: "grid-cols-1",
                2: "grid-cols-1 sm:grid-cols-2",
                3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
                5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
                6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
              }[cols]
            : {
                1: "grid-cols-1",
                2: "grid-cols-2",
                3: "grid-cols-3",
                4: "grid-cols-4",
                5: "grid-cols-5",
                6: "grid-cols-6",
              }[cols],
          className
        )}
        {...props}
      />
    )
  }
)

Grid.displayName = "Grid"

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | "full"
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          colSpan === 1 && "col-span-1",
          colSpan === 2 && "col-span-2",
          colSpan === 3 && "col-span-3",
          colSpan === 4 && "col-span-4",
          colSpan === 5 && "col-span-5",
          colSpan === 6 && "col-span-6",
          colSpan === "full" && "col-span-full",
          className
        )}
        {...props}
      />
    )
  }
)

GridItem.displayName = "GridItem"

export { Grid, GridItem }