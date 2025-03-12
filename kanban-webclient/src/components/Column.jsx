import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

export default function Column({ columnId, column, onDelete }) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div ref={setNodeRef} className="card shadow-sm p-3">
      <h3 className="card-title text-center">{column.name}</h3>
      <div className="card-body">
        {column.tasks.length === 0 ? (
          <p className="text-muted text-center">No tasks</p>
        ) : (
          column.tasks.map(task => (
            <TaskCard key={task.id} task={task} columnId={columnId} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
