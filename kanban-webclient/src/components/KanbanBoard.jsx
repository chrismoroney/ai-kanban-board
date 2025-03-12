import { useState, useEffect } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import axios from "axios";
import Column from "./Column";

export default function KanbanBoard() {
  const initialColumns = {
    todo: { name: "To Do", tasks: [] },
    in_progress: { name: "In Progress", tasks: [] },
    done: { name: "Done", tasks: [] },
  };

  const [columns, setColumns] = useState(initialColumns);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "todo" });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/GetTasks", {
        withCredentials: true,
      });

      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };

        response.data.forEach((task) => {
          if (!updatedColumns[task.status]) return;
          if (!updatedColumns[task.status].tasks.some((t) => t.id === task.id)) {
            updatedColumns[task.status].tasks.push(task);
          }
        });

        return updatedColumns;
      });

    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // ✅ Task Creation Function
  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      console.warn("🚨 Missing title or description!");
      return;
    }
  
    console.log("🚀 Sending API request to create task:", newTask);
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/CreateTask", newTask, {
        withCredentials: true,
      });
  
      console.log("✅ Task created successfully:", response.data);
  
      const createdTask = { id: response.data.id, ...newTask };
  
      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };
  
        if (!updatedColumns[newTask.status]) {
          console.warn(`❌ Unknown status: ${newTask.status}, skipping task`, newTask);
          return prevColumns;
        }
  
        updatedColumns[newTask.status].tasks.push(createdTask);
        return updatedColumns;
      });
  
      setNewTask({ title: "", description: "", status: "todo" });
  
    } catch (error) {
      console.error("❌ Error creating task:", error.response ? error.response.data : error.message);
    }
  };
  
  const handleDeleteTask = (taskId) => {
    setColumns((prevColumns) => {
      const newColumns = { ...prevColumns };
      Object.keys(newColumns).forEach((column) => {
        newColumns[column].tasks = newColumns[column].tasks.filter(task => task.id !== taskId);
      });
      return newColumns;
    });
  };

  // ✅ Handle Drag and Drop Logic
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      console.warn("🚨 Drag Ended Outside Any Column");
      return;
    }

    const sourceColumnId = active.data.current?.columnId;
    const targetColumnId = over.id;
    const taskId = String(active.id);

    console.log("🎯 Drag Event:");
    console.log("Task ID:", taskId);
    console.log("Source Column:", sourceColumnId);
    console.log("Target Column:", targetColumnId);

    if (!sourceColumnId || !targetColumnId) {
      console.error("❌ Drag Error: Missing source or target column!");
      return;
    }

    setColumns((prevColumns) => {
      const updatedColumns = { ...prevColumns };

      if (!updatedColumns[sourceColumnId] || !updatedColumns[targetColumnId]) {
        console.error("❌ One or more columns not found in state.");
        return prevColumns;
      }

      console.log("🔍 Checking source column tasks:", updatedColumns[sourceColumnId].tasks);

      // ✅ Find the task in the source column
      const movedTask = updatedColumns[sourceColumnId].tasks.find(
        (task) => String(task.id) === taskId
      );

      if (!movedTask) {
        console.error("❌ Moved task not found in source column!", taskId);
        return prevColumns;
      }

      // ✅ Remove task from source column
      updatedColumns[sourceColumnId].tasks = updatedColumns[sourceColumnId].tasks.filter(
        (task) => String(task.id) !== taskId
      );

      // ✅ Update task status and move to target column
      movedTask.status = targetColumnId;
      updatedColumns[targetColumnId].tasks.push(movedTask);

      console.log("✅ Task moved successfully!", movedTask);
      return updatedColumns;
    });

    // ✅ Update task status in FastAPI database
    try {
      await axios.put(`http://127.0.0.1:8000/UpdateTask/${taskId}`, {
        status: targetColumnId,
      });
      console.log("✅ Task updated successfully in database!");
    } catch (error) {
      console.error("❌ Error updating task:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Kanban Board</h2>

      {/* ✅ Task Creation Form */}
      <div className="row mb-4">
        <div className="col-md-3">
          <input 
            type="text" 
            placeholder="Task Title" 
            value={newTask.title} 
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="form-control"
          />
        </div>
        <div className="col-md-3">
          <input 
            type="text" 
            placeholder="Task Description" 
            value={newTask.description} 
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="form-control"
          />
        </div>
        <div className="col-md-2">
          <select 
            value={newTask.status} 
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            className="form-select"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="col-md-2">
          <button onClick={createTask} className="btn btn-primary w-100">
            Add Task
          </button>
        </div>
      </div>

      {/* ✅ Drag-and-Drop Context */}
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="row">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="col-md-4">
              <Column columnId={columnId} column={column} onDelete={handleDeleteTask} />
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
