import sys
import os

# Dynamically add all potential module search paths for Vercel Serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

for path in [current_dir, parent_dir, os.path.join(parent_dir, "backend")]:
    if os.path.exists(path) and path not in sys.path:
        sys.path.insert(0, path)

try:
    from app.main import app
except ImportError:
    # If root is different on serverless container
    from backend.app.main import app

__all__ = ["app"]
