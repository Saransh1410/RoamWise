import sys
import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Dynamically add all potential module search paths for Vercel Serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

for path in [current_dir, parent_dir, os.path.join(parent_dir, "backend")]:
    if os.path.exists(path) and path not in sys.path:
        sys.path.insert(0, path)

try:
    from app.main import app
except ImportError:
    from backend.app.main import app

class VercelPathMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Vercel sends the client's actual requested path in x-matched-path
        matched = request.headers.get("x-matched-path") or request.headers.get("x-vercel-matched-path")
        if matched and not matched.startswith("/api/index"):
            request.scope["path"] = matched
        elif request.scope.get("path", "").startswith("/api/index.py"):
            stripped = request.scope["path"].replace("/api/index.py", "", 1)
            request.scope["path"] = stripped if stripped else "/"
        return await call_next(request)

app.add_middleware(VercelPathMiddleware)

__all__ = ["app"]
