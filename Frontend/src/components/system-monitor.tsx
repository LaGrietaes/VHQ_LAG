"use client"

import { useState, useEffect } from "react"
import { Cpu, HardDrive, Thermometer, Zap, Gpu, Users } from "lucide-react"

interface SystemStats {
  cpu: {
    manufacturer?: string;
    brand?: string;
    speed?: number;
    cores?: number;
    physicalCores?: number;
    error?: string;
  };
  mem: {
    total?: number;
    free?: number;
    used?: number;
    active?: number;
    error?: string;
  };
  os: {
    platform?: string;
    distro?: string;
    release?: string;
    arch?: string;
    error?: string;
  };
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

  // Calculate memory usage percentage
  const memoryUsagePercentage = stats.mem?.total && stats.mem?.used 
    ? Math.round((stats.mem.used / stats.mem.total) * 100)
    : 0;

  const memoryUsedGB = stats.mem?.used ? (stats.mem.used / (1024 * 1024 * 1024)).toFixed(1) : '0';
  const memoryTotalGB = stats.mem?.total ? (stats.mem.total / (1024 * 1024 * 1024)).toFixed(1) : '0';

  return (
    <div className="flex items-center gap-6 text-xs font-mono h-9">
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
        {stats.cpu?.error ? (
          <span className="text-red-400">N/A</span>
        ) : (
          <>
            <span className="text-gray-400">{stats.cpu?.cores || 'N/A'} cores</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">{stats.cpu?.brand || 'Unknown'}</span>
          </>
        )}
      </div>

      {/* Memory Monitor */}
      <div className="flex items-center space-x-1">
        <Zap className="h-3 w-3 text-white" />
        <span className="text-gray-400">RAM:</span>
        {stats.mem?.error ? (
          <span className="text-red-400">N/A</span>
        ) : (
          <span className={getUsageColor(memoryUsagePercentage)}>
            {memoryUsedGB}GB/{memoryTotalGB}GB ({memoryUsagePercentage}%)
          </span>
        )}
      </div>

      {/* OS Monitor */}
      <div className="flex items-center space-x-1">
        <HardDrive className="h-3 w-3 text-white" />
        <span className="text-gray-400">OS:</span>
        {stats.os?.error ? (
          <span className="text-red-400">N/A</span>
        ) : (
          <span className="text-gray-400">
            {stats.os?.platform || 'Unknown'} {stats.os?.arch || ''}
          </span>
        )}
      </div>
    </div>
  )
}
