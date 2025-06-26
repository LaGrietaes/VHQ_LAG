"use client"

import { useState, useEffect } from "react"
import { Cpu, HardDrive, Thermometer, Zap } from "lucide-react"

interface SystemStats {
  cpu: {
    usage: number
    temp: number
    cores: number
  }
  gpu: {
    usage: number
    temp: number
    memory: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
}

export function SystemMonitor() {
  const [stats, setStats] = useState<SystemStats>({
    cpu: { usage: 0, temp: 0, cores: 8 },
    gpu: { usage: 0, temp: 0, memory: 0 },
    memory: { used: 0, total: 32, percentage: 0 },
    disk: { used: 0, total: 1000, percentage: 0 },
  })

  useEffect(() => {
    // Simulate real system monitoring data
    const updateStats = () => {
      setStats({
        cpu: {
          usage: Math.floor(Math.random() * 40) + 20, // 20-60%
          temp: Math.floor(Math.random() * 20) + 45, // 45-65°C
          cores: 8,
        },
        gpu: {
          usage: Math.floor(Math.random() * 50) + 30, // 30-80%
          temp: Math.floor(Math.random() * 25) + 55, // 55-80°C
          memory: Math.floor(Math.random() * 4) + 6, // 6-10GB
        },
        memory: {
          used: Math.floor(Math.random() * 8) + 16, // 16-24GB
          total: 32,
          percentage: 0,
        },
        disk: {
          used: Math.floor(Math.random() * 100) + 650, // 650-750GB
          total: 1000,
          percentage: 0,
        },
      })
    }

    // Calculate percentages
    setStats((prev) => ({
      ...prev,
      memory: {
        ...prev.memory,
        percentage: (prev.memory.used / prev.memory.total) * 100,
      },
      disk: {
        ...prev.disk,
        percentage: (prev.disk.used / prev.disk.total) * 100,
      },
    }))

    updateStats()
    const interval = setInterval(updateStats, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return "text-red-400"
    if (usage >= 60) return "text-yellow-400"
    return "text-green-400"
  }

  const getTempColor = (temp: number) => {
    if (temp >= 75) return "text-red-400"
    if (temp >= 65) return "text-yellow-400"
    return "text-green-400"
  }

  return (
    <div className="flex items-center space-x-4 text-xs font-mono">
      {/* CPU Monitor */}
      <div className="flex items-center space-x-1">
        <Cpu className="h-3 w-3 text-blue-400" />
        <span className="text-gray-400">CPU:</span>
        <span className={getUsageColor(stats.cpu.usage)}>{stats.cpu.usage}%</span>
        <span className="text-gray-500">|</span>
        <Thermometer className="h-3 w-3 text-orange-400" />
        <span className={getTempColor(stats.cpu.temp)}>{stats.cpu.temp}°C</span>
      </div>

      {/* GPU Monitor */}
      <div className="flex items-center space-x-1">
        <HardDrive className="h-3 w-3 text-purple-400" />
        <span className="text-gray-400">GPU:</span>
        <span className={getUsageColor(stats.gpu.usage)}>{stats.gpu.usage}%</span>
        <span className="text-gray-500">|</span>
        <Thermometer className="h-3 w-3 text-orange-400" />
        <span className={getTempColor(stats.gpu.temp)}>{stats.gpu.temp}°C</span>
      </div>

      {/* Memory Monitor */}
      <div className="flex items-center space-x-1">
        <Zap className="h-3 w-3 text-cyan-400" />
        <span className="text-gray-400">RAM:</span>
        <span className={getUsageColor(stats.memory.percentage)}>
          {stats.memory.used}GB/{stats.memory.total}GB
        </span>
      </div>
    </div>
  )
}
