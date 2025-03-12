import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import "../styles/TaskCard.css";
import axios from "axios";

export default function TaskCard({ task, columnId, onDelete }) {
  const [isDragging, setIsDragging] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging: dragging } = useDraggable({
    id: task.id,
    data: { columnId },
    onDragStart: () => setIsDragging(true),
    onDragEnd: () => setIsDragging(false),
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: dragging ? "none" : "transform 0.2s ease-in-out",
    zIndex: dragging ? 1050 : "auto",
    position: dragging ? "absolute" : "relative",
    width: "100%",
    pointerEvents: dragging ? "none" : "auto",
  };

  // ✅ Handle Delete Button Click
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/DeleteTask/${task.id}`);
      onDelete(task.id); // ✅ Update frontend after successful deletion
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style} className={`card mb-2 ${dragging ? "dragging" : ""}`}>
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title">{task.title}</h5>
          <p className="card-text">{task.description}</p>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>✖</button>
      </div>
    </div>
  );
}
