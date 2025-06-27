"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  const hasEvent = (day: number) => {
    // Mock events for demo
    return [5, 12, 18, 25].includes(day)
  }

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={day}
          className={`
            h-8 flex items-center justify-center text-xs font-mono cursor-pointer
            hover:bg-gray-800 transition-colors relative
            ${isToday(day) ? "bg-red-600 text-white font-bold" : "text-gray-300"}
            ${hasEvent(day) ? "text-red-400" : ""}
          `}
        >
          {day}
          {hasEvent(day) && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full"></div>
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-white font-mono">CALENDAR</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousMonth}
            className="text-gray-400 hover:text-red-400 p-1 min-h-[32px] min-w-[32px]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono text-white min-w-[80px] text-center">
            {monthNames[month]} {year}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="text-gray-400 hover:text-red-400 p-1 min-h-[32px] min-w-[32px]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="h-6 flex items-center justify-center text-xs font-mono text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

      {/* Upcoming events */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <h3 className="text-xs font-bold text-gray-400 font-mono mb-2">UPCOMING</h3>
        <div className="space-y-1">
          <div className="text-xs text-gray-300 font-mono">Jan 29 - System Backup</div>
          <div className="text-xs text-gray-300 font-mono">Feb 01 - Content Review</div>
          <div className="text-xs text-red-400 font-mono">Feb 05 - Project Deadline</div>
        </div>
      </div>
    </div>
  )
}
