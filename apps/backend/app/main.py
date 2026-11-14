from fastapi import FastAPI
from app.routes import health

app = FastAPI(
    title="Math Utils",
    description="Backend API para Math Utils",
    docs_url=None,
    redoc_url=None,
    openapi_url=None
    )

app.include_router(health.router, prefix="/api", tags=["Health"])
