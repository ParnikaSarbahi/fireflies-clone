from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import models
from app.routers.action_items import router as action_items_router
from app.routers.meetings import router as meetings_router
from app.routers.transcripts import router as transcripts_router
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_if_empty()
    yield


app = FastAPI(
    title="Fireflies Clone API",
    version="1.0.0",
    lifespan=lifespan,
)


Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(meetings_router)
app.include_router(action_items_router)
app.include_router(transcripts_router)


@app.get("/")
def root():
    return {
        "message": "Fireflies Clone API"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }