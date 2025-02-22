from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from models import TaskCreate
from database import get_db_connection
import logging

# Create API router for task endpoints
router = APIRouter()

@router.get("/GetTasks")
async def get_tasks():
    """Fetch all tasks from the database."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, description, status FROM tasks;")
        tasks = [
            {
                "id": str(row[0]),  # ✅ Convert ID to string
                "title": row[1],
                "description": row[2],
                "status": "in_progress" if row[3] == "in_progress" else 
                          "todo" if row[3] == "pending" else 
                          "done" if row[3] == "completed" else row[3]
            }
            for row in cur.fetchall()
        ]

        cur.close()
        conn.close()

        return JSONResponse(content=tasks, status_code=200)

    except Exception as e:
        logging.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")



@router.post("/CreateTask")
async def create_task(task: TaskCreate):
    """Insert a new task into the database."""
    try:

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO tasks (title, description, status) VALUES (%s, %s, %s) RETURNING id",
            (task.title, task.description, task.status),
        )
        task_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()

        print(f"✅ Task inserted successfully with ID: {task_id}")
        return {"id": task_id, "message": "Task created successfully"}

    except Exception as e:
        import traceback
        error_message = traceback.format_exc()
        logging.error(f"❌ Database error: {error_message}")
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")


@router.put("/UpdateTask/{task_id}")
async def update_task(task_id: int, task_data: dict):
    """Update the status of a task."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE tasks SET status = %s WHERE id = %s RETURNING id", 
                    (task_data["status"], task_id))
        updated_id = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()

        if updated_id:
            return {"message": "Task updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Task not found")

    except Exception as e:
        logging.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update task")
