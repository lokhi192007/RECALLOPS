from database import initialize_database
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.incidents import router as incident_router


app = FastAPI(
    title="RECALLOPS API",
    description="AI-powered Production Incident Intelligence System",
    version="1.0.0"
)
initialize_database()


# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register incident routes
app.include_router(incident_router)


@app.get("/")
def home():
    return {
        "project": "RECALLOPS",
        "message": "AI Incident Intelligence Backend is running",
        "status": "Online"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }