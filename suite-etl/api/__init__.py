"""
API package for blockchain analytics.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.core import router as core_router
from api.routes.wallet import router as wallet_router
from api.routes.contract import router as contract_router
from api.routes.etl import router as etl_router
from utils.aws_config import initialize_catalog
from utils.logging_config import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the Iceberg catalog on startup
    logger.info("Initializing Iceberg catalog...")
    catalog = initialize_catalog(
        os.getenv("ICEBERG_CATALOG", "s3tablescatalog"),
        os.getenv("ICEBERG_BUCKET", "suite"),
        os.getenv("AWS_REGION", "ap-southeast-1"),
    )
    if catalog:
        logger.info("Iceberg catalog initialized successfully")
        app.state.catalog = catalog
    else:
        logger.error("Failed to initialize Iceberg catalog")
        app.state.catalog = None

    yield

    # Cleanup on shutdown if needed
    logger.info("Shutting down API...")


def create_app():
    """
    Create and configure the FastAPI application.

    Returns:
        FastAPI: The configured FastAPI application
    """
    app = FastAPI(
        title="Suite Analytics API",
        description="API for analyzing blockchain transaction data",
        version="1.0.0",
        lifespan=lifespan,
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
    app.include_router(etl_router)

    # Root endpoint
    @app.get("/")
    async def read_root():
        return {"status": "ok", "message": "Blockchain Analytics API is running"}

    return app
