export interface Task {
  id: number;  // <-- number
  title: string;
  completed: boolean;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "API error");
  }
  return res.json();
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`);
  const data = await handleResponse<Task[]>(res);
  // Convert all IDs to number just in case backend returns string
  return data.map(t => ({ ...t, id: Number(t.id) }));
}

export async function addTask(title: string): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const task = await handleResponse<Task>(res);
  return { ...task, id: Number(task.id) };
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const task = await handleResponse<Task>(res);
  return { ...task, id: Number(task.id) };
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
}
