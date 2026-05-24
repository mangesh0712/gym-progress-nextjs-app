from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.workout import WorkoutSessionCreate
from auth.middleware import get_current_user_id
from db.supabase_client import get_db

router = APIRouter(prefix="/workouts", tags=["workouts"])


@router.get("/sessions", response_model=list, status_code=status.HTTP_200_OK)
async def get_workout_sessions(
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db),
):
    """Get all workout sessions for the current user with exercises."""
    try:
        sessions = db.get_sessions_with_exercises(user_id)
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sessions: {str(e)}",
        )


@router.post("/sessions", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_workout_session(
    session_data: WorkoutSessionCreate,
    user_id: str = Depends(get_current_user_id),
    db = Depends(get_db),
):
    """Save a complete workout session with all exercises."""
    try:
        # Create workout session
        session_response = db.client.table("workout_sessions").insert({
            "user_id": user_id,
            "muscle_group": session_data.muscle_group,
        }).execute()

        if not session_response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create workout session",
            )

        session_id = session_response.data[0]["id"]

        # Insert all exercises
        exercises_to_insert = [
            {
                "session_id": session_id,
                "exercise_name": exercise.exercise_name,
                "sets": [{"kg": s.kg, "reps": s.reps} for s in exercise.sets],
            }
            for exercise in session_data.exercises
        ]

        if exercises_to_insert:
            db.client.table("workout_exercises").insert(exercises_to_insert).execute()

        return {
            "id": session_id,
            "message": "Workout session saved successfully",
            "exercises_count": len(session_data.exercises),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save workout session: {str(e)}",
        )
