import { useState, useEffect } from "react";

const FREQUENCIES = [
  { label: "Daily", days: 1 },
  { label: "Every 2 days", days: 2 },
  { label: "Weekly", days: 7 },
  { label: "Biweekly", days: 14 },
  { label: "Monthly", days: 30 },
  { label: "Every 2 months", days: 60 },
  { label: "Every 3 months", days: 90 },
  { label: "Every 6 months", days: 180 },
  { label: "Yearly", days: 365 },
];

const DEFAULT_TASKS = [
  { id: 1, name: "Vacuum floors", frequency: 7, lastDone: null, category: "Cleaning" },
  { id: 2, name: "Clean bathrooms", frequency: 7, lastDone: null, category: "Cleaning" },
  { id: 3, name: "Change bedsheets", frequency: 14, lastDone: null, category: "Laundry" },
  { id: 4, name: "Clean fridge", frequency: 30, lastDone: null, category: "Kitchen" },
  { id: 5, name: "Change HVAC filter", frequency: 90, lastDone: null, category: "Maintenance" },
  { id: 6, name: "Test smoke detectors", frequency: 180, lastDone: null, category: "Safety" },
  { id: 7, name: "Annual car maintenance", frequency: 365, lastDone: null, category: "Car" }
];

const CATEGORIES = ["Cleaning", "Kitchen", "Laundry", "Maintenance", "Garden", "Safety", "Car", "Admin", "Other"];

const CATEGORY_ICONS = {
  Cleaning: "🧹", 
  Kitchen: "🍽️", 
  Laundry: "👕", 
  Maintenance: "🔧",
  Garden: "🌿", 
  Safety: "🛡️", 
  Car: "🚗",
  Admin: "💻",
  Other: "📋",
};

// ─── Storage helpers (swap these out when adding Firebase later) ──────────────
function loadTasks() {
  try {
    const stored = localStorage.getItem("chore_tasks");
    return stored ? JSON.parse(stored) : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem("chore_tasks", JSON.stringify(tasks));
  } catch {
    console.error("Failed to save tasks");
  }
}
// ─────────────────────────────────────────────────────────────────────────────

function getDaysUntilDue(task) {
  if (!task.lastDone) return 0;
  const last = new Date(task.lastDone);
  const due = new Date(last.getTime() + task.frequency * 86400000);
  const now = new Date();
  return Math.ceil((due - now) / 86400000);
}

function getStatus(task) {
  const days = getDaysUntilDue(task);
  if (!task.lastDone) return "overdue";
  if (days < 0) return "overdue";
  if (days === 0) return "due";
  if (days <= 3) return "soon";
  return "ok";
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newTask, setNewTask] = useState({ name: "", frequency: 7, category: "Cleaning" });
  const [justDone, setJustDone] = useState(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function markDone(id) {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, lastDone: new Date().toISOString() } : t
    ));
    setJustDone(id);
    setTimeout(() => setJustDone(null), 1500);
  }

  function addTask() {
    if (!newTask.name.trim()) return;
    setTasks(prev => [...prev, { ...newTask, id: Date.now(), lastDone: null }]);
    setNewTask({ name: "", frequency: 7, category: "Cleaning" });
    setShowAdd(false);
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const sorted = [...tasks].sort((a, b) => getDaysUntilDue(a) - getDaysUntilDue(b));
  const filtered = filter === "all" ? sorted : sorted.filter(t => getStatus(t) === filter);

  const counts = {
    overdue: tasks.filter(t => getStatus(t) === "overdue").length,
    due: tasks.filter(t => getStatus(t) === "due").length,
    soon: tasks.filter(t => getStatus(t) === "soon").length,
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#faf9f7", fontFamily: "'Georgia', serif",
      padding: "0", color: "#1a1a1a"
    }}>
      {/* Header */}
      <div style={{
        background: "#1c2b1e", color: "#e8e2d4", padding: "28px 32px 24px",
        borderBottom: "3px solid #3d6b42"
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#7ab87e", marginBottom: 6 }}>Home Management</div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: "normal", letterSpacing: -0.5 }}>lil Task List</h1>
            </div>
            <button onClick={() => setShowAdd(true)} style={{
              background: "#3d6b42", color: "#e8e2d4", border: "none", borderRadius: 6,
              padding: "10px 18px", cursor: "pointer", fontSize: 14, letterSpacing: 0.5,
              display: "flex", alignItems: "center", gap: 6, marginTop: 4
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Task
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            {counts.overdue > 0 && (
              <div style={{ background: "#7a2020", color: "#ffd4d4", borderRadius: 20, padding: "4px 14px", fontSize: 13 }}>
                {counts.overdue} overdue
              </div>
            )}
            {counts.due > 0 && (
              <div style={{ background: "#7a5a10", color: "#ffeab0", borderRadius: 20, padding: "4px 14px", fontSize: 13 }}>
                {counts.due} due today
              </div>
            )}
            {counts.soon > 0 && (
              <div style={{ background: "#2a4a2e", color: "#b0dab4", borderRadius: 20, padding: "4px 14px", fontSize: 13 }}>
                {counts.soon} coming soon
              </div>
            )}
            {counts.overdue === 0 && counts.due === 0 && (
              <div style={{ color: "#7ab87e", fontSize: 13 }}>✓ All caught up</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #ddd", flexWrap: "wrap" }}>
          {[["all", "All"], ["overdue", "Overdue"], ["due", "Due Today"], ["soon", "Coming Soon"], ["ok", "On Track"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              background: "none", border: "none", padding: "8px 14px", cursor: "pointer",
              fontSize: 13, color: filter === val ? "#1c2b1e" : "#888",
              borderBottom: filter === val ? "2px solid #1c2b1e" : "2px solid transparent",
              marginBottom: -1, fontFamily: "inherit"
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "#aaa", padding: "40px 0", fontSize: 15 }}>
              No tasks here
            </div>
          )}
          {filtered.map(task => {
            const status = getStatus(task);
            const days = getDaysUntilDue(task);
            const isDone = justDone === task.id;

            const statusColors = {
              overdue: { bg: "#fff5f5", border: "#f0a0a0", badge: "#c0392b", badgeTxt: "#fff" },
              due:     { bg: "#fffbf0", border: "#f0d080", badge: "#c08000", badgeTxt: "#fff" },
              soon:    { bg: "#f5fbf5", border: "#a0d0a8", badge: "#2e7d32", badgeTxt: "#fff" },
              ok:      { bg: "#fff",    border: "#e4e0d8", badge: "#888",    badgeTxt: "#fff" },
            };
            const sc = statusColors[status];

            const dueLabel = !task.lastDone ? "Never done" :
              status === "overdue" ? `${Math.abs(days)}d overdue` :
              status === "due"     ? "Due today" :
              `In ${days}d`;

            return (
              <div key={task.id} style={{
                background: isDone ? "#f0fff4" : sc.bg,
                border: `1px solid ${isDone ? "#6dbf7e" : sc.border}`,
                borderRadius: 10, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 14,
                transition: "all 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{CATEGORY_ICONS[task.category] || "📋"}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "600", fontSize: 15, marginBottom: 3 }}>{task.name}</div>
                  <div style={{ fontSize: 12, color: "#888", display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>{task.category}</span>
                    <span>·</span>
                    <span>Every {FREQUENCIES.find(f => f.days === task.frequency)?.label?.toLowerCase().replace("every ", "") || `${task.frequency}d`}</span>
                    {task.lastDone && <><span>·</span><span>Last: {new Date(task.lastDone).toLocaleDateString()}</span></>}
                  </div>
                </div>

                <div style={{
                  background: isDone ? "#2e7d32" : sc.badge, color: isDone ? "#fff" : sc.badgeTxt,
                  borderRadius: 6, padding: "3px 10px", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0
                }}>
                  {isDone ? "✓ Done!" : dueLabel}
                </div>

                <button onClick={() => markDone(task.id)} disabled={isDone} style={{
                  background: isDone ? "#c8e6c9" : "#1c2b1e", color: isDone ? "#4caf50" : "#e8e2d4",
                  border: "none", borderRadius: 6, padding: "8px 14px", cursor: isDone ? "default" : "pointer",
                  fontSize: 13, flexShrink: 0, fontFamily: "inherit"
                }}>
                  {isDone ? "✓" : "Done"}
                </button>

                <button onClick={() => deleteTask(task.id)} style={{
                  background: "none", border: "none", color: "#ccc", cursor: "pointer",
                  fontSize: 16, padding: "4px", flexShrink: 0, lineHeight: 1
                }} title="Delete">×</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16, zIndex: 100
        }} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{
            background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 420,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
          }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: "normal" }}>New Task</h2>

            <label style={{ display: "block", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Task Name</div>
              <input
                autoFocus
                value={newTask.name}
                onChange={e => setNewTask(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addTask()}
                placeholder="e.g. Mop kitchen floor"
                style={{
                  width: "100%", padding: "10px 12px", border: "1px solid #ddd",
                  borderRadius: 7, fontSize: 15, fontFamily: "inherit", boxSizing: "border-box"
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Frequency</div>
              <select
                value={newTask.frequency}
                onChange={e => setNewTask(p => ({ ...p, frequency: Number(e.target.value) }))}
                style={{
                  width: "100%", padding: "10px 12px", border: "1px solid #ddd",
                  borderRadius: 7, fontSize: 15, fontFamily: "inherit", background: "#fff"
                }}
              >
                {FREQUENCIES.map(f => (
                  <option key={f.days} value={f.days}>{f.label}</option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>Category</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setNewTask(p => ({ ...p, category: cat }))} style={{
                    background: newTask.category === cat ? "#1c2b1e" : "#f4f2ee",
                    color: newTask.category === cat ? "#e8e2d4" : "#444",
                    border: "none", borderRadius: 20, padding: "6px 14px",
                    cursor: "pointer", fontSize: 13, fontFamily: "inherit"
                  }}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAdd(false)} style={{
                flex: 1, padding: "11px", background: "#f4f2ee", border: "none",
                borderRadius: 8, cursor: "pointer", fontSize: 15, fontFamily: "inherit"
              }}>Cancel</button>
              <button onClick={addTask} disabled={!newTask.name.trim()} style={{
                flex: 2, padding: "11px", background: newTask.name.trim() ? "#1c2b1e" : "#ccc",
                color: "#e8e2d4", border: "none", borderRadius: 8,
                cursor: newTask.name.trim() ? "pointer" : "default",
                fontSize: 15, fontFamily: "inherit"
              }}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
