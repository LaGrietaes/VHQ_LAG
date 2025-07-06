"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InteractiveTodoItem } from '@/components/interactive-todo';

interface TodoContextType {
  todos: InteractiveTodoItem[];
  addTodo: (todo: InteractiveTodoItem) => void;
  updateTodo: (id: number, updates: Partial<InteractiveTodoItem>) => void;
  deleteTodo: (id: number) => void;
  toggleTodo: (id: number) => void;
  clearCompleted: () => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<InteractiveTodoItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vhq-todo-tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTodos(parsed);
      }
    } catch (error) {
      console.error('Error loading todos from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('vhq-todo-tasks', JSON.stringify(todos));
      } catch (error) {
        console.error('Error saving todos to localStorage:', error);
      }
    }
  }, [todos, isInitialized]);

  const addTodo = (todo: InteractiveTodoItem) => {
    setTodos(prev => [...prev, todo]);
  };

  const updateTodo = (id: number, updates: Partial<InteractiveTodoItem>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.done));
  };

  const value: TodoContextType = {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
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