"use client"

import { useTimer } from '@/lib/timer-context'
import { useState, useEffect } from 'react'

export function SubtleTimerDisplay() {
  const { timerState } = useTimer()
  const [showCompletion, setShowCompletion] = useState(false)

  // Show completion indicator when timer completes
  useEffect(() => {
    if (timerState.isComplete) {
      setShowCompletion(true)
      const timer = setTimeout(() => setShowCompletion(false), 3000) // Show for 3 seconds
      return () => clearTimeout(timer)
    }
  }, [timerState.isComplete])

  // Don't render if timer is not active and not showing completion
  if (!timerState.isActive && !showCompletion) {
    return null
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'focus': return 'text-orange-400'
      case 'break': return 'text-green-400'
      case 'debrief': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {showCompletion ? (
        <div className="text-4xl font-mono font-bold opacity-60 text-red-400 animate-pulse">
          COMPLETE!
        </div>
      ) : (
        <div className={`text-5xl font-mono font-bold opacity-40 ${getModeColor(timerState.mode)} ${timerState.timeLeft <= 10 ? 'animate-pulse' : ''}`}>
          {formatTime(timerState.timeLeft)}
        </div>
      )}
    </div>
  )
} 