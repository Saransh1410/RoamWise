import sys
import os

# Dynamically add all potential module search paths for Vercel Serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

for path in [current_dir, parent_dir, os.path.join(parent_dir, "backend")]:
    if os.path.exists(path) and path not in sys.path:
        sys.path.insert(0, path)

try:
    from app.main import app as fastapi_app
except ImportError:
    from backend.app.main import app as fastapi_app

class ASGIVercelPathMiddleware:
    """
    Raw ASGI middleware that runs before Starlette routing to normalize
    the rewritten /api/index.py/$1 path back to the client's actual route.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            path = scope.get("path", "")
            if path.startswith("/api/index.py"):
                stripped = path.replace("/api/index.py", "", 1)
                scope["path"] = stripped if stripped else "/"
            elif path.startswith("/api/index"):
                stripped = path.replace("/api/index", "", 1)
                scope["path"] = stripped if stripped else "/"
        await self.app(scope, receive, send)

# Export wrapped ASGI application for Vercel Serverless runtime
app = ASGIVercelPathMiddleware(fastapi_app)

__all__ = ["app"]
