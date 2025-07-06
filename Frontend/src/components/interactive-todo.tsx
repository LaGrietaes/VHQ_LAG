"use client"

import React, { useState, useEffect } from 'react';
import { Plus, X, CheckSquare, Square, Calendar as CalendarIcon, ChevronDown, ChevronRight, AlertTriangle, Clock, Target, FileText, AtSign, Briefcase, Search, Users, Brain, Film, Folder, Star, DollarSign, Scale, Shield, Music, TrendingUp, Code, Megaphone, UserCheck, Ghost } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTodoContext } from "@/lib/todo-context";

export type InteractiveTodoItem = {
  id: number;
  text: string;
  done: boolean;
  deadline?: string; // ISO date string
  taggedAgents?: string[]; // Array of agent names
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  complexity?: 'simple' | 'moderate' | 'complex' | 'very-complex';
  description?: string; // Detailed description
  expanded?: boolean; // Whether the detailed view is expanded
};

// Available agents for tagging - using same icons as agents-data.tsx
const AVAILABLE_AGENTS = [
  { name: 'Ghost', icon: Ghost, color: 'text-purple-400' },
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

export function InteractiveTodo({ onTodosChange }: { onTodosChange?: (todos: InteractiveTodoItem[]) => void }) {
  console.log('InteractiveTodo component rendering');
  const { todos: tasks, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodoContext();
  const [input, setInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [detailedForm, setDetailedForm] = useState({
    priority: '' as string,
    complexity: '' as string,
    description: ''
  });

  // Notify parent component of todo changes
  useEffect(() => {
    if (onTodosChange) {
      onTodosChange(tasks);
    }
  }, [tasks, onTodosChange]);

  // Parse @mentions from text
  const parseMentions = (text: string) => {
    const mentions = text.match(/@(\w+)/g) || [];
    return mentions.map(mention => mention.substring(1).toUpperCase());
  };

  // Get agent info by name
  const getAgentInfo = (name: string) => {
    return AVAILABLE_AGENTS.find(agent => agent.name.toUpperCase() === name.toUpperCase());
  };

  // Format text with agent mentions
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

  const handleAddTask = () => {
    if (!input.trim()) return;
    
    let deadlineDate: string | undefined;
    if (deadline.trim()) {
      const parts = deadline.split('/');
      if (parts.length === 2) {
        const [day, month] = parts.map(Number);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // 1-12
        
        // Smart year handling: if we're in December and select January, it's next year
        let year = currentYear;
        if (currentMonth === 12 && month === 1) {
          year = currentYear + 1;
        }
        
        deadlineDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
    
    const taggedAgents = parseMentions(input);
    
    const newTask: InteractiveTodoItem = { 
      id: Date.now(), 
      text: input, 
      done: false, 
      deadline: deadlineDate,
      taggedAgents: taggedAgents.length > 0 ? taggedAgents : undefined,
      priority: detailedForm.priority || undefined,
      complexity: detailedForm.complexity || undefined,
      description: detailedForm.description || undefined
    };
    addTodo(newTask);
    setInput('');
    setDeadline('');
    setDetailedForm({
      priority: '',
      complexity: '',
      description: ''
    });
    setShowDetailedForm(false);
  };

  const toggleTask = (id: number) => {
    toggleTodo(id);
  };

  const deleteTask = (id: number) => {
    deleteTodo(id);
  };

  const toggleExpanded = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTodo(id, { expanded: !task.expanded });
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getPriorityInfo = (priority: string) => {
    const info = {
      low: { color: 'text-green-400', bg: 'bg-green-400/10', icon: Clock },
      medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Target },
      high: { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: AlertTriangle },
      urgent: { color: 'text-red-400', bg: 'bg-red-400/10', icon: AlertTriangle }
    };
    return info[priority as keyof typeof info] || info.medium;
  };

  const getComplexityInfo = (complexity: string) => {
    const info = {
      simple: { color: 'text-green-400', bg: 'bg-green-400/10' },
      moderate: { color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      complex: { color: 'text-orange-400', bg: 'bg-orange-400/10' },
      'very-complex': { color: 'text-red-400', bg: 'bg-red-400/10' }
    };
    return info[complexity as keyof typeof info] || info.moderate;
  };

  const pendingTasks = tasks.filter(task => !task.done);
  const completedTasks = tasks.filter(task => task.done);

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 h-[500px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-bold text-white font-mono">PERSONAL TODO</h2>
        </div>
        <div className="text-xs text-gray-400 font-mono">
          {pendingTasks.length} PENDING
        </div>
      </div>

      {/* Add Task Input */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 h-8 px-2 bg-gray-800 border border-gray-700 text-white font-mono text-sm placeholder-gray-500"
            placeholder="Nueva tarea... @Ghost @CEO"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <input
            type="text"
            className="w-20 h-8 px-2 bg-gray-800 border border-gray-700 text-white font-mono text-sm text-center"
            placeholder="DD/MM"
            value={deadline}
            onChange={(e) => {
              const value = e.target.value;
              
              // Allow backspace and deletion
              if (value === '') {
                setDeadline('');
                return;
              }
              
              // Only allow digits and forward slash
              const cleanValue = value.replace(/[^\d/]/g, '');
              
              // Prevent multiple slashes
              const slashCount = (cleanValue.match(/\//g) || []).length;
              if (slashCount > 1) return;
              
              // Format as user types
              if (cleanValue.length <= 5) {
                let formatted = cleanValue;
                
                // Auto-add slash after 2 digits if no slash exists
                if (cleanValue.length === 2 && !cleanValue.includes('/')) {
                  const day = parseInt(cleanValue);
                  if (day >= 1 && day <= 31) {
                    formatted = cleanValue + '/';
                  }
                }
                
                // Validate day and month as user types
                if (cleanValue.includes('/')) {
                  const [day, month] = cleanValue.split('/');
                  const dayNum = parseInt(day);
                  const monthNum = parseInt(month);
                  
                  // Validate day (1-31)
                  if (day && (dayNum < 1 || dayNum > 31)) return;
                  
                  // Validate month (1-12) if month is provided
                  if (month && (monthNum < 1 || monthNum > 12)) return;
                }
                
                setDeadline(formatted);
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <Button 
            onClick={handleAddTask}
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white font-mono min-h-[32px]"
          >
            <Plus className="h-4 w-4 mr-1" />
            ADD
          </Button>
        </div>
        
        {/* Detailed Form Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetailedForm(!showDetailedForm)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors font-mono"
          >
            {showDetailedForm ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {showDetailedForm ? 'Hide Details' : 'Add Details'}
          </button>
        </div>
        
        {/* Detailed Form */}
        {showDetailedForm && (
          <div className="bg-gray-800/50 rounded p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 font-mono mb-1">Priority</label>
                <select
                  value={detailedForm.priority}
                  onChange={(e) => setDetailedForm({...detailedForm, priority: e.target.value})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white font-mono text-sm"
                >
                  <option value="">No Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-mono mb-1">Complexity</label>
                <select
                  value={detailedForm.complexity}
                  onChange={(e) => setDetailedForm({...detailedForm, complexity: e.target.value})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white font-mono text-sm"
                >
                  <option value="">No Complexity</option>
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="complex">Complex</option>
                  <option value="very-complex">Very Complex</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-mono mb-1">Description</label>
              <textarea
                value={detailedForm.description}
                onChange={(e) => setDetailedForm({...detailedForm, description: e.target.value})}
                placeholder="Add detailed description..."
                className="w-full p-2 bg-gray-700 border border-gray-600 text-white font-mono text-sm resize-none"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pending Tasks */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <h3 className="text-sm font-bold text-gray-400 font-mono mb-3 flex-shrink-0">PENDING ({pendingTasks.length})</h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-0">
        {pendingTasks.map((task) => (
          <div key={task.id} className="border border-gray-800 rounded p-3 hover:bg-gray-800/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="text-gray-400 hover:text-green-400 transition-colors flex-shrink-0"
                >
                  <Square className="h-4 w-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-mono break-words">
                    {formatTextWithMentions(task.text)}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {task.deadline && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-mono">
                        <CalendarIcon className="h-3 w-3" /> {formatDeadline(task.deadline)}
                      </div>
                    )}
                    {task.priority && (
                      <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded ${getPriorityInfo(task.priority).bg} ${getPriorityInfo(task.priority).color}`}>
                        {React.createElement(getPriorityInfo(task.priority).icon, { className: "h-3 w-3" })}
                        {task.priority.toUpperCase()}
                      </div>
                    )}
                    {task.complexity && (
                      <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded ${getComplexityInfo(task.complexity).bg} ${getComplexityInfo(task.complexity).color}`}>
                        <Target className="h-3 w-3" />
                        {task.complexity.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(task.priority || task.complexity || task.description) && (
                  <button
                    onClick={() => toggleExpanded(task.id)}
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    {task.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-200 transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Expanded Details */}
            {task.expanded && (task.priority || task.complexity || task.description) && (
              <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                {task.description && (
                  <div className="text-xs text-gray-300 font-mono">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-400">Description:</span>
                    </div>
                    <div className="pl-5 text-gray-300">{task.description}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        </div>
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h3 className="text-sm font-bold text-gray-400 font-mono mb-3">COMPLETED ({completedTasks.length})</h3>
          <div className="max-h-32 overflow-y-auto space-y-3 pr-2">
          {completedTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-2 opacity-60">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="text-green-400 hover:text-gray-400 transition-colors flex-shrink-0"
                >
                  <CheckSquare className="h-4 w-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-400 font-mono line-through break-words">
                    {formatTextWithMentions(task.text)}
                  </div>
                  {task.deadline && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-mono mt-1">
                      <CalendarIcon className="h-3 w-3" /> {formatDeadline(task.deadline)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-400 hover:text-red-200 transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
} 