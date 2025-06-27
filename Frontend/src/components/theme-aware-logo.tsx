"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ThemeAwareLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "small" | "medium" | "large"
  variant?: "full" | "compact"
  theme?: "dark" | "light" | "auto"
}

export function ThemeAwareLogo({ 
  className, 
  size = "medium", 
  variant = "full",
  theme = "auto",
  ...props 
}: ThemeAwareLogoProps) {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    if (theme === "auto") {
      // Check if we're in a dark background context
      const checkDarkMode = () => {
        const body = document.body
        const computedStyle = window.getComputedStyle(body)
        const bgColor = computedStyle.backgroundColor
        // Simple heuristic: if background is dark, use dark logo
        setIsDark(bgColor === 'rgb(0, 0, 0)' || body.classList.contains('dark'))
      }
      checkDarkMode()
    } else {
      setIsDark(theme === "dark")
    }
  }, [theme])

  const getDimensions = () => {
    if (variant === "compact") {
      switch (size) {
        case "small": return { width: 40, height: 40 }
        case "medium": return { width: 60, height: 60 }
        case "large": return { width: 80, height: 80 }
      }
    } else {
      switch (size) {
        case "small": return { width: 120, height: 30 }
        case "medium": return { width: 160, height: 40 }
        case "large": return { width: 200, height: 50 }
      }
    }
  }

  const getLogoPath = () => {
    const themePrefix = isDark ? "dark" : "light"
    const sizePrefix = variant === "compact" ? "small" : "full"
    return `/lagrieta-logo-${themePrefix}-${sizePrefix}.svg`
  }

  const dimensions = getDimensions()

  return (
    <div className={cn("relative flex items-center", className)} {...props}>
      <Image
        src={getLogoPath()}
        alt="LA GRIETA"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        priority
      />
    </div>
  )
} 