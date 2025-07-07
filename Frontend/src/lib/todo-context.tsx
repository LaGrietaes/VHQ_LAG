"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InteractiveTodoItem } from '@/components/interactive-todo';

interface TodoContextType {
  todos: InteractiveTodoItem[];
  addTodo: (todo: InteractiveTodoItem) => Promise<void>;
  updateTodo: (id: number, updates: Partial<InteractiveTodoItem>) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  clearCompleted: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<InteractiveTodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos from API on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/todos');
      const data = await response.json();
      
      if (data.success) {
        setTodos(data.todos);
      } else {
        setError(data.error || 'Failed to load todos');
      }
    } catch (error) {
      console.error('Error loading todos:', error);
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (todo: InteractiveTodoItem) => {
    try {
      setError(null);
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: todo.text,
          deadline: todo.deadline,
          taggedAgents: todo.taggedAgents,
          priority: todo.priority,
          complexity: todo.complexity,
          description: todo.description
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTodos(prev => [...prev, data.todo]);
      } else {
        setError(data.error || 'Failed to add todo');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo');
    }
  };

  const updateTodo = async (id: number, updates: Partial<InteractiveTodoItem>) => {
    try {
      setError(null);
      const response = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates })
      });

      const data = await response.json();
      
      if (data.success) {
        setTodos(prev => prev.map(todo => 
          todo.id === id ? { ...todo, ...updates } : todo
        ));
      } else {
        setError(data.error || 'Failed to update todo');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      setError(null);
      const response = await fetch(`/api/todos?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
      } else {
        setError(data.error || 'Failed to delete todo');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo');
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { done: !todo.done });
    }
  };

  const clearCompleted = async () => {
    try {
      setError(null);
      const completedTodos = todos.filter(todo => todo.done);
      
      // Delete all completed todos
      for (const todo of completedTodos) {
        await deleteTodo(todo.id);
      }
    } catch (error) {
      console.error('Error clearing completed todos:', error);
      setError('Failed to clear completed todos');
    }
  };

  const value: TodoContextType = {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    loading,
    error
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
} 