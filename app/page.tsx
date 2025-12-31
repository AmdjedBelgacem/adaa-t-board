"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Toaster, toast } from "sonner";
import { Task } from "@/types/task";
import Board from "@/components/tasks/Board";
import { useEffect, useMemo, useState } from "react";
import useTaskStore from "@/lib/store";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ChevronLeft, ChevronRight, ArrowUpDown, KanbanSquare, AlertCircle, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeSearchQuery } from "@/lib/utils";

// Skeleton components
function TaskCardSkeleton() {
  return (
    <div className="relative group flex flex-col gap-3 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1a2634]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 flex-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full mt-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 mt-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

function ColumnSkeleton({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        <Skeleton className="h-5 w-6 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  );
}

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

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"ALPHA_ASC" | "ALPHA_DESC" | "PRIORITY">("ALPHA_ASC");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  function handleLogout() {
    try {
      setApiKey(null);
      router.replace("/login");
    } catch {}
  }

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

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

  const filteredTasks = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    let list = tasks.slice();
    if (q) {
      list = list.filter((t) => (t.title || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q));
    }

    if (sortBy === "ALPHA_ASC") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "ALPHA_DESC") {
      list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (sortBy === "PRIORITY") {
      const rank = (p?: string) => (p === "HIGH" ? 0 : p === "MEDIUM" ? 1 : 2);
      list.sort((a, b) => rank(a.priority) - rank(b.priority));
    }

    return list;
  }, [tasks, debouncedSearch, sortBy]);

  const totalItems = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const backlog = pagedTasks.filter((t) => t.status === "BACKLOG");
  const inProgress = pagedTasks.filter((t) => t.status === "IN_PROGRESS");
  const done = pagedTasks.filter((t) => t.status === "DONE");

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-linear-to-r from-white to-slate-50 dark:from-[#1a2634] dark:to-[#1e2936] dark:border-slate-800 px-6 py-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-4 text-[#0d131b] dark:text-white">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 shadow-sm">
                <KanbanSquare className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                T-Board
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <BadgeCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">API Connected</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 p-2 shadow-lg border-slate-200 dark:border-slate-700">
                <DropdownMenuItem asChild className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 rounded-md">
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Logout
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="layout-container flex h-full grow flex-col bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="px-4 md:px-8 py-8 flex flex-1 justify-center">
            <div className="layout-content-container flex flex-col w-full max-w-350 flex-1">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.995 }}
                  transition={{ duration: 0.36, ease: "easeInOut" }}
                  className="w-full"
                >
                  <div className="mb-8">
                    <div className="text-center mb-6">
                      <Skeleton className="h-8 w-48 mx-auto mb-2" />
                      <Skeleton className="h-4 w-80 mx-auto" />
                    </div>
                    <Card className="mb-6 p-6 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <Skeleton className="h-9 w-80" />
                          <Skeleton className="h-9 w-45" />
                          <Skeleton className="h-9 w-30" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <Skeleton className="h-4 w-32" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-16" />
                            <Skeleton className="h-9 w-12" />
                            <Skeleton className="h-9 w-16" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start h-full">
                      <ColumnSkeleton title="To Do" />
                      <ColumnSkeleton title="In Progress" />
                      <ColumnSkeleton title="Done" />
                    </div>
                  </div>
                </motion.div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <span className="text-lg font-medium text-slate-600 dark:text-slate-300">Something went wrong</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">{error}</p>
                  <Button onClick={refreshTasks} variant="outline" className="gap-2">
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Try Again
                  </Button>
                </div>
              ) : (
                <motion.div
                  key={String(backlog.length + inProgress.length + done.length)}
                  initial={{ opacity: 0, y: 8, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.995 }}
                  transition={{ duration: 0.36, ease: "easeInOut" }}
                  className="w-full"
                >
                  <div className="mb-8">
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Task Board</h1>
                      <p className="text-slate-600 dark:text-slate-400">Manage your tasks efficiently across different stages</p>
                    </div>

                    <Card className="mb-6 p-6 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative">
                          <Input
                            value={searchText}
                            onChange={(e) => { setSearchText(sanitizeSearchQuery(e.target.value)); setPage(1); }}
                            placeholder="Search tasks by title or description"
                            className="pl-9 w-full sm:w-[320px] border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        </div>
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="text-muted-foreground h-4 w-4" />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="w-45 justify-start gap-2">
                                  <ArrowUpDown className="h-4 w-4" />
                                  {sortBy === "ALPHA_ASC" && "Title: A → Z"}
                                  {sortBy === "ALPHA_DESC" && "Title: Z → A"}
                                  {sortBy === "PRIORITY" && "Priority (High → Low)"}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => { setSortBy(v as "ALPHA_ASC" | "ALPHA_DESC" | "PRIORITY"); setPage(1); }}>
                                  <DropdownMenuRadioItem value="ALPHA_ASC" className="gap-2">
                                    <span className="material-symbols-outlined text-sm">sort_by_alpha</span>
                                    Title: A → Z
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="ALPHA_DESC" className="gap-2">
                                    <span className="material-symbols-outlined text-sm">sort_by_alpha</span>
                                    Title: Z → A
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="PRIORITY" className="gap-2">
                                    <span className="material-symbols-outlined text-sm">priority_high</span>
                                    Priority (High → Low)
                                  </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-30">
                              <SelectValue placeholder="Page size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6">6 per page</SelectItem>
                              <SelectItem value="12">12 per page</SelectItem>
                              <SelectItem value="24">24 per page</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-md">
                            Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> – <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="gap-1"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Prev
                            </Button>
                            <span className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md border">
                              {currentPage} / {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="gap-1"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50 backdrop-blur-sm">
                    <Board
                      backlog={backlog}
                      inProgress={inProgress}
                      done={done}
                      onAdd={createTask}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                      onRefresh={refreshTasks}
                      disableOrdering={debouncedSearch.length > 0 || sortBy !== "ALPHA_ASC"}
                    />
                  </div>
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
