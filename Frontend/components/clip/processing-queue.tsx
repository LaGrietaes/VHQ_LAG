"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { videoTasks, type VideoTask } from "@/lib/clip-agent-data"
import { Pause, Trash2, Download, Eye } from "lucide-react"

export function ProcessingQueue() {
  const [tasks, setTasks] = useState<VideoTask[]>(videoTasks)

  const getStatusColor = (status: VideoTask["status"]) => {
    switch (status) {
      case "processing":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "queued":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <Card className="bg-gradient-to-b from-gray-900 to-black border-gray-800">
      <CardHeader>
        <CardTitle className="text-white font-mono flex items-center space-x-2">
          <span className="text-orange-400">🎬</span>
          <span>PROCESSING QUEUE</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-black/50 border border-gray-700 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Badge className={`${getStatusColor(task.status)} text-white font-mono text-xs`}>
                  {task.status.toUpperCase()}
                </Badge>
                <span className="text-white font-mono text-sm">{task.filename}</span>
              </div>
              <div className="flex items-center space-x-2">
                {task.status === "processing" && (
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                {task.status === "completed" && (
                  <>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400 font-mono mb-3">
              <div>
                <div className="text-gray-500">INPUT</div>
                <div className="text-white">{task.input_format}</div>
              </div>
              <div>
                <div className="text-gray-500">OUTPUT</div>
                <div className="text-white">{task.output_format}</div>
              </div>
              <div>
                <div className="text-gray-500">DURATION</div>
                <div className="text-white">{formatDuration(task.duration)}</div>
              </div>
              <div>
                <div className="text-gray-500">CLIPS</div>
                <div className="text-white">{task.clips_generated || 0}</div>
              </div>
            </div>

            {task.status === "processing" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
                <div className="text-xs text-gray-400 font-mono">
                  ETA:{" "}
                  {task.estimated_completion
                    ? new Date(task.estimated_completion).toLocaleTimeString()
                    : "Calculating..."}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
