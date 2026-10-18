"""Portable private workspace for the historical comparison tools."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def work_root():
    """An explicit override is relative to the checkout, never its parent folder."""
    path = Path(os.environ.get('GPTCAR_WORK_DIR', 'work/replication')).expanduser()
    return (path if path.is_absolute() else ROOT / path).resolve()

WORK_ROOT = work_root()
