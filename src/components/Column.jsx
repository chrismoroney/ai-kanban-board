import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

export default function Column({ columnId, column }) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-2">{column.name}</h2>
      {column?.tasks?.length > 0 ? (
        column.tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
        <p className="text-gray-400">No tasks</p> // ✅ Prevents undefined errors
        )}

    </div>
  );
}
