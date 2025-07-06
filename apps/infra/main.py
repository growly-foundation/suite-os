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
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

# Import the application factory
from api import create_app
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# Create the FastAPI application
app = create_app()
