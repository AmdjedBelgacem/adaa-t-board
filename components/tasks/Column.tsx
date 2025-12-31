import React, { useState, useMemo } from "react";
import TaskCard from "./TaskCard";
import { AddTaskDialog, EditTaskDialog } from "./TaskDialogs";
import { Task } from "@/types/task";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";

type OrderedProps = {
  order?: string[]; 
  containerId?: string;
};

type Props = {
  title: string;
  tasks: Task[];
  status: Task["status"];
  onAdd?: (payload: Partial<Task>) => Promise<Task | null> | void;
  onUpdate?: (id: number, payload: Partial<Task>) => Promise<Task | null> | void;
  onDelete?: (id: number) => Promise<boolean> | void;
  onRefresh?: () => void;
};

export default function Column({ title, tasks, status, onAdd, onUpdate, onDelete, onRefresh, order, containerId }: Props & OrderedProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  function startEdit(t: Task) {
    setEditing(t);
    setEditOpen(true);
  }

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: containerId || `column-${status}` });
  const taskMap = useMemo(() => {
    const m: Record<string, Task> = {};
    for (const t of tasks) m[t.id.toString()] = t;
    return m;
  }, [tasks]);

  const itemsToRender: Task[] = useMemo(() => {
    if (order && order.length > 0) {
      const ordered: Task[] = [];
      const seen = new Set<string>();
      for (const id of order) {
        const t = taskMap[id];
        if (t) {
          ordered.push(t);
          seen.add(id);
        }
      }

      for (const t of tasks) {
        if (!seen.has(t.id.toString())) ordered.push(t);
      }
      return ordered;
    }
    return tasks;
  }, [order, taskMap, tasks]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-slate-800 dark:text-slate-100 text-lg font-bold leading-tight">{title}</h3>
          <span className="flex h-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 px-2 text-xs font-bold text-slate-600 dark:text-slate-300">{tasks.length}</span>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen((s) => !s)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 rounded shadow-sm z-10">
              <button onClick={() => { setAddOpen(true); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Add task</button>
              <button onClick={() => { setMenuOpen(false); if (onRefresh) onRefresh(); else window.location.reload(); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Refresh</button>
            </div>
          ) : null}
        </div>
      </div>

      <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} defaultStatus={status} onSubmit={async (p) => { if (onAdd) await onAdd(p); if (onRefresh) onRefresh(); }} />
      <EditTaskDialog open={editOpen} onOpenChange={setEditOpen} task={editing} onSubmit={async (id, p) => { if (onUpdate) await onUpdate(id, p); if (onRefresh) onRefresh(); }} />

      <div ref={setDroppableRef} id={containerId || `column-${status}`} className={`${isOver ? 'ring-2 ring-primary/40 rounded-lg p-1' : ''}`}>
        <div className="mb-3">
          <Button
            onClick={() => setAddOpen(true)}
            className="group flex flex-col gap-3 rounded-xl bg-slate-50 dark:bg-[#151f2b] p-4 shadow-sm border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer w-full text-left"
          >
            <div className="flex items-center justify-center gap-2 text-slate-500 hover:text-primary">
              <span className="material-symbols-outlined">add</span>
              <span className="text-sm font-bold">Add Task</span>
            </div>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {itemsToRender.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={startEdit} onDelete={(id) => onDelete?.(id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
