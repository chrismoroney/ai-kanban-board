import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import Column from "./Column";

export default function KanbanBoard() {
  // ✅ Static hardcoded task data
  const initialColumns = {
    todo: { name: "To Do", tasks: [{ id: "1", title: "Fix Login Bug", description: "Investigate OAuth issues" }] },
    inProgress: { name: "In Progress", tasks: [{ id: "2", title: "Improve UI", description: "Redesign dashboard" }] },
    done: { name: "Done", tasks: [{ id: "3", title: "Deploy to AWS", description: "Finalize infrastructure setup" }] },
  };

  const [columns, setColumns] = useState(initialColumns);

  // ✅ Handle drag and drop logic
  const onDragEnd = (event) => {
    if (!event.over) return;

    const { active, over } = event;
    if (active.id === over.id) return;

    setColumns((prevColumns) => {
        // Ensure both source and destination columns exist
        const sourceColumn = prevColumns[active.data.current?.status];
        const destColumn = prevColumns[over.id];
      
        if (!sourceColumn || !destColumn) return prevColumns; // ✅ Prevent undefined columns
      
        const sourceTasks = [...sourceColumn.tasks];
        const destTasks = [...destColumn.tasks];
      
        const movedTaskIndex = sourceTasks.findIndex((t) => t.id === active.id);
        if (movedTaskIndex === -1) return prevColumns; // ✅ Prevent crashing if task is missing
      
        const [movedTask] = sourceTasks.splice(movedTaskIndex, 1);
        movedTask.status = over.id;
        destTasks.push(movedTask);
      
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
