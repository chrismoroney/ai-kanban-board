import KanbanBoard from "./components/KanbanBoard";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold">AI Kanban Board</h1>
      <KanbanBoard />
    </div>
  );
}
