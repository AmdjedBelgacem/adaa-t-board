import api from './api'
import { Task } from '@/types/task'

export type NewTask = Omit<Task, 'id' | 'created_at' | 'created_at'>

export async function getTasks(): Promise<Task[]> {
  return api.get<Task[]>('/api/tasks')
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  return api.post<Task>('/api/tasks', data)
}

export async function updateTask(id: number | string, data: Partial<Task>): Promise<Task> {
  return api.patch<Task>(`/api/tasks/${id}`, data)
}

export async function deleteTask(id: number | string): Promise<void> {
  return api.del(`/api/tasks/${id}`)
}

const tasks = { getTasks, createTask, updateTask, deleteTask }
export default tasks
