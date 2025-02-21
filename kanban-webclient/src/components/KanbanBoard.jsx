import { useState, useEffect } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import axios from "axios";
import Column from "./Column";

export default function KanbanBoard() {
  const initialColumns = {
    todo: { name: "To Do", tasks: [] },
    inProgress: { name: "In Progress", tasks: [] },
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

  // ✅ Create a new task
  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) return;

    try {
      const response = await axios.post("http://127.0.0.1:8000/CreateTask", newTask);
      const createdTask = { id: response.data.id, ...newTask };

      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };
        updatedColumns[newTask.status].tasks.push(createdTask);
        return updatedColumns;
      });

      setNewTask({ title: "", description: "", status: "todo" });

    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // ✅ Handle drag-and-drop logic
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const sourceColumnId = active.data.current?.columnId;
    const targetColumnId = over.id;

    if (sourceColumnId === targetColumnId) return;

    const taskId = active.id;

    setColumns((prevColumns) => {
      const updatedColumns = { ...prevColumns };

      // Remove task from source column
      updatedColumns[sourceColumnId].tasks = updatedColumns[sourceColumnId].tasks.filter(
        (task) => task.id !== taskId
      );

      // Find the dragged task
      const movedTask = columns[sourceColumnId].tasks.find((task) => task.id === taskId);
      if (movedTask) {
        movedTask.status = targetColumnId; // Update status
        updatedColumns[targetColumnId].tasks.push(movedTask);
      }

      return updatedColumns;
    });

    // ✅ Update task status in FastAPI database
    try {
      await axios.put(`http://127.0.0.1:8000/UpdateTask/${taskId}`, {
        status: targetColumnId,
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div>
      {/* ✅ Task Creation Form */}
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
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button onClick={createTask} className="bg-blue-500 text-white p-2 rounded">
          Add Task
        </button>
      </div>

      {/* ✅ Drag-and-Drop Context */}
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
