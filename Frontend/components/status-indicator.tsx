"use client"

import { useEffect, useState } from "react"

export function StatusIndicator() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-red-600 rounded-full glitch-dot"></div>
        <span className="text-xs text-green-400 font-mono">SYSTEM ONLINE</span>
      </div>
      <div className="text-xs text-gray-400 font-mono">{currentTime.toLocaleTimeString()}</div>
    </div>
  )
}
