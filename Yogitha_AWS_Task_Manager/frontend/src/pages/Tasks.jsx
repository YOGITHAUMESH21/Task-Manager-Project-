import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Tasks.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const isLoggedIn = localStorage.getItem("taskManagerLoggedIn");

  if(isLoggedIn !== "true"){
    navigate("/login");
    return null;
  }

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/tasks`);

      if (!response.ok) {
        throw new Error("Unable to load tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the task server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) {
      setMessage("Please enter a task first.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: newTask.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      setNewTask("");
      setMessage("Task added successfully ✓");
      await fetchTasks();
    } catch (error) {
      console.error(error);
      setMessage("Could not add the task.");
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      await fetchTasks();
      setMessage("Task deleted.");
    } catch (error) {
      console.error(error);
      setMessage("Could not delete the task.");
    }
  };

  const toggleCompleted = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}/completed`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      await fetchTasks();
    } catch (error) {
      console.error(error);
      setMessage("Could not update the task.");
    }
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.task);
  };

  const saveEdit = async (id) => {
    if (!editingText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: editingText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit task");
      }

      setEditingId(null);
      setEditingText("");
      await fetchTasks();
      setMessage("Task updated ✓");
    } catch (error) {
      console.error(error);
      setMessage("Could not update the task.");
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const username = localStorage.getItem("taskManagerUser") || "User";

  const logout = () => {
    localStorage.removeItem("taskManagerLoggedIn");
    localStorage.removeItem("taskManagerUser");
    navigate("/");
  };

  return (
    <div className="task-page">

      <div className="task-background-circle circle-one"></div>
      <div className="task-background-circle circle-two"></div>

      <div className="task-container">

        <header className="task-header">
          <div>
            <p className="task-label">AWS TASK MANAGER</p>
            <h1>My Tasks</h1>
            <p className="task-subtitle">
              Welcome back, {username}. Let's get things done.
            </p>
          </div>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </header>

        <section className="stats-container">

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div>
              <p>Total</p>
              <h2>{tasks.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div>
              <p>Pending</p>
              <h2>{pendingTasks}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div>
              <p>Completed</p>
              <h2>{completedTasks}</h2>
            </div>
          </div>

        </section>

        <section className="add-task-card">

          <div className="add-task-input">
            <span>＋</span>

            <input
              type="text"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => {
                setNewTask(e.target.value);
                setMessage("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTask();
                }
              }}
            />
          </div>

          <button className="add-task-button" onClick={addTask}>
            Add Task
          </button>

        </section>

        {message && (
          <div className="task-message">
            {message}
          </div>
        )}

        <section className="tasks-section">

          <div className="section-title">
            <div>
              <h2>Your Tasks</h2>
              <p>Stay focused and keep moving forward.</p>
            </div>

            <span>
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {loading ? (

            <div className="empty-state">
              <div className="loading-icon">⟳</div>
              <h3>Loading tasks...</h3>
            </div>

          ) : tasks.length === 0 ? (

            <div className="empty-state">
              <div>📝</div>
              <h3>No tasks yet</h3>
              <p>Add your first task above.</p>
            </div>

          ) : (

            <div className="tasks-list">

              {tasks.map((item) => (

                <div
                  className={`task-card ${item.completed ? "completed" : ""}`}
                  key={item.id}
                >

                  <button
                    className={`check-button ${
                      item.completed ? "checked" : ""
                    }`}
                    onClick={() => toggleCompleted(item.id)}
                  >
                    {item.completed ? "✓" : ""}
                  </button>

                  <div className="task-content">

                    {editingId === item.id ? (

                      <div className="edit-area">
                        <input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveEdit(item.id);
                            }
                          }}
                          autoFocus
                        />

                        <button onClick={() => saveEdit(item.id)}>
                          Save
                        </button>

                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingText("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>

                    ) : (

                      <>
                        <h3>{item.task}</h3>

                        <p className="task-time">
                          🕒 Added on {formatDateTime(item.created_at)}
                        </p>
                      </>

                    )}

                  </div>

                  {editingId !== item.id && (
                    <div className="task-actions">

                      <button
                        className="edit-button"
                        onClick={() => startEditing(item)}
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => deleteTask(item.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>

                    </div>
                  )}

                </div>

              ))}

            </div>
          )}

        </section>

        <footer className="task-footer">
          <span>React</span>
          <span>•</span>
          <span>Node.js</span>
          <span>•</span>
          <span>PostgreSQL</span>
          <span>•</span>
          <span>AWS</span>
        </footer>

      </div>
    </div>
  );
}

export default Tasks;