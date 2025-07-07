"""
Celery application entry point.

This module serves as the main entry point for Celery workers and should be
placed at the root level of the project for proper module discovery.
"""

import os
import sys

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import from our local celery_tasks module
from celery_tasks.app import app as celery_app

# Make the app available for Celery CLI
app = celery_app

if __name__ == "__main__":
    celery_app.start()
