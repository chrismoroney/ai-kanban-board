from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.tasks import router as task_router

app = FastAPI()

# ✅ Allow only your frontend (replace with your actual frontend URL)
origins = [
    "http://localhost:5173",  # Vite Dev Server
    "http://127.0.0.1:5173"   # Alternative if localhost doesn't work
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ✅ Replace "*" with allowed frontend URLs
    allow_credentials=True,  # ✅ Required for `withCredentials: true`
    allow_methods=["*"],  # ✅ Allow all HTTP methods
    allow_headers=["*"],  # ✅ Allow all headers
)

app.include_router(task_router)

@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}
