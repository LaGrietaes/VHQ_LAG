import { useState, useEffect } from 'react';

export function useTodoShortcut() {
  const [isTodoPopupOpen, setIsTodoPopupOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl + / (forward slash)
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault(); // Prevent default browser behavior
        setIsTodoPopupOpen(true);
      }
      
      // Close popup with Escape
      if (event.key === 'Escape' && isTodoPopupOpen) {
        setIsTodoPopupOpen(false);
      }
    };

    // Only add listener if popup is not open or when it opens
    if (!isTodoPopupOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTodoPopupOpen]);

  const openTodoPopup = () => setIsTodoPopupOpen(true);
  const closeTodoPopup = () => setIsTodoPopupOpen(false);

  return {
    isTodoPopupOpen,
    openTodoPopup,
    closeTodoPopup
  };
} 