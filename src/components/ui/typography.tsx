import React from "react"

import { cn } from "@/lib/utils"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

// Using individual heading components instead of dynamic elements
const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn("text-4xl font-bold tracking-tight lg:text-5xl", className)}
      {...props}
    />
  )
)
H1.displayName = "H1"

const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-3xl font-semibold tracking-tight", className)}
      {...props}
    />
  )
)
H2.displayName = "H2"

const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  )
)
H3.displayName = "H3"

const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  )
)
H4.displayName = "H4"

const H5 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("text-lg font-medium", className)}
      {...props}
    />
  )
)
H5.displayName = "H5"

const H6 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h6
      ref={ref}
      className={cn("text-base font-medium", className)}
      {...props}
    />
  )
)
H6.displayName = "H6"

// Heading component that renders the appropriate heading level
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, className, ...props }, ref) => {
    switch (level) {
      case 1:
        return <H1 ref={ref} className={className} {...props} />
      case 3:
        return <H3 ref={ref} className={className} {...props} />
      case 4:
        return <H4 ref={ref} className={className} {...props} />
      case 5:
        return <H5 ref={ref} className={className} {...props} />
      case 6:
        return <H6 ref={ref} className={className} {...props} />
      default:
        return <H2 ref={ref} className={className} {...props} />
    }
  }
)
Heading.displayName = "Heading"

interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "default" | "lead" | "small" | "muted"
}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "leading-7",
          variant === "default" && "text-base text-foreground",
          variant === "lead" && "text-lg text-foreground",
          variant === "small" && "text-sm text-foreground",
          variant === "muted" && "text-sm text-muted-foreground",
          className
        )}
        {...props}
      />
    )
  }
)

Paragraph.displayName = "Paragraph"

interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: "default" | "check" | "bullet" | "ordered"
}

const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ className, variant = "default", ...props }, ref) => {
    if (variant === "ordered") {
      return (
        <ol
          ref={ref as React.RefObject<HTMLOListElement>}
          className={cn("my-6 ml-6 list-decimal", className)}
          {...(props as React.HTMLAttributes<HTMLOListElement>)}
        />
      )
    }

    return (
      <ul
        ref={ref}
        className={cn(
          "my-6 ml-6",
          variant === "default" && "list-disc",
          variant === "check" && "list-none",
          variant === "bullet" && "list-disc",
          className
        )}
        {...props}
      />
    )
  }
)

List.displayName = "List"

interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {}

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("mt-2", className)}
        {...props}
      />
    )
  }
)

ListItem.displayName = "ListItem"

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  block?: boolean
}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, block = false, ...props }, ref) => {
    if (block) {
      return (
        <pre
          className={cn(
            "mb-4 mt-6 overflow-x-auto rounded-lg border bg-muted p-4 text-sm",
            className
          )}
        >
          <code
            ref={ref}
            className="relative rounded px-[0.3rem] py-[0.2rem] font-mono"
            {...props}
          />
        </pre>
      )
    }

    return (
      <code
        ref={ref}
        className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
          className
        )}
        {...props}
      />
    )
  }
)

Code.displayName = "Code"

export { 
  Heading, H1, H2, H3, H4, H5, H6, 
  Paragraph, 
  List, ListItem, 
  Code
}