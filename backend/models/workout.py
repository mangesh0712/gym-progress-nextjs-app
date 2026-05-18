from pydantic import BaseModel
from typing import List
from datetime import datetime


class SetData(BaseModel):
    kg: str
    reps: str


class ExerciseData(BaseModel):
    exercise_name: str
    sets: List[SetData]


class WorkoutSessionCreate(BaseModel):
    muscle_group: str
    exercises: List[ExerciseData]


class WorkoutSessionResponse(BaseModel):
    id: str
    user_id: str
    muscle_group: str
    created_at: datetime
    exercises: List[ExerciseData]
