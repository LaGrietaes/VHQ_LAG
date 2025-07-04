import React from 'react';
import { OutlineItem } from '@/lib/ghost-agent-data';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, File, Folder, Trash2, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OutlineItemViewProps {
  item: OutlineItem;
  level: number;
  onSelect: () => void;
  isSelected: boolean;
  onDoubleClick: () => void;
  isEditing: boolean;
  editingTitle: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur: () => void;
  onTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete?: () => void;
}

export const OutlineItemView: React.FC<OutlineItemViewProps> = ({
  item,
  level,
  onSelect,
  isSelected,
  onDoubleClick,
  isEditing,
  editingTitle,
  onTitleChange,
  onTitleBlur,
  onTitleKeyDown,
  isExpanded,
  onToggleExpand,
  onDelete
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isFolder = item.type === 'folder';
  const isFile = item.type === 'file';

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-1 rounded-md transition-colors",
        "hover:bg-gray-800/50",
        isSelected && "bg-primary/20 border border-primary/50",
        isFolder && "hover:bg-blue-900/30",
        isFile && "hover:bg-green-900/30"
      )}
      style={{ paddingLeft: `${level * 16 + 8}px` }}
    >
      {/* Expand/Collapse button for folders */}
      {isFolder && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      )}

      {/* Icon */}
      <div className="flex-shrink-0">
        {isFolder ? (
          <Folder className={cn(
            "h-4 w-4",
            isExpanded ? "text-blue-400" : "text-blue-500",
            "group-hover:text-blue-300"
          )} />
        ) : (
          <File className={cn(
            "h-4 w-4",
            item.title.endsWith('.md') ? "text-green-400" : "text-gray-400",
            "group-hover:text-green-300"
          )} />
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={onTitleChange}
            onBlur={onTitleBlur}
            onKeyDown={onTitleKeyDown}
            className="w-full bg-gray-800 border border-primary/50 rounded px-2 py-1 text-sm text-white outline-none focus:border-primary"
            autoFocus
          />
        ) : (
          <div
            className={cn(
              "text-sm truncate cursor-pointer select-none",
              isSelected && "font-medium",
              isFolder && "text-blue-200",
              isFile && item.title.endsWith('.md') && "text-green-200"
            )}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                console.log('[OutlineItemView] Double-click on title:', item.title);
                onDoubleClick();
            }}
            title={item.title}
          >
            {item.title}
            {isFolder && hasChildren && (
              <span className="ml-2 text-xs text-gray-500">
                ({item.children!.length})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onTitleBlur}
              title="Save"
            >
              ✓
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                console.log('[OutlineItemView] Edit button clicked for:', item.title);
                onDoubleClick();
              }}
              title="Rename"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-900/50 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}; 