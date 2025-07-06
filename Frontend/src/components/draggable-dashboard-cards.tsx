"use client"

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const CARD_ORDER_KEY = "vhq-dashboard-card-order";

const DEFAULT_CARDS = [
  { id: "calendar", label: "Calendar" },
  { id: "taskqueue", label: "Task Queue" },
  { id: "todo", label: "Personal Todo" },
  { id: "timeline", label: "Project Timeline" },
];

function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 right-2 z-10 p-1 cursor-move text-gray-500 hover:text-gray-300 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      {children}
    </div>
  );
}

export function DraggableDashboardCards({
  CalendarWidget,
  TodoList,
  InteractiveTodo,
  ProjectTimeline,
}: {
  CalendarWidget: React.ReactNode;
  TodoList: React.ReactNode;
  InteractiveTodo: React.ReactNode;
  ProjectTimeline: React.ReactNode;
}) {
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  // Load order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CARD_ORDER_KEY);
    if (saved) {
      setCardOrder(JSON.parse(saved));
    } else {
      setCardOrder(DEFAULT_CARDS.map((c) => c.id));
    }
  }, []);

  // Save order to localStorage
  useEffect(() => {
    if (cardOrder.length) {
      localStorage.setItem(CARD_ORDER_KEY, JSON.stringify(cardOrder));
    }
  }, [cardOrder]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Map card id to component
  const cardMap: Record<string, React.ReactNode> = {
    calendar: CalendarWidget,
    taskqueue: TodoList,
    todo: InteractiveTodo,
    timeline: ProjectTimeline,
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {cardOrder.map((id) => (
            <DraggableCard key={id} id={id}>{cardMap[id]}</DraggableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 