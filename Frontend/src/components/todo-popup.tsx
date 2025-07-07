"use client"

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Calendar as CalendarIcon, Target, AlertTriangle, FileText, AtSign, Briefcase, Search, Users, Brain, Film, Folder, Star, DollarSign, Scale, Shield, Music, TrendingUp, Code, Megaphone, UserCheck, Ghost } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/sound-utils";
import { useTodoContext } from "@/lib/todo-context";
import { InteractiveTodoItem } from "@/components/interactive-todo";

export type TodoPopupItem = {
  text: string;
  deadline?: string;
  taggedAgents?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  complexity?: 'simple' | 'moderate' | 'complex' | 'very-complex';
  description?: string;
};

// Available agents for tagging - using same icons as calendar widget
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

interface TodoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTodo: (todo: TodoPopupItem) => void;
}

export function TodoPopup({ isOpen, onClose }: Omit<TodoPopupProps, 'onAddTodo'>) {
  const { addTodo } = useTodoContext();
  const [form, setForm] = useState<TodoPopupItem>({
    text: '',
    deadline: '',
    priority: undefined,
    complexity: undefined,
    description: ''
  });
  const [showDetails, setShowDetails] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      setForm({
        text: '',
        deadline: '',
        priority: undefined,
        complexity: undefined,
        description: ''
      });
      setShowDetails(false);
    }
  }, [isOpen]);

  const parseMentions = (text: string): string[] => {
    const mentions = text.match(/@(\w+)/g);
    if (!mentions) return [];
    return mentions.map(mention => mention.slice(1)); // Remove @ symbol
  };

  const formatTextWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const agentName = part.slice(1);
        const agent = AVAILABLE_AGENTS.find(a => a.name.toUpperCase() === agentName.toUpperCase());
        if (agent) {
          const IconComponent = agent.icon;
          return (
            <span key={index} className={`inline-flex items-center gap-1 ${agent.color}`}>
              <IconComponent className="h-3 w-3" />
              {agentName}
            </span>
          );
        }
      }
      return part;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) return;

    const taggedAgents = parseMentions(form.text);
    
    // Convert DD/MM format to ISO format for calendar compatibility
    let deadlineDate: string | undefined;
    if (form.deadline && form.deadline.trim()) {
      const parts = form.deadline.split('/');
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
    
    const todoItem: TodoPopupItem = {
      text: form.text,
      deadline: deadlineDate,
      taggedAgents: taggedAgents.length > 0 ? taggedAgents : undefined,
      priority: form.priority || undefined,
      complexity: form.complexity || undefined,
      description: form.description || undefined
    };

    const newTodo: InteractiveTodoItem = {
      id: Date.now(),
      text: todoItem.text,
      done: false,
      deadline: todoItem.deadline,
      taggedAgents: todoItem.taggedAgents,
      priority: todoItem.priority,
      complexity: todoItem.complexity,
      description: todoItem.description
    };
    addTodo(newTodo);
    playSound('add');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white font-mono">Quick Add Todo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Main Input */}
          <div>
            <input
              ref={inputRef}
              type="text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="What needs to be done? @Ghost @CEO"
              className="w-full h-10 px-3 bg-gray-800 border border-gray-600 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-orange-400"
            />
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={form.deadline}
              onChange={(e) => {
                const value = e.target.value;
                
                // Allow backspace and deletion
                if (value === '') {
                  setForm({ ...form, deadline: '' });
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
                  
                  setForm({ ...form, deadline: formatted });
                }
              }}
              placeholder="DD/MM"
              className="w-20 h-8 px-2 bg-gray-800 border border-gray-600 text-white font-mono text-sm text-center placeholder-gray-500 focus:outline-none focus:border-orange-400"
            />
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors font-mono px-2 py-1"
            >
              {showDetails ? 'Hide Details' : 'Add Details'}
            </button>
          </div>

          {/* Detailed Form */}
          {showDetails && (
            <div className="bg-gray-800/50 rounded p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1">Priority</label>
                  <select
                    value={form.priority || ''}
                    onChange={(e) => setForm({ ...form, priority: e.target.value || undefined })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 text-white font-mono text-sm focus:outline-none focus:border-orange-400"
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
                    value={form.complexity || ''}
                    onChange={(e) => setForm({ ...form, complexity: e.target.value || undefined })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 text-white font-mono text-sm focus:outline-none focus:border-orange-400"
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
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Add detailed description..."
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white font-mono text-sm resize-none focus:outline-none focus:border-orange-400"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {form.text && (
            <div className="bg-gray-800/30 rounded p-3 border border-gray-700">
              <div className="text-xs text-gray-400 font-mono mb-1">Preview:</div>
              <div className="text-sm text-white font-mono">
                {formatTextWithMentions(form.text)}
              </div>
              {form.deadline && (
                <div className="flex items-center gap-1 text-xs text-gray-400 font-mono mt-1">
                  <CalendarIcon className="h-3 w-3" /> 
                  {form.deadline}
                  {form.deadline.includes('/') && (
                    <span className="text-gray-500"> → {(() => {
                      const parts = form.deadline.split('/');
                      if (parts.length === 2) {
                        const [day, month] = parts.map(Number);
                        const currentYear = new Date().getFullYear();
                        const currentMonth = new Date().getMonth() + 1;
                        let year = currentYear;
                        if (currentMonth === 12 && month === 1) {
                          year = currentYear + 1;
                        }
                        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      }
                      return '';
                    })()}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500 font-mono">
              Ctrl+Enter to save • Esc to cancel
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                size="sm"
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white font-mono"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Todo
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 