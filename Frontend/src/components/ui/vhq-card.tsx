import * as React from "react"
import { cn } from "@/lib/utils"

interface VHQCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "primary" | "subtle"
  children: React.ReactNode
}

const VHQCard = React.forwardRef<HTMLDivElement, VHQCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-gradient-to-br from-card to-muted border-border hover:from-accent hover:to-muted",
      interactive: "bg-gradient-to-br from-card to-muted border-border hover:from-accent hover:to-muted hover:shadow-lg cursor-pointer transition-all duration-200",
      primary: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
      subtle: "bg-gradient-to-br from-background to-card border-border/50",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "border text-card-foreground shadow-md p-6",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

VHQCard.displayName = "VHQCard"

interface VHQCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const VHQCardHeader = React.forwardRef<HTMLDivElement, VHQCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 mb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
)

VHQCardHeader.displayName = "VHQCardHeader"

interface VHQCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const VHQCardTitle = React.forwardRef<HTMLHeadingElement, VHQCardTitleProps>(
  ({ className, children, level = 3, ...props }, ref) => {
    const Component = `h${level}` as keyof JSX.IntrinsicElements

    return (
      <Component
        ref={ref}
        className={cn(
          "font-semibold leading-none tracking-tight text-foreground",
          level === 1 && "text-3xl",
          level === 2 && "text-2xl", 
          level === 3 && "text-xl",
          level === 4 && "text-lg",
          level === 5 && "text-base",
          level === 6 && "text-sm",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

VHQCardTitle.displayName = "VHQCardTitle"

interface VHQCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const VHQCardContent = React.forwardRef<HTMLDivElement, VHQCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("text-foreground", className)} {...props}>
      {children}
    </div>
  )
)

VHQCardContent.displayName = "VHQCardContent"

interface VHQCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const VHQCardFooter = React.forwardRef<HTMLDivElement, VHQCardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between mt-4 pt-4 border-t border-border/50", className)}
      {...props}
    >
      {children}
    </div>
  )
)

VHQCardFooter.displayName = "VHQCardFooter"

export { VHQCard, VHQCardHeader, VHQCardTitle, VHQCardContent, VHQCardFooter } 