import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_get_tasks():
    response = client.get("/GetTasks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_task():
    new_task = {"title": "Test Task", "description": "Test Description", "status": "todo"}
    response = client.post("/CreateTask", json=new_task)
    assert response.status_code == 200
    assert "id" in response.json()

def test_delete_task():
    new_task = {"title": "Task to Delete", "description": "Will be deleted", "status": "todo"}
    create_response = client.post("/CreateTask", json=new_task)
    task_id = create_response.json()["id"]

    delete_response = client.delete(f"/DeleteTask/{task_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == "Task deleted successfully"
