import azure.functions as func
import json
import logging

app = func.FunctionApp()

@app.route(route="GetTasks", auth_level=func.AuthLevel.ANONYMOUS)
def GetTasks(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Python HTTP trigger function processed a request.")

    tasks = [
        {"id": "1", "title": "Fix Login Bug", "description": "Investigate OAuth issues", "status": "todo"},
        {"id": "2", "title": "Improve UI", "description": "Redesign dashboard", "status": "inProgress"},
        {"id": "3", "title": "Deploy to AWS", "description": "Finalize infrastructure setup", "status": "done"},
    ]

    response = func.HttpResponse(
        json.dumps(tasks),
        mimetype="application/json",
        status_code=200
    )
    
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"

    return response
