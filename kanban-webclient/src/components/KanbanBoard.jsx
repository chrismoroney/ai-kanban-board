import { useState, useEffect } from "react";
import { DndContext } from "@dnd-kit/core";
import axios from "axios"; // ✅ Import axios
import Column from "./Column";

export default function KanbanBoard() {
  // ✅ Initial column setup
  const initialColumns = {
    todo: { name: "To Do", tasks: [] },
    inProgress: { name: "In Progress", tasks: [] },
    done: { name: "Done", tasks: [] },
  };

  const [columns, setColumns] = useState(initialColumns);

  // ✅ Fetch tasks when the component loads
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:7071/api/GetTasks");
      console.log("Fetched tasks:", response.data);
  
      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };
  
        response.data.forEach((task) => {
          // ✅ Check if task already exists before adding
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

  const onDragEnd = (event) => {
    if (!event.over) return;
  
    const { active, over } = event;
    if (active.id === over.id) return;
  
    setColumns((prevColumns) => {
      const sourceColumn = prevColumns[active.data.current?.status];
      const destColumn = prevColumns[over.id];
  
      if (!sourceColumn || !destColumn) return prevColumns; // ✅ Prevents undefined errors
  
      const sourceTasks = [...sourceColumn.tasks];
      const destTasks = [...destColumn.tasks];
  
      const movedTaskIndex = sourceTasks.findIndex((t) => t.id === active.id);
      if (movedTaskIndex === -1) return prevColumns; // ✅ Prevents invalid moves
  
      const [movedTask] = sourceTasks.splice(movedTaskIndex, 1);
      movedTask.status = over.id;
  
      // ✅ Check if the task already exists in the destination before adding
      if (!destTasks.some((t) => t.id === movedTask.id)) {
        destTasks.push(movedTask);
      }
  
      return {
        ...prevColumns,
        [active.data.current.status]: { ...sourceColumn, tasks: sourceTasks },
        [over.id]: { ...destColumn, tasks: destTasks },
      };
    });
  };
  

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4 p-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <Column key={columnId} columnId={columnId} column={column} />
        ))}
      </div>
    </DndContext>
  );
}
