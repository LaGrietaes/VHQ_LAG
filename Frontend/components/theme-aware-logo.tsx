"use client"

import { useState, useEffect } from "react"

interface ThemeAwareLogoProps {
  className?: string
  size?: "small" | "large"
}

export function ThemeAwareLogo({ className = "", size = "small" }: ThemeAwareLogoProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    // Load theme from localStorage
    const savedSettings = localStorage.getItem("vhq-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setTheme(settings.theme || "dark")
    }

    // Listen for theme changes
    const handleSettingsChange = (event: CustomEvent) => {
      setTheme(event.detail.theme || "dark")
    }

    window.addEventListener("settings-changed", handleSettingsChange as EventListener)
    return () => window.removeEventListener("settings-changed", handleSettingsChange as EventListener)
  }, [])

  const getDarkLogo = () => {
    return size === "large" ? "/images/lagrieta-logo-full-light.png" : "/images/lagrieta-logo-white.png"
  }

  const getLightLogo = () => {
    return size === "large" ? "/images/lagrieta-logo-full.png" : "/images/lagrieta-logo.png"
  }

  return <img src={theme === "dark" ? getDarkLogo() : getLightLogo()} alt="LaGrieta.es" className={className} />
}
