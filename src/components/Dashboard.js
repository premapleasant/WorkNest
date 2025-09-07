import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArchive,
  FaEdit,
  FaTrash,
  FaTrashRestore,
  FaTimes,
  FaArrowLeft,
  FaSignOutAlt,
  FaSun,
  FaMoon,
} from "react-icons/fa";

import "./Dashboard.css";

function Dashboard() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [trashList, setTrashList] = useState([]);
  const [archiveList, setArchiveList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch user and tasks from backend
  const fetchData = async () => {
    try {
      const resUser = await fetch("http://localhost:3000/user", {
        method: "GET",
        headers: { Authorization: token },
      });
      if (resUser.ok) {
        const userData = await resUser.json();
        setUsername(userData.name || "User");
      }

      const resTasks = await fetch("http://localhost:3000/tasks", {
        headers: { Authorization: token },
      });
      if (resTasks.ok) {
        const data = await resTasks.json();
        // Separate tasks by status
        setTaskList(data.filter((t) => t.status === "home"));
        setArchiveList(data.filter((t) => t.status === "archive"));
        setTrashList(data.filter((t) => t.status === "trash"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add or update task
  const handleSubmit = async () => {
    if (!title || !desc) return;

    try {
      if (isEditing) {
        const res = await fetch(`http://localhost:3000/tasks/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ title, description: desc }),
        });
        if (res.ok) {
          setIsEditing(false);
          setEditingId(null);
        }
      } else {
        const res = await fetch("http://localhost:3000/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ title, description: desc }),
        });
        if (!res.ok) throw new Error("Error adding task");
      }
      setTitle("");
      setDesc("");
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const editTask = (task) => {
    setIsEditing(true);
    setEditingId(task.id);
    setTitle(task.title);
    setDesc(task.description);
  };

  // Helper to update task status in backend and sync frontend state
  const updateTaskStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/tasks/${id}/${newStatus}`, {
        method: "PUT",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error(`Failed to update status to ${newStatus}`);

      // Locate task in any list
      const taskFromHome = taskList.find((t) => t.id === id);
      const taskFromArchive = archiveList.find((t) => t.id === id);
      const taskFromTrash = trashList.find((t) => t.id === id);

      if (newStatus === "archive") {
        if (taskFromHome) {
          setArchiveList([...archiveList, taskFromHome]);
          setTaskList(taskList.filter((t) => t.id !== id));
        }
      } else if (newStatus === "trash") {
        if (taskFromHome) {
          setTrashList([...trashList, taskFromHome]);
          setTaskList(taskList.filter((t) => t.id !== id));
        } else if (taskFromArchive) {
          setTrashList([...trashList, taskFromArchive]);
          setArchiveList(archiveList.filter((t) => t.id !== id));
        }
      } else if (newStatus === "restore" || newStatus === "unarchive") {
        if (taskFromTrash) {
          setTaskList([...taskList, taskFromTrash]);
          setTrashList(trashList.filter((t) => t.id !== id));
        } else if (taskFromArchive && newStatus === "unarchive") {
          // If you ever need to handle unarchive differently, here is placeholder
          setTaskList([...taskList, taskFromArchive]);
          setArchiveList(archiveList.filter((t) => t.id !== id));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const permanentlyDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (res.ok) {
        setTrashList(trashList.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getCurrentTasks = () => {
    if (activeTab === "home") return taskList;
    if (activeTab === "archive") return archiveList;
    if (activeTab === "trash") return trashList;
    return [];
  };

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>
      <nav className="navbar">
        <div className="nav-left">
          <h2>
            {username ? `Hello, ${username.charAt(0).toUpperCase() + username.slice(1)}` : "Hello, User"}
          </h2>
          <button onClick={() => setActiveTab("home")}>Home</button>
          <button onClick={() => setActiveTab("archive")}>Archive</button>
          <button onClick={() => setActiveTab("trash")}>Trash</button>
        </div>
        <div className="nav-right">
          <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      {activeTab === "home" && (
        <div className="task-input">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button onClick={handleSubmit}>{isEditing ? "Update Task" : "Add Task"}</button>
        </div>
      )}

      <div className="task-list">
        {getCurrentTasks().length === 0 ? (
          <p className="no-tasks">
            {activeTab === "home" && "No tasks available. Add some tasks!"}
            {activeTab === "archive" && "No archived tasks."}
            {activeTab === "trash" && "Trash is empty."}
          </p>
        ) : (
          getCurrentTasks().map((task) => (
            <div className="task-card" key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <div className="task-actions">
                {activeTab === "home" && (
                  <>
                    <button onClick={() => updateTaskStatus(task.id, "archive")}>
                      <FaArchive />
                    </button>
                    <button onClick={() => editTask(task)}>
                      <FaEdit />
                    </button>
                    <button onClick={() => updateTaskStatus(task.id, "trash")}>
                      <FaTrash />
                    </button>
                  </>
                )}
                {activeTab === "trash" && (
                  <>
                    <button onClick={() => updateTaskStatus(task.id, "restore")}>
                      <FaTrashRestore />
                    </button>
                    <button onClick={() => permanentlyDelete(task.id)}>
                      <FaTimes />
                    </button>
                  </>
                )}
                {activeTab === "archive" && (
                  <>
                    <button onClick={() => updateTaskStatus(task.id, "unarchive")}>
                      <FaArrowLeft />
                    </button>
                    <button onClick={() => updateTaskStatus(task.id, "trash")}>
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
