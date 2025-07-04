"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Power } from "lucide-react"

interface AgentPowerButtonProps {
  isActive: boolean
  isProcessing?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
  label?: string
}

export const AgentPowerButton: React.FC<AgentPowerButtonProps> = ({
  isActive,
  isProcessing = false,
  onClick,
  disabled = false,
  className,
  label = "Toggle agent"
}) => {
  // Color logic
  let colorClass = "text-gray-400"
  if (isProcessing) colorClass = "text-amber-500 animate-pulse"
  else if (isActive) colorClass = "text-green-500"

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={cn(
        "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring rounded-full p-0.5",
        colorClass,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Power size={16} strokeWidth={2.5} />
    </button>
  )
} 