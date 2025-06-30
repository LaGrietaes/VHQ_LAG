import { memo } from 'react';
import { cn } from "@/lib/utils";

export type TreeOutlineItem = {
    id: string;
    title: string;
    type: 'chapter' | 'section' | 'folder';
    children?: TreeOutlineItem[];
    content?: string;
};

type OutlineItemViewProps = {
    item: TreeOutlineItem;
    level: number;
    activeItemId: string | null;
    editingItemId: string | null;
    editingItemTitle: string;
    onItemClick: (id: string) => void;
    onItemDoubleClick: (item: TreeOutlineItem) => void;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTitleBlur: () => void;
    onTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const OutlineItemView = memo(({ 
    item, 
    level, 
    activeItemId, 
    editingItemId, 
    editingItemTitle,
    onItemClick, 
    onItemDoubleClick,
    onTitleChange,
    onTitleBlur,
    onTitleKeyDown
}: OutlineItemViewProps) => {

    const isFolder = item.type === 'folder';
    // For now, folders are always expanded. We can add state for collapsing later.
    const isExpanded = isFolder; 

    return (
        <>
            <li
                style={{ paddingLeft: `${level * 1.5}rem` }}
                className={cn(
                    "p-2 rounded-md transition-colors text-sm flex items-center",
                    "cursor-pointer hover:bg-gray-800",
                    activeItemId === item.id && !editingItemId && "bg-red-800/50"
                )}
                onClick={() => onItemClick(item.id)}
                onDoubleClick={() => onItemDoubleClick(item)}
            >
                {isFolder && (
                    <span className="mr-2">{isExpanded ? '▼' : '►'}</span>
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
            {isExpanded && item.children && item.children.map(child => (
                <OutlineItemView 
                    key={child.id}
                    item={child}
                    level={level + 1}
                    activeItemId={activeItemId}
                    editingItemId={editingItemId}
                    editingItemTitle={editingItemTitle}
                    onItemClick={onItemClick}
                    onItemDoubleClick={onItemDoubleClick}
                    onTitleChange={onTitleChange}
                    onTitleBlur={onTitleBlur}
                    onTitleKeyDown={onTitleKeyDown}
                />
            ))}
        </>
    );
});

OutlineItemView.displayName = 'OutlineItemView'; 