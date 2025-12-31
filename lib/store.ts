import create from "zustand";
import { Task } from "@/types/task";
import * as svc from "@/services/tasks";

type State = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  apiKey: string | null;
  setApiKey: (k: string | null) => void;
  loadTasks: () => Promise<void>;
  createTask: (payload: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: number, payload: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<boolean>;
  backlogOrder: string[];
  inProgressOrder: string[];
  doneOrder: string[];
  setOrdersFromTasks: (tasks: Task[]) => void;
  moveWithin: (status: Task['status'], oldIndex: number, newIndex: number) => void;
  moveTo: (id: string, from: Task['status'], to: Task['status'], insertAt?: number) => void;
};

const isClient = typeof window !== "undefined";

export const useTaskStore = create<State>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  apiKey: isClient ? localStorage.getItem("apiKey") : null,
  backlogOrder: [],
  inProgressOrder: [],
  doneOrder: [],

  setApiKey: (k: string | null) => {
    if (isClient) {
      try {
        if (k) localStorage.setItem("apiKey", k);
        else localStorage.removeItem("apiKey");
      } catch {}
      try {
        window.dispatchEvent(new Event("apiKeyChanged"));
      } catch {}
    }
    set({ apiKey: k });
  },

  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      const data = await svc.getTasks();
      const tasks = data || [];
      set({ tasks });
      set({
        backlogOrder: tasks.filter((t) => t.status === "BACKLOG").map((t) => t.id.toString()),
        inProgressOrder: tasks.filter((t) => t.status === "IN_PROGRESS").map((t) => t.id.toString()),
        doneOrder: tasks.filter((t) => t.status === "DONE").map((t) => t.id.toString()),
      });
    } catch {
      set({ error: "Network error", tasks: [] });
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (payload: Partial<Task>) => {
    try {
      const created = await svc.createTask(payload);
      set((s: State) => ({ tasks: [created, ...s.tasks], backlogOrder: created.id ? [created.id.toString(), ...s.backlogOrder] : s.backlogOrder }));
      return created;
    } catch {
      return null;
    }
  },

  updateTask: async (id: number, payload: Partial<Task>) => {
    try {
      const updated = await svc.updateTask(id, payload);
      set((s: State) => ({ tasks: s.tasks.map((t) => (t.id === updated.id ? updated : t)) }));
      const prev = get();
      const idStr = updated.id.toString();
      if (payload.status && payload.status !== undefined) {
        const fromStatuses: Task["status"][] = ["BACKLOG", "IN_PROGRESS", "DONE"];
        for (const st of fromStatuses) {
          if (st === payload.status) continue;
          const arrName = st === "BACKLOG" ? "backlogOrder" : st === "IN_PROGRESS" ? "inProgressOrder" : "doneOrder";
          const prevMap = prev as unknown as Record<string, string[]>;
          if (prevMap[arrName] && prevMap[arrName].includes(idStr)) {
            set((s: State) => ({
              backlogOrder: s.backlogOrder.filter((x) => x !== idStr),
              inProgressOrder: s.inProgressOrder.filter((x) => x !== idStr),
              doneOrder: s.doneOrder.filter((x) => x !== idStr),
            }));
            const destName = payload.status === "BACKLOG" ? "backlogOrder" : payload.status === "IN_PROGRESS" ? "inProgressOrder" : "doneOrder";
            set((s: State) => ({ ...(s as unknown as Record<string, string[]>), [destName]: [idStr, ...((s as unknown as Record<string, string[]>)[destName] || [])] } as unknown as Partial<State>));
            break;
          }
        }
      }
      return updated;
    } catch {
      return null;
    }
  },

  deleteTask: async (id: number) => {
    try {
      await svc.deleteTask(id);
      const idStr = id.toString();
      set((s: State) => ({ tasks: s.tasks.filter((t) => t.id !== id), backlogOrder: s.backlogOrder.filter((x) => x !== idStr), inProgressOrder: s.inProgressOrder.filter((x) => x !== idStr), doneOrder: s.doneOrder.filter((x) => x !== idStr) }));
      return true;
    } catch {
      return false;
    }
  },

  setOrdersFromTasks: (tasks: Task[]) => {
    set({
      backlogOrder: tasks.filter((t) => t.status === "BACKLOG").map((t) => t.id.toString()),
      inProgressOrder: tasks.filter((t) => t.status === "IN_PROGRESS").map((t) => t.id.toString()),
      doneOrder: tasks.filter((t) => t.status === "DONE").map((t) => t.id.toString()),
    });
  },

  moveWithin: (status: Task["status"], oldIndex: number, newIndex: number) => {
    const fn = (arr: string[], oi: number, ni: number) => {
      const copy = [...arr];
      const [m] = copy.splice(oi, 1);
      copy.splice(ni, 0, m);
      return copy;
    };
    if (status === "BACKLOG") set((s: State) => ({ backlogOrder: fn(s.backlogOrder, oldIndex, newIndex) }));
    if (status === "IN_PROGRESS") set((s: State) => ({ inProgressOrder: fn(s.inProgressOrder, oldIndex, newIndex) }));
    if (status === "DONE") set((s: State) => ({ doneOrder: fn(s.doneOrder, oldIndex, newIndex) }));
  },

  moveTo: (id: string, _from: Task["status"], to: Task["status"], insertAt = 0) => {
    set((s: State) => {
      const remove = (arr: string[]) => arr.filter((x) => x !== id);
      const addAt = (arr: string[]) => {
        const copy = [...arr];
        copy.splice(insertAt >= 0 && insertAt <= copy.length ? insertAt : copy.length, 0, id);
        return copy;
      };
      return {
        backlogOrder: to === "BACKLOG" ? addAt(remove(s.backlogOrder)) : remove(s.backlogOrder),
        inProgressOrder: to === "IN_PROGRESS" ? addAt(remove(s.inProgressOrder)) : remove(s.inProgressOrder),
        doneOrder: to === "DONE" ? addAt(remove(s.doneOrder)) : remove(s.doneOrder),
      } as unknown as Partial<State>;
    });
  },
}));

export default useTaskStore;
