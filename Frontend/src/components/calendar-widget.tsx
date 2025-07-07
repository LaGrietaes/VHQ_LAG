"use client"

import { useState, useMemo, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, AtSign, Briefcase, Search, Users, Brain, Film, Folder, Star, DollarSign, Scale, Shield, Music, TrendingUp, Code, Megaphone, UserCheck, Clock, Play, Pause, RotateCcw, Target, Zap, Sun, Moon, Sunrise, Sunset } from "lucide-react"
import { Button } from "@/components/ui/button"
import { playSound } from "@/lib/sound-utils"
import { useTimer } from "@/lib/timer-context"

export type CalendarEvent = {
  date: string; // ISO date string (YYYY-MM-DD)
  label: string;
  agent?: string; // Agent name if it's a todo with agent mention
}

// Available agents for consistent colors and icons
const AVAILABLE_AGENTS = [
  { name: 'Ghost', icon: AtSign, color: 'text-purple-400' },
  { name: 'CEO', icon: Briefcase, color: 'text-yellow-400' },
  { name: 'SEO', icon: Search, color: 'text-blue-400' },
  { name: 'CM', icon: Users, color: 'text-green-400' },
  { name: 'PSICO', icon: Brain, color: 'text-pink-400' },
  { name: 'CLIP', icon: Film, color: 'text-orange-400' },
  { name: 'MEDIA', icon: Folder, color: 'text-red-400' },
  { name: 'TALENT', icon: Star, color: 'text-yellow-300' },
  { name: 'CASH', icon: DollarSign, color: 'text-green-300' },
  { name: 'LAW', icon: Scale, color: 'text-gray-400' },
  { name: 'IT', icon: Shield, color: 'text-cyan-400' },
  { name: 'DJ', icon: Music, color: 'text-purple-300' },
  { name: 'WPM', icon: TrendingUp, color: 'text-indigo-400' },
  { name: 'DEV', icon: Code, color: 'text-blue-300' },
  { name: 'ADS', icon: Megaphone, color: 'text-red-300' },
  { name: 'DONNA', icon: UserCheck, color: 'text-pink-300' },
];

export function CalendarWidget({ events = [] }: { events?: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())
  const { timerState, startTimer, pauseTimer, resetTimer, setCustomTime, changeTimerMode, dismissTimerAlert } = useTimer()
  const [showTimerAlert, setShowTimerAlert] = useState(false)
  const [worldTime, setWorldTime] = useState({
    scl: '--:--:--',
    bcn: '--:--:--',
    sfo: '--:--:--',
    hanoi: '--:--:--'
  })

  // Timer and clock effects
  useEffect(() => {
    const updateWorldTime = () => {
      try {
        setCurrentTime(new Date())
        setWorldTime({
          scl: new Date().toLocaleTimeString('en-US', { timeZone: 'America/Santiago', hour12: false }),
          bcn: new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/Madrid', hour12: false }),
          sfo: new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour12: false }),
          hanoi: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })
        })
      } catch (error) {
        console.error('Error updating world time:', error)
        // Fallback to local time with offsets
        const now = new Date()
        setWorldTime({
          scl: new Date(now.getTime() - 3 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false }), // UTC-3
          bcn: new Date(now.getTime() + 1 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false }), // UTC+1
          sfo: new Date(now.getTime() - 8 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false }), // UTC-8
          hanoi: new Date(now.getTime() + 7 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false }) // UTC+7 (Vietnam)
        })
      }
    }

    updateWorldTime() // Initial call
    const timer = setInterval(updateWorldTime, 1000)

    return () => clearInterval(timer)
  }, [])

  // Show timer alert when timer completes
  useEffect(() => {
    if (timerState.isComplete) {
      setShowTimerAlert(true)
    }
  }, [timerState.isComplete])

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCustomHoursChange = (value: string) => {
    const num = parseInt(value) || 0
    if (num >= 0 && num <= 99) {
      setCustomTime(value, timerState.customMinutes)
    }
  }

  const handleCustomMinutesChange = (value: string) => {
    const num = parseInt(value) || 0
    if (num >= 0 && num <= 59) {
      setCustomTime(timerState.customHours, value)
    }
  }

  const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  // Get agent info by name
  const getAgentInfo = (name: string) => {
    return AVAILABLE_AGENTS.find(agent => agent.name.toUpperCase() === name.toUpperCase());
  };

  // Map events to a Set of YYYY-MM-DD for fast lookup
  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(ev => {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    });
    return map;
  }, [events]);

  const hasEvent = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventMap.has(dateStr);
  }

  // Get agent colors for a specific day
  const getDayAgentColors = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = eventMap.get(dateStr) || [];
    const agents = dayEvents
      .map(ev => ev.agent ? getAgentInfo(ev.agent) : null)
      .filter(agent => agent !== null);
    
    if (agents.length === 0) return null;
    
    // Always return an array for consistency
    return agents.map(agent => agent!.color);
  }

  // Get hex color for Tailwind class
  const getHexColor = (tailwindColor: string) => {
    const colorMap: { [key: string]: string } = {
      'text-purple-400': '#c084fc',
      'text-yellow-400': '#facc15', 
      'text-blue-400': '#60a5fa',
      'text-green-400': '#4ade80',
      'text-pink-400': '#f472b6',
      'text-orange-400': '#fb923c',
      'text-yellow-300': '#fde047',
      'text-green-300': '#86efac',
      'text-gray-400': '#9ca3af',
      'text-cyan-400': '#22d3ee',
      'text-purple-300': '#d8b4fe',
      'text-indigo-400': '#818cf8',
      'text-blue-300': '#93c5fd',
      'text-pink-300': '#f9a8d4',
    };
    return colorMap[tailwindColor] || '#ffffff';
  };

  const renderCalendarDays = () => {
    const days = []
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const agentColors = getDayAgentColors(day);
      const hasEvents = hasEvent(day);
      
      // For multiple agents, create a cycling animation
      const shouldCycle = agentColors && Array.isArray(agentColors) && agentColors.length > 1;
      const primaryColor = agentColors && agentColors.length > 0 ? agentColors[0] : '';
      
      // Create dynamic cycling animation for multiple agents
      const getCyclingStyle = (colors: string[], day: number) => {
        if (colors.length <= 1) return {};
        
        const hexColors = colors.map(color => getHexColor(color));
        const duration = colors.length * 3; // 3 seconds per color
        const animationId = `colorCycle${day}_${colors.length}`;
        
        // Generate dynamic keyframes
        const stepDuration = 100 / colors.length;
        let keyframes = '';
        colors.forEach((_, index) => {
          const startPercent = index * stepDuration;
          const endPercent = (index + 1) * stepDuration;
          keyframes += `${startPercent}%, ${endPercent}% { color: ${hexColors[index]}; }`;
        });
        
        return {
          animation: `${animationId} ${duration}s infinite`,
          '--keyframes': keyframes,
          '--animation-id': animationId,
        } as React.CSSProperties;
      };
      
      days.push(
        <div
          key={day}
          className={`
            h-8 flex items-center justify-center text-xs font-mono cursor-pointer
            hover:bg-gray-800 transition-colors relative
            ${isToday(day) ? "bg-red-600 text-white font-bold" : "text-gray-300"}
            ${hasEvents && agentColors && agentColors.length > 0 ? 
              (agentColors.length === 1 ? `${agentColors[0]} font-bold` : `font-bold`) 
              : ""}
          `}
          style={shouldCycle ? getCyclingStyle(agentColors, day) : {}}
        >
          {shouldCycle && (
            <style>{`
              @keyframes ${getCyclingStyle(agentColors, day)['--animation-id']} {
                ${getCyclingStyle(agentColors, day)['--keyframes']}
              }
            `}</style>
          )}
          {day}
          {hasEvents && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          )}
        </div>,
      )
    }
    return days
  }

  // Format text with agent mentions (same as todo component)
  const formatTextWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const agentName = part.substring(1).toUpperCase();
        const agent = getAgentInfo(agentName);
        if (agent) {
          const IconComponent = agent.icon;
          return (
            <span key={index} className={`inline-flex items-center gap-1 px-1 rounded ${agent.color} bg-gray-800`}>
              <IconComponent className="h-3 w-3" />
              <span className="text-xs font-mono">{agent.name}</span>
            </span>
          );
        }
      }
      return part;
    });
  };

  // Get time of day icon and color based on hour
  const getTimeOfDayInfo = (hour: number) => {
    if (hour >= 5 && hour < 7) {
      return { icon: Sunrise, color: 'text-orange-400', label: 'Sunrise' };
    } else if (hour >= 7 && hour < 18) {
      return { icon: Sun, color: 'text-yellow-400', label: 'Day' };
    } else if (hour >= 18 && hour < 20) {
      return { icon: Sunset, color: 'text-red-400', label: 'Sunset' };
    } else {
      return { icon: Moon, color: 'text-blue-400', label: 'Night' };
    }
  };

  // Get city time with time of day info
  const getCityTimeInfo = (timeString: string) => {
    if (timeString === '--:--:--') return { time: timeString, hour: 0, timeOfDay: null };
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const timeOfDay = getTimeOfDayInfo(hours);
    
    return {
      time: timeString,
      hour: hours,
      timeOfDay
    };
  };

  // Upcoming events (sorted, next 5)
  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .map(ev => ({ ...ev, dateObj: new Date(ev.date) }))
      .filter(ev => ev.dateObj >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .slice(0, 5);
  }, [events]);

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 h-[500px] flex flex-col overflow-hidden relative">
      {/* Timer Alert Overlay */}
      {showTimerAlert && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-pulse">
          <div className="bg-red-600 border-2 border-white p-6 rounded-lg text-center">
            <div className="text-4xl font-mono text-white font-bold mb-4">
              TIMER COMPLETE!
            </div>
            <div className="text-lg text-white mb-4">
              {timerState.mode.toUpperCase()} session finished
            </div>
            <button
              onClick={() => {
                dismissTimerAlert()
                setShowTimerAlert(false)
              }}
              className="bg-white text-red-600 px-4 py-2 rounded font-mono font-bold hover:bg-gray-100 transition-colors"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}


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
      <div className="grid grid-cols-7 gap-1 mb-4">{renderCalendarDays()}</div>

      {/* Bottom section: 3-column layout */}
      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        {/* Column 1: Upcoming events */}
        <div className="overflow-y-auto">
          <div className="pt-4 border-t border-gray-800">
        <h3 className="text-xs font-bold text-gray-400 font-mono mb-2">UPCOMING</h3>
        <div className="space-y-1">
              {upcoming.length === 0 && <div className="text-xs text-gray-500 font-mono">No upcoming events</div>}
              {upcoming.map(ev => {
                const date = new Date(ev.date);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                
                // Get the primary agent color for the date
                const primaryAgent = ev.agent ? getAgentInfo(ev.agent) : null;
                const dateColor = primaryAgent ? primaryAgent.color : 'text-green-400';
                
                return (
                  <div key={ev.date + ev.label} className="flex items-center gap-2 text-xs font-mono">
                    <span className={dateColor}>{day}/{month}/{year}</span>
                    <span className="text-white">-</span>
                    <span className="text-white">{formatTextWithMentions(ev.label)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Tactical Timer */}
        <div>
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 font-mono mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-400" />
              TACTICAL TIMER
            </h3>
            <div className="bg-gray-800/50 border border-gray-700 p-3 h-[140px] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">{timerState.mode.toUpperCase()}</span>
                </div>
              </div>
              
              {timerState.isActive ? (
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className={`text-2xl font-mono font-bold ${timerState.timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {formatTime(timerState.timeLeft)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      onClick={pauseTimer}
                      className="min-h-[24px] min-w-[24px] p-1 bg-red-600 hover:bg-red-700"
                    >
                      <Pause className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={resetTimer}
                      className="min-h-[24px] min-w-[24px] p-1 bg-gray-600 hover:bg-gray-700"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={timerState.customHours}
                      onChange={(e) => handleCustomHoursChange(e.target.value)}
                      className="w-12 h-8 text-center text-lg font-mono text-white bg-gray-700 border border-gray-600 rounded-none focus:outline-none focus:border-orange-400"
                      min="0"
                      max="99"
                    />
                    <span className="text-lg font-mono text-white">:</span>
                    <input
                      type="number"
                      value={timerState.customMinutes}
                      onChange={(e) => handleCustomMinutesChange(e.target.value)}
                      className="w-12 h-8 text-center text-lg font-mono text-white bg-gray-700 border border-gray-600 rounded-none focus:outline-none focus:border-orange-400"
                      min="0"
                      max="59"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      onClick={startTimer}
                      className="min-h-[24px] min-w-[24px] p-1 bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={resetTimer}
                      className="min-h-[24px] min-w-[24px] p-1 bg-gray-600 hover:bg-gray-700"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-1 mt-auto">
                <button
                  onClick={() => changeTimerMode('focus')}
                  className={`flex-1 text-xs font-mono px-2 py-1 ${timerState.mode === 'focus' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  FOCUS
                </button>
                <button
                  onClick={() => changeTimerMode('break')}
                  className={`flex-1 text-xs font-mono px-2 py-1 ${timerState.mode === 'break' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  BREAK
                </button>
                <button
                  onClick={() => changeTimerMode('debrief')}
                  className={`flex-1 text-xs font-mono px-2 py-1 ${timerState.mode === 'debrief' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  DEBRIEF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: World Clock */}
        <div>
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 font-mono mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              WORLD CLOCK
            </h3>
            <div className="bg-gray-800/50 border border-gray-700 p-3 h-[140px] flex flex-col overflow-hidden">
              
              {/* List layout for all cities */}
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {(() => {
                  const sclInfo = getCityTimeInfo(worldTime.scl);
                  const bcnInfo = getCityTimeInfo(worldTime.bcn);
                  const sfoInfo = getCityTimeInfo(worldTime.sfo);
                  const hanoiInfo = getCityTimeInfo(worldTime.hanoi);
                  
                  // Debug: Log Hanoi info
                  console.log('Hanoi debug:', { 
                    rawTime: worldTime.hanoi, 
                    hanoiInfo, 
                    hasTimeOfDay: !!hanoiInfo.timeOfDay 
                  });
                  
                  return (
                    <>
                      {/* Santiago */}
                      <div className="flex items-center justify-between group hover:bg-gray-700/50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-2">
                          {sclInfo.timeOfDay && (
                            <sclInfo.timeOfDay.icon className={`h-4 w-4 ${sclInfo.timeOfDay.color} animate-pulse`} />
                          )}
                          <span className="text-sm text-gray-400 font-mono">SCL</span>
                        </div>
                        <span className="text-sm text-white font-mono font-bold">{sclInfo.time}</span>
                      </div>
                      
                      {/* Barcelona */}
                      <div className="flex items-center justify-between group hover:bg-gray-700/50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-2">
                          {bcnInfo.timeOfDay && (
                            <bcnInfo.timeOfDay.icon className={`h-4 w-4 ${bcnInfo.timeOfDay.color} animate-pulse`} />
                          )}
                          <span className="text-sm text-gray-400 font-mono">BCN</span>
                        </div>
                        <span className="text-sm text-white font-mono font-bold">{bcnInfo.time}</span>
                      </div>
                      
                      {/* San Francisco */}
                      <div className="flex items-center justify-between group hover:bg-gray-700/50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-2">
                          {sfoInfo.timeOfDay && (
                            <sfoInfo.timeOfDay.icon className={`h-4 w-4 ${sfoInfo.timeOfDay.color} animate-pulse`} />
                          )}
                          <span className="text-sm text-gray-400 font-mono">SFO</span>
                        </div>
                        <span className="text-sm text-white font-mono font-bold">{sfoInfo.time}</span>
                      </div>
                      
                      {/* Hanoi */}
                      <div className="flex items-center justify-between group hover:bg-gray-700/50 p-1 rounded transition-colors">
                        <div className="flex items-center gap-2">
                          {hanoiInfo.timeOfDay && (
                            <hanoiInfo.timeOfDay.icon className={`h-4 w-4 ${hanoiInfo.timeOfDay.color} animate-pulse`} />
                          )}
                          <span className="text-sm text-gray-400 font-mono">HAN</span>
                        </div>
                        <span className="text-sm text-white font-mono font-bold">
                          {hanoiInfo.time !== '--:--:--' ? hanoiInfo.time : 'Loading...'}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
