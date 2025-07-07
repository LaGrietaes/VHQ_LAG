"use client";

import React from 'react';
import { FileText, Lightbulb, BookOpen, Folder, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileItemViewProps {
  item: {
    id: string;
    title: string;
    type: 'file' | 'folder';
    content?: string;
    children?: any[];
  };
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  isExampleFile?: boolean;
  isIdeasFile?: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onToggleExpand: () => void;
  onMarkAsExample: () => void;
  onMarkAsIdeas: () => void;
  onClearMarking: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  editingTitle?: string;
  onTitleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur?: () => void;
  onTitleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const FileItemView: React.FC<FileItemViewProps> = ({
  item,
  level,
  isSelected,
  isExpanded,
  isExampleFile = false,
  isIdeasFile = false,
  onSelect,
  onDoubleClick,
  onToggleExpand,
  onMarkAsExample,
  onMarkAsIdeas,
  onClearMarking,
  onDelete,
  isEditing = false,
  editingTitle = "",
  onTitleChange,
  onTitleBlur,
  onTitleKeyDown
}) => {
  const paddingLeft = level * 20 + 16;

  const getFileIcon = () => {
    if (item.type === 'folder') {
      return <Folder className="w-4 h-4" />;
    }
    
    // Check for different file types
    if (item.title.includes('readme') || item.title.includes('README')) {
      return <BookOpen className="w-4 h-4" />;
    }
    
    return <FileText className="w-4 h-4" />;
  };

  const getMarkingIcon = () => {
    if (isExampleFile) {
      return <BookOpen className="w-3 h-3 text-blue-500" />;
    }
    if (isIdeasFile) {
      return <Lightbulb className="w-3 h-3 text-yellow-500" />;
    }
    return null;
  };

  const getMarkingTooltip = () => {
    if (isExampleFile) return "Archivo de ejemplo";
    if (isIdeasFile) return "Archivo de ideas";
    return "";
  };

  return (
    <div
      className={cn(
        "group flex items-center py-1 px-2 rounded-sm cursor-pointer transition-colors",
        isSelected 
          ? "bg-primary/20 text-primary border border-primary/30" 
          : "hover:bg-gray-800/50 text-gray-300 hover:text-white",
        item.type === 'folder' && "font-medium"
      )}
      style={{ paddingLeft: `${paddingLeft}px` }}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      {/* Expand/Collapse for folders */}
      {item.type === 'folder' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="mr-1 p-0.5 hover:bg-gray-700 rounded"
        >
          <div className={cn(
            "w-3 h-3 border-r border-b border-gray-500 transition-transform",
            isExpanded ? "rotate-45" : "-rotate-45"
          )} />
        </button>
      )}

      {/* File/Folder Icon */}
      <div className="mr-2 flex-shrink-0">
        {getFileIcon()}
      </div>

      {/* Marking Icon */}
      {getMarkingIcon() && (
        <div 
          className="mr-1 flex-shrink-0"
          title={getMarkingTooltip()}
        >
          {getMarkingIcon()}
        </div>
      )}

      {/* File Name */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={onTitleChange}
            onBlur={onTitleBlur}
            onKeyDown={onTitleKeyDown}
            className="w-full bg-transparent border-none outline-none text-inherit"
            autoFocus
          />
        ) : (
          <span className="truncate block">
            {item.title}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        {/* Mark as Example */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            isExampleFile 
              ? "text-blue-500 bg-blue-500/20" 
              : "text-gray-400 hover:text-blue-500"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (isExampleFile) {
              onClearMarking();
            } else {
              onMarkAsExample();
            }
          }}
          title={isExampleFile ? "Quitar como ejemplo" : "Marcar como ejemplo"}
        >
          <BookOpen className="w-3 h-3" />
        </Button>

        {/* Mark as Ideas */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            isIdeasFile 
              ? "text-yellow-500 bg-yellow-500/20" 
              : "text-gray-400 hover:text-yellow-500"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (isIdeasFile) {
              onClearMarking();
            } else {
              onMarkAsIdeas();
            }
          }}
          title={isIdeasFile ? "Quitar como ideas" : "Marcar como ideas"}
        >
          <Lightbulb className="w-3 h-3" />
        </Button>

        {/* Delete Button */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Eliminar"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}; 