from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from auth.middleware import get_current_user_id
from db.supabase_client import get_db

router = APIRouter(prefix="/exercises", tags=["exercises"])


class ExerciseCreate(BaseModel):
    """Request model for creating an exercise."""
    name: str = Field(..., min_length=1, max_length=255)
    muscle_group: str = Field(..., min_length=1, max_length=100)


class ExerciseResponse(BaseModel):
    """Response model for exercises."""
    id: str
    name: str
    muscle_group: str
    created_at: str


@router.get("/{muscle_group}", response_model=List[ExerciseResponse], status_code=status.HTTP_200_OK)
async def get_exercises(
    muscle_group: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db),
):
    """Get all exercises for a specific muscle group."""
    try:
        exercises = db.get_exercises(muscle_group)
        return exercises
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch exercises: {str(e)}",
        )


@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise: ExerciseCreate,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db),
):
    """Add a new exercise to the exercise library."""
    try:
        new_exercise = db.create_exercise(exercise.name, exercise.muscle_group)
        return new_exercise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create exercise: {str(e)}",
        )


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(
    exercise_id: str,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db),
):
    """Delete an exercise from the exercise library."""
    try:
        db.delete_exercise(exercise_id)
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete exercise: {str(e)}",
        )
