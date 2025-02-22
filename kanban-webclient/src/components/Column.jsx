import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

export default function Column({ columnId, column }) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div ref={setNodeRef} className="column">
      <h3>{column.name}</h3>
      {column.tasks.length === 0 ? <p>No tasks</p> : column.tasks.map(task => (
        <TaskCard key={task.id} task={task} columnId={columnId} />
      ))}
    </div>
  );
}
