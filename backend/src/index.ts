import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// ----- App Setup -----
const app = express();
const PORT = parseInt(process.env.PORT ?? "5000", 10);

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ----- Task Interface & In-Memory Storage -----
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

let tasks: Task[] = [];

// ----- Root Route -----
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend is running!");
});

// ----- CRUD Routes -----

// GET all tasks
app.get("/tasks", (_req: Request, res: Response) => {
  res.json(tasks);
});

// POST create new task
app.post("/tasks", (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required and must be a string" });
  }

  const newTask: Task = { id: uuidv4(), title, completed: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT update task
app.put("/tasks/:id", (req: Request, res: Response) => {
  const taskId = req.params.id;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { title, completed } = req.body as Partial<Task>;
  if (title !== undefined) task.title = title;
  if (completed !== undefined) task.completed = completed;

  res.json(task);
});

// DELETE a task
app.delete("/tasks/:id", (req: Request, res: Response) => {
  const taskId = req.params.id;
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== taskId);

  if (tasks.length < initialLength) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// ----- Start Server -----
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);
});
