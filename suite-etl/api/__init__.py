"""
API package for blockchain analytics.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.core import router as core_router
from api.routes.wallet import router as wallet_router
from api.routes.contract import router as contract_router


def create_app():
    """
    Create and configure the FastAPI application.

    Returns:
        FastAPI: The configured FastAPI application
    """
    app = FastAPI(
        title="Blockchain Analytics API",
        description="API for analyzing blockchain transaction data",
        version="1.0.0",
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add routes
    app.include_router(core_router)
    app.include_router(wallet_router)
    app.include_router(contract_router)

    # Root endpoint
    @app.get("/")
    async def read_root():
        return {"status": "ok", "message": "Blockchain Analytics API is running"}

    return app
