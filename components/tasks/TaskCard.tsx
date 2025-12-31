import React, { useState, type CSSProperties } from "react";
import { Edit2, Trash2, GripVertical, MoreVertical, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DateTime } from "luxon";

type Props = {
  task: Task;
  onEdit?: (t: Task) => void;
  onDelete?: (id: number) => void;
};

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id.toString() });
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition ?? "transform 180ms ease",
    willChange: "transform",
  } as CSSProperties;

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div ref={setNodeRef} style={style} className={`relative group flex flex-col gap-3 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all ${task.status === "DONE" ? "bg-slate-50 dark:bg-[#151f2b] opacity-75 hover:opacity-100" : "bg-white dark:bg-[#1a2634]"}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <Badge className={`text-xs px-2 py-1 ring-1 ring-inset ${task.priority === "HIGH" ? "bg-red-400 text-white ring-red-600/10 dark:bg-red-900/30 dark:text-red-400" : task.priority === "MEDIUM" ? "bg-orange-400 text-white ring-blue-700/10 dark:bg-blue-900/30 dark:text-white" : "bg-green-400 text-white ring-green-600/10 dark:bg-green-900/30 dark:text-green-400"}`}>
            {task.priority === "HIGH" ? "High Priority" : task.priority === "MEDIUM" ? "Medium Priority" : "Low Priority"}
          </Badge>
          <p className={`text-slate-900 dark:text-white text-base font-semibold leading-tight mt-1 ${task.status === "DONE" ? "line-through decoration-slate-400" : ""}`}>
            {task.title}
          </p>
        </div>
        {task.status === "DONE" && (
          <div className="text-emerald-500">
            <span className="material-symbols-outlined text-xl">check_circle</span>
          </div>
        )}
      </div>

      {task.description ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{task.description}</p>
      ) : null}

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 mt-1">
        <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
          <Calendar className="h-4"/>
          <span>{task.due_date ? DateTime.fromISO(task.due_date).toLocaleString(DateTime.DATE_MED) : "No due date"}</span>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-600" title="More">
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Edit2 className="size-4 mr-2 inline" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="size-4 mr-2 inline" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            title="Drag"
            aria-label="Drag"
          >
            <GripVertical className="size-4" />
          </button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onDelete?.(task.id); setConfirmOpen(false); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
