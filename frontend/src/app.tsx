import { useEffect, useState } from "preact/hooks";
import { getTasks, addTask, updateTask, deleteTask } from "./api";
import type { Task } from "./api";

type Filter = "all" | "active" | "completed";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ----- Fetch Tasks -----
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      const normalized = data.map((t) => ({ ...t, id: Number(t.id) }));
      setTasks(normalized);
    } catch (err) {
      alert("Failed to fetch tasks: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;

  // ----- Handlers -----
  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      await addTask(newTitle);
      setNewTitle("");
      fetchTasks(); 
    } catch (err) {
      alert("Failed to add task: " + err);
    }
  };
const handleToggle = async (task: Task) => {
  await updateTask(task.id, { completed: !task.completed });
};

const handleDelete = (id: number) => {
  setDeletingId(id);
  setTimeout(async () => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      alert("Failed to delete task: " + err);
    } finally {
      setDeletingId(null);
    }
  }, 300);
};

const handleEditStart = (task: Task) => {
  setEditingId(task.id);
  setEditingTitle(task.title);
};

const handleEditSave = async (task: Task) => {
  await updateTask(task.id, { title: editingTitle });
};


  // ----- JSX -----
  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "2rem auto",
        backgroundColor: "#1f1f1f",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        color: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#64ffda",
        }}
      >
        Task Manager
      </h1>

      {/* Add Task */}
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New task"
          value={newTitle}
          onInput={(e) => setNewTitle((e.target as HTMLInputElement).value)}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            borderRadius: "8px 0 0 8px",
            border: "none",
            outline: "none",
            fontSize: "1rem",
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "0.75rem 1.5rem",
            border: "none",
            backgroundColor: "#64ffda",
            color: "#1f1f1f",
            fontWeight: "bold",
            borderRadius: "0 8px 8px 0",
            cursor: "pointer",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#52d9b9")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#64ffda")
          }
        >
          Add
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              margin: "0 0.25rem",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "1px solid #64ffda",
              backgroundColor: filter === f ? "#64ffda" : "transparent",
              color: filter === f ? "#1f1f1f" : "#fff",
              cursor: "pointer",
              fontWeight: filter === f ? "bold" : "normal",
              transition: "all 0.3s",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task Count */}
      <p style={{ textAlign: "center", marginBottom: "1rem", color: "#ccc" }}>
        {activeCount} task{activeCount !== 1 ? "s" : ""} remaining
      </p>

      {/* Task List */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p style={{ textAlign: "center" }}>No tasks to show.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                backgroundColor:
                  task.completed || deletingId === task.id
                    ? "#333"
                    : "#2a2a2a",
                opacity: deletingId === task.id ? 0.5 : 1,
                transition: "all 0.3s",
              }}
            >
              {editingId === task.id ? (
                <div style={{ display: "flex", flex: 1 }}>
                  <input
                    type="text"
                    value={editingTitle}
                    onInput={(e) =>
                      setEditingTitle((e.target as HTMLInputElement).value)
                    }
                    style={{ flex: 1, padding: "0.5rem", borderRadius: "6px" }}
                  />
                  <button
                    onClick={() => handleEditSave(task)}
                    style={{
                      marginLeft: "0.5rem",
                      backgroundColor: "#64ffda",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      padding: "0 0.75rem",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      marginLeft: "0.5rem",
                      backgroundColor: "#ff4c4c",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      padding: "0 0.75rem",
                      color: "#fff",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span
                    onClick={() => handleToggle(task)}
                    style={{
                      cursor: "pointer",
                      flex: 1,
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "#888" : "#fff",
                    }}
                  >
                    {task.title}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEditStart(task)}
                      style={{
                        marginRight: "0.5rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#64ffda",
                        color: "#1f1f1f",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#ff4c4c",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
