import { memo } from 'react';
import { cn } from "@/lib/utils";
import { Draggable } from "@hello-pangea/dnd";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
import { OutlineItem } from '@/lib/ghost-agent-data';

type OutlineItemViewProps = {
    item: OutlineItem;
    level: number;
    onSelect: () => void;
    isSelected: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onDoubleClick: () => void;
    isEditing: boolean;
    editingTitle: string;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTitleBlur: () => void;
    onTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const OutlineItemView = memo(({
    item,
    level,
    onSelect,
    isSelected,
    isExpanded,
    onToggleExpand,
    onDoubleClick,
    isEditing,
    editingTitle,
    onTitleChange,
    onTitleBlur,
    onTitleKeyDown,
}: OutlineItemViewProps) => {

    const canBeExpanded = item.type === 'folder' && !!item.children && item.children.length > 0;

    const handleItemClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect();
    };

    const handleToggleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleExpand();
    };

    return (
        <div
            style={{ paddingLeft: `${level * 1.5}rem` }}
            className={cn(
                "p-2 rounded-md transition-colors text-sm flex items-center cursor-pointer",
                "hover:bg-gray-800/50",
                isSelected && "bg-red-800/50",
            )}
            onClick={handleItemClick}
            onDoubleClick={onDoubleClick}
        >
            <span className="mr-1 w-4 flex-shrink-0" onClick={canBeExpanded ? handleToggleClick : undefined}>
                {canBeExpanded && (
                    isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                )}
            </span>

            <span className="mr-2 flex-shrink-0">
                {item.type === 'folder' ? <Folder className="h-4 w-4" /> : <File className="h-4 w-4" />}
            </span>

            {isEditing ? (
                <input
                    type="text"
                    value={editingTitle}
                    onChange={onTitleChange}
                    onBlur={onTitleBlur}
                    onKeyDown={onTitleKeyDown}
                    className="bg-transparent text-white w-full rounded-md p-0 -m-0 focus:outline-none focus:ring-0 border-none"
                    autoFocus
                    onClick={e => e.stopPropagation()}
                />
            ) : (
                <span className="truncate">{item.title}</span>
            )}
        </div>
    );
});

OutlineItemView.displayName = 'OutlineItemView'; 