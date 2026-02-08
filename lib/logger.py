"""Structured logging configuration.

Provides consistent logging across all modules.
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional


class StructuredLogger:
    def __init__(self, name: str = "sovereign-rag", log_level: Optional[str] = None):
        self.name = name
        self.log_level = log_level or os.getenv("LOG_LEVEL", "INFO")
        self.logger = self._setup_logger()
    
    def _setup_logger(self) -> logging.Logger:
        logger = logging.getLogger(self.name)
        logger.setLevel(self.log_level.upper())
        
        if logger.hasHandlers():
            logger.handlers.clear()
        
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        log_dir = Path(os.getenv("LOCAL_DATA_DIR", "C:\\BUENATURA")) / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        
        log_file = log_dir / f"rag-{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        return logger
    
    def debug(self, message: str, **kwargs):
        extra = f" | {kwargs}" if kwargs else ""
        self.logger.debug(f"{message}{extra}")
    
    def info(self, message: str, **kwargs):
        extra = f" | {kwargs}" if kwargs else ""
        self.logger.info(f"{message}{extra}")
    
    def warning(self, message: str, **kwargs):
        extra = f" | {kwargs}" if kwargs else ""
        self.logger.warning(f"{message}{extra}")
    
    def error(self, message: str, **kwargs):
        extra = f" | {kwargs}" if kwargs else ""
        self.logger.error(f"{message}{extra}")
    
    def critical(self, message: str, **kwargs):
        extra = f" | {kwargs}" if kwargs else ""
        self.logger.critical(f"{message}{extra}")


_global_logger = None


def get_logger(name: Optional[str] = None) -> StructuredLogger:
    global _global_logger
    if _global_logger is None:
        _global_logger = StructuredLogger(name or "sovereign-rag")
    return _global_logger
