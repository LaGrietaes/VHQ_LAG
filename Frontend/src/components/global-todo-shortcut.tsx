"use client"

import { TodoPopup } from "@/components/todo-popup";
import { useTodoShortcut } from "@/lib/use-todo-shortcut";
import { useEffect } from "react";

export function GlobalTodoShortcut() {
  const { isTodoPopupOpen, closeTodoPopup } = useTodoShortcut();

  // Add a visual indicator when the shortcut is available
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show a brief visual indicator when Ctrl + / is pressed
      if (event.ctrlKey && event.key === '/') {
        // Create a temporary visual indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(34, 197, 94, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 12px;
          z-index: 10000;
          pointer-events: none;
          transition: opacity 0.3s ease;
        `;
        indicator.textContent = 'Todo popup opened!';
        document.body.appendChild(indicator);
        
        // Remove after 2 seconds
        setTimeout(() => {
          indicator.style.opacity = '0';
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
          }, 300);
        }, 2000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <TodoPopup
      isOpen={isTodoPopupOpen}
      onClose={closeTodoPopup}
    />
  );
} 