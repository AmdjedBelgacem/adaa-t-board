"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Toaster, toast } from "sonner";
import { Task } from "@/types/task";
import Board from "@/components/tasks/Board";
import { useEffect } from "react";
import useTaskStore from "@/lib/store";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";

export default function Home() {
  const tasks = useTaskStore((s) => s.tasks);
  const loading = useTaskStore((s) => s.loading);
  const error = useTaskStore((s) => s.error);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const createTaskSvc = useTaskStore((s) => s.createTask);
  const updateTaskSvc = useTaskStore((s) => s.updateTask);
  const deleteTaskSvc = useTaskStore((s) => s.deleteTask);
  const setApiKey = useTaskStore((s) => s.setApiKey);
  const router = useRouter();

  function handleLogout() {
    try {
      setApiKey(null);
      router.replace("/login");
    } catch {}
  }

  useEffect(() => {
    // load tasks from centralized store on mount
    loadTasks();
  }, [loadTasks]);

  async function refreshTasks() {
    await loadTasks();
  }

  async function createTask(payload: Partial<Task>) {
    const created = await createTaskSvc(payload);
    if (created) {
      toast.success("Task created successfully");
      return created;
    }
    toast.error("Failed to create task");
    return null;
  }

  async function deleteTask(id: number) {
    const ok = await deleteTaskSvc(id);
    if (ok) {
      toast.success("Task deleted successfully");
      return true;
    }
    toast.error("Failed to delete task");
    return false;
  }

  async function updateTask(id: number, payload: Partial<Task>) {
    const updated = await updateTaskSvc(id, payload);
    if (updated) {
      toast.success("Task updated successfully");
      return updated;
    }
    toast.error("Failed to update task");
    return null;
  }

  const backlog = tasks.filter((t) => t.status === "BACKLOG");
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white dark:bg-[#1a2634] dark:border-slate-800 px-6 py-3 shadow-sm">
          <div className="flex items-center gap-4 text-[#0d131b] dark:text-white">
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              T-Board
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Button className="flex items-center justify-center gap-2 overflow-hidden rounded-full h-9 px-4 bg-green-400 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-sm font-bold leading-normal tracking-[0.015em]">
              <BadgeCheck/>
              <span className="truncate">API Key: Connected</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-0.5 focus:outline-none h-9 w-9">
                  <Avatar>
                    <AvatarImage
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeys7cSVSV0RvzwfIP5kwy1QLcE_U_9fi73tHcTjCh0X47H39G7sFWLCJ0frYjdEXIYSTVlXUH5HFJSrnvG3AIk3AqmDdG1yIJ2B9MfunUOHiMkt_3iLv0F-58gJQCnUwzX2EvXqO8YfHd4CLOYxBgSQDh49H9O7jZtrzyHX2ycERazFLRpbuC_sPAuZ_o-3XIUNLhIgw6RELMjVKgfKoHUrG9PjH-lgdWklG8IBPf6wI8VGd3OCjp_SwlTqw79ESD1NGa0WTPci_K"
                      alt="avatar"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuItem asChild className="text-red-600">
                  <button onClick={handleLogout}>Logout</button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-8 py-8 flex flex-1 justify-center">
            <div className="layout-content-container flex flex-col w-full max-w-[1400px] flex-1">
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : (
                <motion.div
                  key={String(backlog.length + inProgress.length + done.length)}
                  initial={{ opacity: 0, y: 8, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.995 }}
                  transition={{ duration: 0.36, ease: "easeInOut" }}
                  className="w-full"
                >
                  <Board
                    backlog={backlog}
                    inProgress={inProgress}
                    done={done}
                    onAdd={createTask}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    onRefresh={refreshTasks}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
