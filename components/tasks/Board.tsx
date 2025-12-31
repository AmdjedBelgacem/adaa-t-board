"use client";

import React, { useState } from "react";
import Column from "./Column";
import { Task } from "@/types/task";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  KeyboardSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { DateTime } from "luxon";
import useTaskStore from "@/lib/store";

type Props = {
  backlog: Task[];
  inProgress: Task[];
  done: Task[];
  onAdd?: (payload: Partial<Task>) => Promise<Task | null> | void;
  onUpdate?: (id: number, payload: Partial<Task>) => Promise<Task | null> | void;
  onDelete?: (id: number) => Promise<boolean> | void;
  onRefresh?: () => void;
  disableOrdering?: boolean;
};

export default function Board({
  backlog,
  inProgress,
  done,
  onAdd,
  onUpdate,
  onDelete,
  onRefresh,
  disableOrdering = false,
}: Props) {
  const backlogOrder = useTaskStore((s) => s.backlogOrder);
  const inProgressOrder = useTaskStore((s) => s.inProgressOrder);
  const doneOrder = useTaskStore((s) => s.doneOrder);
  const moveWithin = useTaskStore((s) => s.moveWithin);
  const moveTo = useTaskStore((s) => s.moveTo);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor)
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  function findContainer(id: string | null) {
    if (!id) return null;
    if (typeof id === "string" && id.startsWith("column-")) {
      const parts = id.split("-");
      return parts.slice(1).join("-") as Task["status"];
    }
    if (backlogOrder.includes(id)) return "BACKLOG";
    if (inProgressOrder.includes(id)) return "IN_PROGRESS";
    if (doneOrder.includes(id)) return "DONE";
    return null;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && activeContainer === overContainer) {
      const list = activeContainer === "BACKLOG" ? backlogOrder : activeContainer === "IN_PROGRESS" ? inProgressOrder : doneOrder;
      const oldIndex = list.indexOf(activeId);
      const newIndex = list.indexOf(overId);
      if (oldIndex >= 0 && newIndex >= 0) moveWithin(activeContainer as Task["status"], oldIndex, newIndex);
      return;
    }

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      const idx = (overContainer === "BACKLOG" ? backlogOrder : overContainer === "IN_PROGRESS" ? inProgressOrder : doneOrder).indexOf(overId);
      const insertAt = idx >= 0 ? idx : undefined;
      moveTo(activeId, activeContainer as Task["status"], overContainer as Task["status"], insertAt);

      const idNum = parseInt(activeId, 10);
      if (!isNaN(idNum) && onUpdate && overContainer) {
        onUpdate(idNum, { status: overContainer as Task["status"] });
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart} onDragCancel={handleDragCancel} collisionDetection={closestCenter}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start h-full">
        <SortableContext items={disableOrdering ? backlog.map(t => t.id.toString()) : backlogOrder}>
          <Column title="To Do" tasks={backlog} status="BACKLOG" order={disableOrdering ? undefined : backlogOrder} containerId={`column-BACKLOG`} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} onRefresh={onRefresh} />
        </SortableContext>

        <SortableContext items={disableOrdering ? inProgress.map(t => t.id.toString()) : inProgressOrder}>
          <Column title="In Progress" tasks={inProgress} status="IN_PROGRESS" order={disableOrdering ? undefined : inProgressOrder} containerId={`column-IN_PROGRESS`} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} onRefresh={onRefresh} />
        </SortableContext>

        <SortableContext items={disableOrdering ? done.map(t => t.id.toString()) : doneOrder}>
          <Column title="Done" tasks={done} status="DONE" order={disableOrdering ? undefined : doneOrder} containerId={`column-DONE`} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} onRefresh={onRefresh} />
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 150 }}>
          {activeId ? (
            (() => {
              const all = [...backlog, ...inProgress, ...done];
              const t = all.find((x) => x.id.toString() === activeId);
              if (!t) return null;
              return (
                <div className="relative group flex flex-col gap-3 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1720] w-80">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex text-xs px-2 py-1 rounded-full ${t.priority === 'HIGH' ? 'bg-red-50 text-red-700' : t.priority === 'MEDIUM' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {t.priority === 'HIGH' ? 'High' : t.priority === 'MEDIUM' ? 'Medium' : 'Low'}
                      </span>
                      <p className="text-slate-900 dark:text-white text-base font-semibold leading-tight mt-1">{t.title}</p>
                    </div>
                  </div>
                  {t.description ? <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{t.description}</p> : null}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 mt-1">
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span>{t.due_date ? DateTime.fromISO(t.due_date).toLocaleString(DateTime.DATE_MED) : 'No due date'}</span>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
