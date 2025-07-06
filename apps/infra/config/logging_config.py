#!/usr/bin/env python3
"""
Logging Configuration

This module provides a centralized logging configuration for the application.
"""

import logging
import sys
import os
from datetime import datetime


def setup_logger(name, log_level=logging.INFO, log_to_file=False, log_dir="logs"):
    """
    Set up a logger with the specified configuration.

    Args:
        name: Logger name (usually __name__ of the calling module)
        log_level: Logging level (default: INFO)
        log_to_file: Whether to log to a file (default: False)
        log_dir: Directory to store log files (default: logs)

    Returns:
        logging.Logger: Configured logger
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(log_level)

    # Clear any existing handlers
    if logger.hasHandlers():
        logger.handlers.clear()

    # Create formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Create file handler if requested
    if log_to_file:
        # Create log directory if it doesn't exist
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        # Create log file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = os.path.join(log_dir, f"{name}_{timestamp}.log")

        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


# Default application logger
app_logger = setup_logger("app")


def get_logger(name, log_level=None, log_to_file=False):
    """
    Get a logger with the specified name and configuration.

    Args:
        name: Logger name
        log_level: Optional logging level override
        log_to_file: Whether to log to a file

    Returns:
        logging.Logger: Configured logger
    """
    logger = setup_logger(
        name, log_level=log_level or logging.INFO, log_to_file=log_to_file
    )
    return logger
