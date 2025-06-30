import { memo } from 'react';
import { cn } from "@/lib/utils";
import { Draggable } from "@hello-pangea/dnd";
import { ChevronRight, ChevronDown } from "lucide-react";

export type TreeOutlineItem = {
    id: string;
    title: string;
    type: 'chapter' | 'section' | 'folder';
    children?: TreeOutlineItem[];
    content?: string;
};

type OutlineItemViewProps = {
    item: TreeOutlineItem;
    index: number;
    level: number;
    activeItemId: string | null;
    editingItemId: string | null;
    editingItemTitle: string;
    onItemClick: (id: string) => void;
    onItemDoubleClick: (item: TreeOutlineItem) => void;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTitleBlur: () => void;
    onTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    expandedItems: Set<string>;
    onToggleExpand: (id: string) => void;
};

export const OutlineItemView = memo(({ 
    item, 
    index,
    level, 
    activeItemId, 
    editingItemId, 
    editingItemTitle,
    onItemClick, 
    onItemDoubleClick,
    onTitleChange,
    onTitleBlur,
    onTitleKeyDown,
    expandedItems,
    onToggleExpand
}: OutlineItemViewProps) => {

    const canBeExpanded = !!item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    const handleItemClick = () => {
        onItemClick(item.id);
        if (canBeExpanded) {
            onToggleExpand(item.id);
        }
    };

    return (
        <Draggable draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        paddingLeft: `${level * 1.5}rem`,
                    }}
                    className={cn(
                        "p-2 rounded-md transition-colors text-sm flex items-center",
                        "cursor-pointer hover:bg-gray-800",
                        activeItemId === item.id && !editingItemId && "bg-red-800/50",
                        snapshot.isDragging && "bg-red-900/70"
                    )}
                    onClick={handleItemClick}
                    onDoubleClick={() => onItemDoubleClick(item)}
                >
                    {canBeExpanded ? (
                        <span className="mr-1">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </span>
                    ) : (
                        <span className="mr-1 w-4"></span>
                    )}

                    {editingItemId === item.id ? (
                        <input
                            type="text"
                            value={editingItemTitle}
                            onChange={onTitleChange}
                            onBlur={onTitleBlur}
                            onKeyDown={onTitleKeyDown}
                            className="bg-gray-700 text-white w-full rounded-md p-1 -m-1"
                            autoFocus
                        />
                    ) : (
                        <span>{item.title}</span>
                    )}
                </li>
            )}
        </Draggable>
    );
});

OutlineItemView.displayName = 'OutlineItemView'; 