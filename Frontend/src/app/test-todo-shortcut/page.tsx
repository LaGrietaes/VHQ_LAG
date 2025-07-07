"use client"

import { useTodoContext } from "@/lib/todo-context";
import { InteractiveTodo } from "@/components/interactive-todo";

export default function TestTodoShortcut() {
  const { todos } = useTodoContext();

  return (
    <div className="min-h-screen bg-background text-foreground font-mono p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Todo Shortcut Test</h1>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Instructions</h2>
          <ul className="space-y-2 text-sm">
            <li>• Press <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs">Ctrl + /</kbd> to open the quick todo popup</li>
            <li>• Press <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs">Escape</kbd> to close the popup</li>
            <li>• Use <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs">Ctrl + Enter</kbd> to save a todo</li>
            <li>• This should work from any page in the application</li>
          </ul>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Current Todos ({todos.length})</h2>
          {todos.length === 0 ? (
            <p className="text-gray-400">No todos yet. Try pressing Ctrl + / to add one!</p>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div key={todo.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded">
                  <div className={`w-4 h-4 rounded border ${todo.done ? 'bg-green-600 border-green-600' : 'border-gray-600'}`} />
                  <span className={todo.done ? 'line-through text-gray-500' : 'text-white'}>
                    {todo.text}
                  </span>
                  {todo.deadline && (
                    <span className="text-xs text-gray-400">({todo.deadline})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Interactive Todo Component</h2>
          <InteractiveTodo />
        </div>
      </div>
    </div>
  );
} 