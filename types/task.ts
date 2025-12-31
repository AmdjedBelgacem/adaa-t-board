export type Task = {
  id: number;
  title: string;
  description?: string;
  status: "BACKLOG" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  due_date?: string | null;
  created_at?: string;
};
