import { useDraggable } from "@dnd-kit/core";

export default function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="mb-2 p-2 bg-white rounded-lg shadow"
    >
      <p className="text-md font-semibold">{task.title}</p>
      <p className="text-sm text-gray-500">{task.description}</p>
    </div>
  );
}
