"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { playSound } from './sound-utils'

interface TimerState {
  isActive: boolean
  timeLeft: number
  mode: 'focus' | 'break' | 'debrief'
  isComplete: boolean
  customHours: string
  customMinutes: string
}

interface TimerContextType {
  timerState: TimerState
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  setCustomTime: (hours: string, minutes: string) => void
  changeTimerMode: (mode: 'focus' | 'break' | 'debrief') => void
  dismissTimerAlert: () => void
  setTimerComplete: (complete: boolean) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    mode: 'focus',
    isComplete: false,
    customHours: '0',
    customMinutes: '25'
  })

  // Background timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (timerState.isActive && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (prev.timeLeft <= 1) {
            // Timer completed
            playSound('timerComplete', 0.6)
            return {
              ...prev,
              isActive: false,
              timeLeft: 0,
              isComplete: true
            }
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          }
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [timerState.isActive, timerState.timeLeft])

  const startTimer = () => {
    setTimerState(prev => ({ ...prev, isActive: true, isComplete: false }))
    playSound('click', 0.3)
  }

  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isActive: false }))
    playSound('click', 0.3)
  }

  const resetTimer = () => {
    const totalSeconds = (parseInt(timerState.customHours) * 60 + parseInt(timerState.customMinutes)) * 60
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      timeLeft: totalSeconds,
      isComplete: false
    }))
    playSound('click', 0.3)
  }

  const setCustomTime = (hours: string, minutes: string) => {
    const totalSeconds = (parseInt(hours) * 60 + parseInt(minutes)) * 60
    setTimerState(prev => ({
      ...prev,
      customHours: hours,
      customMinutes: minutes,
      timeLeft: totalSeconds
    }))
  }

  const changeTimerMode = (mode: 'focus' | 'break' | 'debrief') => {
    let timeLeft: number
    let customHours: string
    let customMinutes: string

    switch (mode) {
      case 'focus':
        timeLeft = 25 * 60
        customHours = '0'
        customMinutes = '25'
        break
      case 'break':
        timeLeft = 5 * 60
        customHours = '0'
        customMinutes = '05'
        break
      case 'debrief':
        timeLeft = 10 * 60
        customHours = '0'
        customMinutes = '10'
        break
    }

    setTimerState(prev => ({
      ...prev,
      mode,
      timeLeft,
      customHours,
      customMinutes,
      isActive: false,
      isComplete: false
    }))
    playSound('click', 0.3)
  }

  const dismissTimerAlert = () => {
    setTimerState(prev => ({ ...prev, isComplete: false }))
  }

  const setTimerComplete = (complete: boolean) => {
    setTimerState(prev => ({ ...prev, isComplete: complete }))
  }

  const value: TimerContextType = {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    setCustomTime,
    changeTimerMode,
    dismissTimerAlert,
    setTimerComplete
  }

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
} 