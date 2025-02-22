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

  // ✅ Fetch tasks from FastAPI
  const fetchTasks = async () => {
    try {

      const response = await axios.get("http://127.0.0.1:8000/GetTasks", {
        withCredentials: true,
      });

      console.log("Fetched tasks:", response.data);

      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };

        response.data.forEach((task) => {
          console.log("Task received:", task);

          if (!updatedColumns[task.status]) {
            console.warn(`Unknown status: ${task.status}, skipping task`, task);
            return;
          }

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

  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      console.warn("Title or description is missing");
      return;
    }
  
    console.log("🚀 Sending API request to create task:", newTask); // ✅ Debugging log
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/CreateTask", newTask, {
        withCredentials: true,
      });
  
      console.log("✅ Task created successfully:", response.data);
  
      const createdTask = { id: response.data.id, ...newTask };
  
      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };
  
        if (!updatedColumns[newTask.status]) {
          console.warn(`Unknown status: ${newTask.status}, skipping task`, newTask);
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
  
      if (!updatedColumns[sourceColumnId]) {
        console.error(`❌ Source column '${sourceColumnId}' not found!`);
        return prevColumns;
      }
  
      if (!updatedColumns[targetColumnId]) {
        console.error(`❌ Target column '${targetColumnId}' not found!`);
        return prevColumns;
      }
  
      console.log("🔍 Checking source column for task:", updatedColumns[sourceColumnId].tasks);
      const movedTask = updatedColumns[sourceColumnId].tasks.find(
        (task) => String(task.id) === taskId // ✅ Convert both to strings for comparison
      );
  
      if (!movedTask) {
        console.error("❌ Moved task not found in source column!", taskId);
        console.log("🔍 Source column tasks:", updatedColumns[sourceColumnId].tasks);
        return prevColumns;
      }
  
      updatedColumns[sourceColumnId].tasks = updatedColumns[sourceColumnId].tasks.filter(
        (task) => String(task.id) !== taskId
      );
  
      movedTask.status = targetColumnId;
      updatedColumns[targetColumnId].tasks.push(movedTask);
  
      console.log("✅ Task moved successfully!", movedTask);
      return updatedColumns;
    });
  
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
    <div>
      <div className="p-4">
        <input 
          type="text" 
          placeholder="Task Title" 
          value={newTask.title} 
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="border p-2 rounded mr-2"
        />
        <input 
          type="text" 
          placeholder="Task Description" 
          value={newTask.description} 
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="border p-2 rounded mr-2"
        />
        <select 
          value={newTask.status} 
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          className="border p-2 rounded mr-2"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button onClick={createTask} className="bg-blue-500 text-white p-2 rounded">
          Add Task
        </button>
      </div>

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4 p-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <Column key={columnId} columnId={columnId} column={column} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
