import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Type,
  FileText,
  Plus,
  Edit3,
} from "lucide-react";
import { DateTime } from "luxon";

type AddProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultStatus: Task["status"];
  onSubmit: (payload: Partial<Task>) => Promise<void> | void;
};

export function AddTaskDialog({
  open,
  onOpenChange,
  defaultStatus,
  onSubmit,
}: AddProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-2xl p-6">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl shadow-sm">
              <Plus className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Add New Task
              </DialogTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Create a new task for your project
              </p>
            </div>
          </div>
        </DialogHeader>
        <AddTaskForm
          key={open ? "open" : "closed"}
          defaultStatus={defaultStatus}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddTaskForm({
  defaultStatus,
  onSubmit,
  onOpenChange,
}: {
  defaultStatus: Task["status"];
  onSubmit: (payload: Partial<Task>) => Promise<void> | void;
  onOpenChange: (v: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  const handle = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;
    await onSubmit({
      title: title.trim(),
      description: desc.trim(),
      priority,
      status: defaultStatus,
      due_date: dueDate || null,
    });
    onOpenChange(false);
  };

  return (
    <form onSubmit={handle} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Type className="size-4 text-blue-500" /> Title *
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear, descriptive title"
            required
            className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-800/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <FileText className="size-4 text-green-500" /> Description
          </Label>
          <Textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Provide additional details about this task (optional)"
            rows={4}
            className="border-slate-200 dark:border-slate-700 focus:border-green-500 focus:ring-green-500/20 resize-none bg-white dark:bg-slate-800/50"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-center items-center px-1 gap-8">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 text-center">
            Priority
          </Label>
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 text-center">
            Due Date
          </Label>
        </div>
        
  <div className="grid grid-cols-2 gap-4">
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as Task["priority"])}
          >
            <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20 bg-white dark:bg-slate-800/50">
              <SelectValue placeholder="Select priority level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 dark:bg-slate-400 mr-2" />
                Low
              </SelectItem>
              <SelectItem value="MEDIUM">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-400 dark:bg-blue-400 mr-2" />
                Medium
              </SelectItem>
              <SelectItem value="HIGH">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400 dark:bg-red-400 mr-2" />
                High
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 bg-white dark:bg-slate-800/50"
          />
        </div>
      </div>

      <DialogFooter className="gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 px-6"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-sm"
        >
          <Plus className="size-4 mr-2" />
          Create Task
        </Button>
      </DialogFooter>
    </form>
  );
}

type EditProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task | null;
  onSubmit: (id: number, payload: Partial<Task>) => Promise<void> | void;
};

export function EditTaskDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: EditProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-2xl p-6">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl shadow-sm">
              <Edit3 className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Edit Task
              </DialogTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Update task details and settings
              </p>
            </div>
          </div>
        </DialogHeader>

        <EditTaskForm
          key={`${task?.id ?? "no-task"}-${open ? "1" : "0"}`}
          task={task}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditTaskForm({
  task,
  onOpenChange,
  onSubmit,
}: {
  task?: Task | null;
  onOpenChange: (v: boolean) => void;
  onSubmit: (id: number, payload: Partial<Task>) => Promise<void> | void;
}) {
  const [title, setTitle] = useState(() => task?.title ?? "");
  const [desc, setDesc] = useState(() => task?.description ?? "");
  const [priority, setPriority] = useState<Task["priority"]>(
    () => task?.priority ?? "MEDIUM"
  );
  const [status, setStatus] = useState<Task["status"]>(
    () => task?.status ?? "BACKLOG"
  );
  const [dueDate, setDueDate] = useState(() =>
    task?.due_date ? DateTime.fromISO(task!.due_date!).toISODate()! : ""
  );

  const handle = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!task) return;
    await onSubmit(task.id, {
      title: title.trim(),
      description: desc.trim(),
      priority,
      status,
      due_date: dueDate || null,
    });
    onOpenChange(false);
  };

  return (
    <form onSubmit={handle} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Type className="size-4 text-blue-500" /> Title *
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear, descriptive title"
            required
            className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-800/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <FileText className="size-4 text-green-500" /> Description
          </Label>
          <Textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Provide additional details about this task (optional)"
            rows={4}
            className="border-slate-200 dark:border-slate-700 focus:border-green-500 focus:ring-green-500/20 resize-none bg-white dark:bg-slate-800/50"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 text-center">
            Status
          </Label>
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 text-center">
            Priority
          </Label>
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 text-center">
            Due Date
          </Label>
        </div>
        
  <div className="grid grid-cols-3 gap-3">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as Task["status"])}
          >
            <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500/20 bg-white dark:bg-slate-800/50">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BACKLOG">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as Task["priority"])}
          >
            <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:border-red-500 focus:ring-red-500/20 bg-white dark:bg-slate-800/50">
              <SelectValue placeholder="Select priority level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 dark:bg-slate-400 mr-2" />
                Low
              </SelectItem>
              <SelectItem value="MEDIUM">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-400 dark:bg-orange-400 mr-2" />
                Medium
              </SelectItem>
              <SelectItem value="HIGH">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400 dark:bg-red-400 mr-2" />
                High
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 bg-white dark:bg-slate-800/50"
          />
        </div>
      </div>

      <DialogFooter className="gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 px-6"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 shadow-sm"
        >
          <Edit3 className="size-4 mr-2" />
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}
