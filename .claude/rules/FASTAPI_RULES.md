# Python FastAPI Development Rules & Best Practices

## Project Structure
```
backend/
├── main.py                 # App entry point
├── requirements.txt        # Dependencies
├── .env.example            # Environment variables template
├── routers/                # Endpoint modules
│   ├── __init__.py
│   ├── splits.py          # Split CRUD endpoints
│   ├── sessions.py        # Workout session endpoints
│   ├── exercises.py       # Exercise logging endpoints
│   ├── progress.py        # Progress/analytics endpoints
│   └── library.py         # Exercise library endpoints
├── models/                 # Pydantic models (request/response)
│   ├── __init__.py
│   ├── split.py
│   ├── session.py
│   ├── exercise.py
│   └── exercise_library.py
├── db/                     # Database utilities
│   ├── __init__.py
│   └── supabase_client.py
├── auth/                   # Authentication utilities
│   ├── __init__.py
│   └── middleware.py       # JWT validation
├── schemas/                # Database table schemas
│   └── init_db.py
└── tests/                  # Unit and integration tests
    ├── __init__.py
    ├── test_splits.py
    ├── test_sessions.py
    └── test_exercises.py
```

## File Naming Conventions
- **Snake case** for all filenames and directories
- **Routers**: feature-based (e.g., `splits.py`, `sessions.py`)
- **Models**: Pydantic models only, plural if representing lists
- **Database functions**: `db/supabase_client.py` for all DB operations
- **Constants file**: `constants.py` for app-wide constants
- **Config file**: `config.py` for environment variables

## Python Conventions
- **Python 3.9+** minimum
- **Type hints everywhere** — no untyped functions
- **Docstrings** on public functions/classes (Google style)
- **Black formatter** for code style
- **Flake8** for linting (ignore line length in config)
- **PEP 8** compliant code

Example:
```python
def calculate_progress(exercise_id: str, user_id: str) -> dict:
    """
    Calculate progress metrics for an exercise.
    
    Args:
        exercise_id: UUID of the exercise
        user_id: UUID of the user
        
    Returns:
        dict with keys: max_weight, avg_weight, total_volume, trend
    """
    # implementation
```

## FastAPI Routes
- **Router-based organization** — one router per domain
- **Prefix per router** — all workout routes under `/workouts`, etc.
- **Proper HTTP methods** — GET (read), POST (create), PUT (update), DELETE (delete)
- **Status codes** — 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- **Consistent response format** — always return JSON with structure

Example:
```python
# routers/splits.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.split import SplitCreate, SplitResponse

router = APIRouter(prefix="/splits", tags=["splits"])

@router.post("/", response_model=SplitResponse, status_code=status.HTTP_201_CREATED)
async def create_split(split: SplitCreate, user_id: str = Depends(get_current_user_id)):
    """Create a new workout split."""
    # implementation
    
@router.get("/", response_model=List[SplitResponse])
async def list_splits(user_id: str = Depends(get_current_user_id)):
    """List all splits for the user."""
    # implementation
```

## Pydantic Models
- **Request models**: Named with `Create` or `Update` suffix
- **Response models**: Named with `Response` suffix
- **Field validation** — use `Field()` with constraints
- **Optional fields** — explicitly mark as `Optional[Type]`
- **Config class** — set `orm_mode = True` for ORM compatibility
- **Avoid overfitting** — models should match API contracts, not DB schema exactly

Example:
```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class SplitDayCreate(BaseModel):
    day_number: int = Field(..., ge=1, le=7)  # 1-7
    label: str = Field(..., min_length=1, max_length=100)
    muscle_groups: List[str]

class SplitResponse(BaseModel):
    id: str
    name: str
    days: List[dict]
    
    class Config:
        orm_mode = True
```

## Database (Supabase) Rules
- **Always use parameterized queries** — never string interpolation
- **All DB calls in `db/supabase_client.py`** — router functions call these
- **Connection pooling** — reuse Supabase client across requests
- **Row Level Security (RLS)** — enforce at database level, not application
- **Transaction support** — use for multi-table writes
- **Error handling** — catch and log DB errors, return meaningful HTTP errors

Example:
```python
# db/supabase_client.py
from supabase import create_client
from typing import List, Optional

class SupabaseDB:
    def __init__(self, url: str, key: str):
        self.client = create_client(url, key)
    
    async def get_user_workouts(self, user_id: str) -> List[dict]:
        """Fetch all workouts for a user."""
        response = self.client.table("workout_sessions").select("*").eq("user_id", user_id).execute()
        return response.data
    
    async def log_exercise(self, session_id: str, exercise_id: str, sets: dict) -> dict:
        """Log exercises in a workout session."""
        response = self.client.table("workout_exercises").insert({
            "session_id": session_id,
            "exercise_id": exercise_id,
            "sets": sets,
        }).execute()
        return response.data[0]
```

## Authentication & Security
- **JWT validation middleware** — all protected routes use `Depends(get_current_user_id)`
- **Verify token with Supabase** — don't trust unvalidated tokens
- **Extract user_id from token** — pass to all database queries
- **Rate limiting** — implement per user/IP to prevent abuse
- **CORS configuration** — allow only your frontend domain
- **HTTPS enforcement** — only in production
- **No passwords in logs** — sanitize sensitive data

Example:
```python
# auth/middleware.py
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer
import jwt
from config import SUPABASE_URL, SUPABASE_KEY

security = HTTPBearer()

async def get_current_user_id(credentials = Depends(security)) -> str:
    """Extract and validate user_id from JWT token."""
    token = credentials.credentials
    try:
        # Verify token with Supabase public key
        decoded = jwt.decode(token, options={"verify_signature": False})
        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return user_id
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
```

## Error Handling
- **Catch exceptions explicitly** — don't catch all with `except:`
- **Log all errors** — use structured logging with timestamps
- **Return meaningful error messages** — help client understand what went wrong
- **HTTP status codes** — reflect the actual error
- **Never expose DB/internal errors** to client

Example:
```python
from fastapi import HTTPException, status
from typing import Optional

@router.post("/sessions")
async def create_session(session: SessionCreate, user_id: str = Depends(get_current_user_id)):
    try:
        # Check if split_day_id exists and belongs to user
        split_day = await db.verify_split_day_ownership(session.split_day_id, user_id)
        if not split_day:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Split day not found"
            )
        
        # Create session
        result = await db.create_session(user_id, session)
        return result
    
    except Exception as e:
        logger.error(f"Failed to create session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session"
        )
```

## Logging
- **Structured logging** — use `logging` module with formatters
- **Log levels** — DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Always log request/response** for debugging
- **Never log passwords or tokens** in logs
- **Timestamp all logs** — helps with debugging issues

Example:
```python
import logging
from logging.handlers import RotatingFileHandler

logger = logging.getLogger(__name__)

@router.get("/sessions")
async def get_sessions(user_id: str = Depends(get_current_user_id)):
    logger.info(f"Fetching sessions for user: {user_id}")
    try:
        sessions = await db.get_user_sessions(user_id)
        logger.info(f"Found {len(sessions)} sessions for user {user_id}")
        return sessions
    except Exception as e:
        logger.error(f"Error fetching sessions for user {user_id}: {str(e)}", exc_info=True)
        raise
```

## Testing Rules
- **Unit tests** for utility functions
- **Integration tests** for API endpoints
- **Mock Supabase client** for isolated testing
- **Fixtures** for common test data
- **Minimum 80% coverage** for critical paths
- **Test both happy path and error cases**
- Use `pytest` and `pytest-asyncio`

Example:
```python
# tests/test_sessions.py
import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch

client = TestClient(app)

@pytest.fixture
def mock_user_id():
    return "user-123"

@pytest.fixture
def mock_split_day():
    return {"id": "day-123", "label": "Day 1 - Chest", "muscle_groups": ["chest"]}

@pytest.mark.asyncio
async def test_create_session(mock_user_id, mock_split_day):
    with patch("db.supabase_client.SupabaseDB.verify_split_day_ownership") as mock_verify:
        mock_verify.return_value = mock_split_day
        
        response = client.post(
            "/sessions",
            json={"split_day_id": "day-123", "notes": "good session"},
            headers={"Authorization": f"Bearer {mock_user_id}"}
        )
        
        assert response.status_code == 201
        assert response.json()["split_day_id"] == "day-123"
```

## Environment & Configuration
- **`.env` file** — never commit to git
- **`.env.example`** — commit this with all required keys (no values)
- **Use `python-dotenv`** to load environment variables
- **Type-safe config** — use Pydantic for config validation

Example (`.env.example`):
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
ENVIRONMENT=development
LOG_LEVEL=INFO
```

## Dependencies
```
fastapi==0.104.1
uvicorn==0.24.0
python-dotenv==1.0.0
supabase==2.3.5
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose==3.3.0
PyJWT==2.8.1
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.12.0
flake8==6.1.0
```

## Code Quality Rules
- **DRY principle** — extract repeated code into functions
- **Single Responsibility** — each function does one thing
- **Clear naming** — variable/function names should be self-explanatory
- **No magic numbers** — use named constants
- **Immutable where possible** — use `tuple` instead of `list` for fixed data
- **Early returns** — reduce nesting and improve readability

## Git Conventions
- **Branch naming**: `feature/phone-auth`, `fix/progress-calculation`, `refactor/db-layer`
- **Commit messages**: `feat: add phone OTP login`, `fix: handle concurrent requests`
- **PR descriptions**: explain the why, link to issues if applicable

## Deployment Rules
- **No hardcoded URLs** — use environment variables
- **Health check endpoint** — `/health` returns 200 when ready
- **Graceful shutdown** — handle SIGTERM properly
- **Database migrations** — run before deployment
- **Secret management** — use Render environment variables, never in code

Example:
```python
# main.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import asyncio

app = FastAPI(title="Gym Tracker API")

@app.get("/health")
async def health_check():
    return JSONResponse({"status": "healthy"}, status_code=200)

@app.on_event("shutdown")
async def shutdown():
    """Graceful shutdown."""
    await db.close()
```

## Common Pitfalls to Avoid
- ❌ Using `list()` default arguments (mutable defaults are shared)
- ❌ Not validating input with Pydantic
- ❌ Missing type hints on function parameters
- ❌ Catching all exceptions with bare `except:`
- ❌ Database queries inside loops (N+1 problem)
- ❌ Not handling async/await properly
- ❌ Returning raw DB objects instead of response models
- ❌ Missing error handling on external API calls
- ❌ Hardcoding config values in code
- ❌ Not testing error cases

## Useful Resources
- [FastAPI Official Docs](https://fastapi.tiangolo.com/)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [Supabase Python Client](https://github.com/supabase/supabase-py)
- [pytest Documentation](https://docs.pytest.org/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)
