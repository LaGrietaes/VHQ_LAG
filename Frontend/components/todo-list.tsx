"use client"

import { useState } from "react"
import { tasksData } from "@/lib/dashboard-data"
import { CheckSquare, Square, Plus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TodoList() {
  const [tasks, setTasks] = useState(tasksData)

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const pendingTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-white font-mono">TASK QUEUE</h2>
        </div>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-mono min-h-[32px]">
          <Plus className="h-4 w-4 mr-1" />
          ADD
        </Button>
      </div>

      {/* Pending Tasks */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-bold text-gray-400 font-mono">PENDING ({pendingTasks.length})</h3>
        {pendingTasks.map((task) => (
          <div key={task.id} className="flex items-start space-x-3 p-2 hover:bg-gray-800/50 transition-colors">
            <button
              onClick={() => toggleTask(task.id)}
              className="mt-0.5 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Square className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm text-white font-mono">{task.title}</span>
                {isOverdue(task.dueDate) && <AlertTriangle className="h-3 w-3 text-red-500" />}
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <span className={`font-mono ${getPriorityColor(task.priority)}`}>{task.priority.toUpperCase()}</span>
                <span className={`font-mono ${isOverdue(task.dueDate) ? "text-red-400" : "text-gray-500"}`}>
                  {task.dueDate}
                </span>
                {task.assignedAgent && <span className="text-gray-500 font-mono">{task.assignedAgent}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-400 font-mono">COMPLETED ({completedTasks.length})</h3>
          {completedTasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-2 opacity-60">
              <button
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 text-green-400 hover:text-gray-400 transition-colors"
              >
                <CheckSquare className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-400 font-mono line-through">{task.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
