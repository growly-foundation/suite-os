#!/usr/bin/env python3
"""
Blockchain Analytics API

Main entry point for the FastAPI application.
"""

import sys
from pathlib import Path

# Add the project root directory to the Python path
# This ensures that all modules can be imported regardless of how the script is run
current_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(current_dir))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the application factory
from api import create_app

# Create the FastAPI application
app = create_app()
