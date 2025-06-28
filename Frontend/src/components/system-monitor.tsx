"use client"

import { useState, useEffect } from "react"
import { Cpu, HardDrive, Thermometer, Zap, Gpu, Users } from "lucide-react"

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

interface SystemMonitorProps {
  onlineAgents: number;
  totalAgents: number;
}

export function SystemMonitor({ onlineAgents, totalAgents }: SystemMonitorProps) {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/system-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch system stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return "text-red-400"
    if (usage >= 60) return "text-yellow-400"
    return "text-gray-400"
  }

  const getTempColor = (temp: number) => {
    if (temp >= 75) return "text-red-400"
    if (temp >= 65) return "text-yellow-400"
    return "text-gray-400"
  }

  const getAgentColor = (online: number, total: number) => {
    if (total === 0) return "text-gray-400";
    const percentage = (online / total) * 100;
    if (percentage < 50) return "text-red-400";
    if (percentage < 80) return "text-yellow-400";
    return "text-gray-400";
  }

  if (error) {
    return <div className="text-xs text-red-500">Error: Could not load stats.</div>;
  }

  if (!stats) {
    return <div className="text-xs text-gray-500">Loading system stats...</div>;
  }

  return (
    <div className="flex items-center space-x-4 text-xs font-mono h-9">
      {/* Agent Monitor */}
      <div className="flex items-center space-x-1">
        <Users className="h-3 w-3 text-white" />
        <span className="text-gray-400">AGENTS:</span>
        <span className={getAgentColor(onlineAgents, totalAgents)}>{onlineAgents}/{totalAgents}</span>
      </div>

      {/* CPU Monitor */}
      <div className="flex items-center space-x-1">
        <Cpu className="h-3 w-3 text-white" />
        <span className="text-gray-400">CPU:</span>
        <span className={getUsageColor(stats.cpu.usage)}>{stats.cpu.usage}%</span>
        <span className="text-gray-500">|</span>
        <Thermometer className="h-3 w-3 text-white" />
        {stats.cpu.temp > 0 ? (
          <span className={getTempColor(stats.cpu.temp)}>{stats.cpu.temp}°C</span>
        ) : (
          <span className="text-gray-500">N/A</span>
        )}
      </div>

      {/* GPU Monitor */}
      <div className="flex items-center space-x-1">
        <Gpu className="h-3 w-3 text-white" />
        <span className="text-gray-400">GPU:</span>
        <span className={getUsageColor(stats.gpu.usage)}>{stats.gpu.usage}%</span>
        <span className="text-gray-500">|</span>
        <Thermometer className="h-3 w-3 text-white" />
        {stats.gpu.temp > 0 ? (
          <span className={getTempColor(stats.gpu.temp)}>{stats.gpu.temp}°C</span>
        ) : (
          <span className="text-gray-500">N/A</span>
        )}
      </div>

      {/* Memory Monitor */}
      <div className="flex items-center space-x-1">
        <Zap className="h-3 w-3 text-white" />
        <span className="text-gray-400">RAM:</span>
        <span className={getUsageColor(stats.memory.percentage)}>
          {stats.memory.used.toFixed(1)}GB/{stats.memory.total.toFixed(1)}GB
        </span>
      </div>

      {/* Disk Monitor */}
      <div className="flex items-center space-x-1">
        <HardDrive className="h-3 w-3 text-white" />
        <span className="text-gray-400">Disk:</span>
        <span className={getUsageColor(stats.disk.percentage)}>
          {stats.disk.used.toFixed(1)}GB/{stats.disk.total.toFixed(1)}GB
        </span>
      </div>
    </div>
  )
}
