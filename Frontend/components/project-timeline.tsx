"use client"

import { projectsData } from "@/lib/dashboard-data"
import { Calendar, Clock, Users } from "lucide-react"

export function ProjectTimeline() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-600"
      case "planning":
        return "bg-blue-600"
      case "completed":
        return "bg-green-600"
      case "on-hold":
        return "bg-yellow-600"
      default:
        return "bg-gray-600"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400"
      case "medium":
        return "text-yellow-400"
      case "low":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="h-5 w-5 text-red-600" />
        <h2 className="text-lg font-bold text-white font-mono">PROJECT TIMELINE</h2>
      </div>

      <div className="space-y-4">
        {projectsData.map((project, index) => (
          <div key={project.id} className="relative">
            {/* Timeline line */}
            {index < projectsData.length - 1 && <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-700"></div>}

            <div className="flex items-start space-x-4">
              {/* Timeline dot */}
              <div className={`w-3 h-3 ${getStatusColor(project.status)} rounded-full mt-2 glitch-dot`}></div>

              {/* Project content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white font-mono">{project.name}</h3>
                  <span className={`text-xs font-mono ${getPriorityColor(project.priority)}`}>
                    {project.priority.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mb-2 font-mono">{project.description}</p>

                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span className="font-mono">
                      {project.startDate} - {project.endDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span className="font-mono">{project.assignedAgents.length} agents</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-800 h-1 glitch-bar">
                  <div className="h-1 bg-red-600" style={{ width: `${project.progress}%` }}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1 font-mono">{project.progress}% complete</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
