import { useDraggable } from "@dnd-kit/core";

export default function TaskCard({ task, columnId }) {
  if (!columnId) {
    console.error("❌ Error: TaskCard is missing columnId!", task);
  }

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { columnId }, // ✅ Ensure columnId is correctly passed
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="task-card">
      <h4>{task.title}</h4>
      <p>{task.description}</p>
    </div>
  );
}
