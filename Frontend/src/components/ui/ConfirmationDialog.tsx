"use client"

import { TriangleAlert, Save } from "lucide-react";
import { Button } from "./button";

type ConfirmationDialogProps = {
  isOpen: boolean;
  onSave?: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  title: string;
  message: string;
};

export const ConfirmationDialog = ({ isOpen, onSave, onDiscard, onCancel, title, message }: ConfirmationDialogProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center font-mono"
      onClick={onCancel}
    >
      <div 
        className="bg-gradient-to-b from-gray-900 to-black border border-gray-700 p-6 max-w-md flex flex-col gap-4 rounded-lg shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <TriangleAlert className="h-8 w-8 text-yellow-500 flex-shrink-0" />
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-gray-400 text-sm">
          {message}
        </p>
        <div className="flex justify-end gap-4 mt-4">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="border-gray-700 hover:border-white hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>
          {onSave && (
            <Button 
              onClick={onSave}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center gap-2 border border-slate-500"
            >
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          )}
          <Button 
            variant="destructive" 
            onClick={onDiscard}
            className="bg-red-800 hover:bg-red-700 text-white"
          >
            Descartar y Salir
          </Button>
        </div>
      </div>
    </div>
  );
}; 