"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { Power } from "lucide-react"

interface AgentSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  isProcessing?: boolean
}

const AgentSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  AgentSwitchProps
>(({ className, isProcessing = false, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      // Color states
      isProcessing 
        ? "bg-amber-500 border-amber-400" // Amber for processing
        : "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-400 data-[state=unchecked]:bg-gray-400 data-[state=unchecked]:border-gray-300", // Green for on, gray for off
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-200 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0"
      )}
    >
      <Power 
        size={12} 
        className={cn(
          "transition-colors duration-200",
          isProcessing 
            ? "text-amber-600" // Dark amber for processing
            : "data-[state=checked]:text-green-600 data-[state=unchecked]:text-gray-500" // Dark green for on, gray for off
        )}
      />
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
))
AgentSwitch.displayName = SwitchPrimitives.Root.displayName

export { AgentSwitch } 