"""
Supabase Database Client - Centralized database operations
"""

import os
import logging
from typing import List, Optional, Dict, Any
from supabase import create_client, Client

logger = logging.getLogger(__name__)


class SupabaseDB:
    """
    Supabase database client for all database operations.
    Centralizes all DB calls to follow FASTAPI_RULES.
    """

    def __init__(self, url: str, key: str) -> None:
        """
        Initialize Supabase client.

        Args:
            url: Supabase project URL
            key: Supabase anonymous key
        """
        self.client: Client = create_client(url, key)
        logger.info("Supabase client initialized")

    def get_user_splits(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all workout splits for a user.

        Args:
            user_id: UUID of the user

        Returns:
            List of split records
        """
        try:
            response = (
                self.client.table("splits")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error fetching splits for user {user_id}: {str(e)}")
            raise

    def create_split(self, user_id: str, name: str) -> Dict[str, Any]:
        """
        Create a new workout split.

        Args:
            user_id: UUID of the user
            name: Name of the split (e.g., "PPL", "Bro Split")

        Returns:
            Created split record
        """
        try:
            response = (
                self.client.table("splits")
                .insert({"user_id": user_id, "name": name})
                .execute()
            )
            return response.data[0]
        except Exception as e:
            logger.error(f"Error creating split: {str(e)}")
            raise

    def get_split_days(self, split_id: str) -> List[Dict[str, Any]]:
        """
        Get all days in a split.

        Args:
            split_id: UUID of the split

        Returns:
            List of split day records
        """
        try:
            response = (
                self.client.table("split_days")
                .select("*")
                .eq("split_id", split_id)
                .order("day_number")
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error fetching split days for split {split_id}: {str(e)}")
            raise

    def add_split_day(
        self, split_id: str, day_number: int, label: str, muscle_groups: List[str]
    ) -> Dict[str, Any]:
        """
        Add a day to a split.

        Args:
            split_id: UUID of the split
            day_number: Day number (1-7)
            label: Label for the day (e.g., "Chest Day")
            muscle_groups: List of muscle groups for the day

        Returns:
            Created split day record
        """
        try:
            response = (
                self.client.table("split_days")
                .insert(
                    {
                        "split_id": split_id,
                        "day_number": day_number,
                        "label": label,
                        "muscle_groups": muscle_groups,
                    }
                )
                .execute()
            )
            return response.data[0]
        except Exception as e:
            logger.error(f"Error adding split day: {str(e)}")
            raise

    def get_exercise_library(self, muscle_group: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get exercise library, optionally filtered by muscle group.

        Args:
            muscle_group: Optional muscle group filter

        Returns:
            List of exercise records
        """
        try:
            query = self.client.table("exercise_library").select("*")
            if muscle_group:
                query = query.eq("muscle_group", muscle_group)
            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching exercise library: {str(e)}")
            raise

    def create_workout_session(
        self, user_id: str, split_day_id: str, session_date: str, notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new workout session.

        Args:
            user_id: UUID of the user
            split_day_id: UUID of the split day
            session_date: Date of the session (ISO format)
            notes: Optional notes about the session

        Returns:
            Created session record
        """
        try:
            response = (
                self.client.table("workout_sessions")
                .insert(
                    {
                        "user_id": user_id,
                        "split_day_id": split_day_id,
                        "date": session_date,
                        "notes": notes,
                    }
                )
                .execute()
            )
            return response.data[0]
        except Exception as e:
            logger.error(f"Error creating workout session: {str(e)}")
            raise

    def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all workout sessions for a user.

        Args:
            user_id: UUID of the user

        Returns:
            List of session records
        """
        try:
            response = (
                self.client.table("workout_sessions")
                .select("*")
                .eq("user_id", user_id)
                .order("date", desc=True)
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error fetching sessions for user {user_id}: {str(e)}")
            raise

    def log_exercise(
        self, session_id: str, exercise_id: str, sets: List[Dict[str, int]]
    ) -> Dict[str, Any]:
        """
        Log an exercise with sets in a workout session.

        Args:
            session_id: UUID of the session
            exercise_id: UUID of the exercise
            sets: List of sets with reps and weight

        Returns:
            Created exercise record
        """
        try:
            response = (
                self.client.table("workout_exercises")
                .insert(
                    {
                        "session_id": session_id,
                        "exercise_id": exercise_id,
                        "sets": sets,
                    }
                )
                .execute()
            )
            return response.data[0]
        except Exception as e:
            logger.error(f"Error logging exercise: {str(e)}")
            raise

    def get_exercise_progress(self, user_id: str, exercise_id: str) -> List[Dict[str, Any]]:
        """
        Get historical data for an exercise (for progress charts).

        Args:
            user_id: UUID of the user
            exercise_id: UUID of the exercise

        Returns:
            List of historical records with weights and dates
        """
        try:
            # Join sessions and exercises to get historical data
            response = (
                self.client.table("workout_exercises")
                .select("sets, workout_sessions(date)")
                .eq("exercise_id", exercise_id)
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error fetching progress for exercise {exercise_id}: {str(e)}")
            raise

    def store_otp(self, phone: str, code: str) -> Dict[str, Any]:
        """
        Store OTP for phone verification.

        Args:
            phone: Phone number in E.164 format (e.g., +919876543210)
            code: 6-digit OTP code

        Returns:
            Created OTP record
        """
        try:
            from datetime import datetime, timedelta
            now = datetime.utcnow()
            expires_at = now + timedelta(minutes=10)

            response = (
                self.client.table("otp_requests")
                .insert({
                    "phone": phone,
                    "code": code,
                    "created_at": now.isoformat(),
                    "expires_at": expires_at.isoformat(),
                    "verified": False,
                })
                .execute()
            )
            return response.data[0]
        except Exception as e:
            logger.error(f"Error storing OTP for phone {phone}: {str(e)}")
            raise

    def verify_otp(self, phone: str, code: str) -> Optional[Dict[str, Any]]:
        """
        Verify OTP code for a phone number.

        Args:
            phone: Phone number in E.164 format
            code: 6-digit OTP code

        Returns:
            OTP record if valid and not expired, None otherwise
        """
        try:
            from datetime import datetime
            response = (
                self.client.table("otp_requests")
                .select("*")
                .eq("phone", phone)
                .eq("code", code)
                .eq("verified", False)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            if not response.data:
                return None

            otp_record = response.data[0]
            expires_at = datetime.fromisoformat(otp_record["expires_at"].replace("Z", "+00:00"))

            if datetime.utcnow() > expires_at:
                return None

            # Mark as verified
            self.client.table("otp_requests").update({"verified": True}).eq("id", otp_record["id"]).execute()

            return otp_record
        except Exception as e:
            logger.error(f"Error verifying OTP for phone {phone}: {str(e)}")
            raise

    def get_or_create_user(self, phone: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get or create a user by phone number.

        Args:
            phone: Phone number in E.164 format
            user_id: Optional user ID from Supabase auth

        Returns:
            User record
        """
        try:
            # Try to find existing user
            response = (
                self.client.table("users")
                .select("*")
                .eq("phone", phone)
                .execute()
            )

            if response.data:
                return response.data[0]

            # Create new user
            new_user = {
                "phone": phone,
                "auth_id": user_id,
            }
            response = (
                self.client.table("users")
                .insert(new_user)
                .execute()
            )
            return response.data[0]
        except Exception as e:
            logger.error(f"Error getting or creating user for phone {phone}: {str(e)}")
            raise


# Initialize Supabase client on module load
def get_db() -> SupabaseDB:
    """
    Get Supabase database client instance.

    Returns:
        SupabaseDB client
    """
    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_KEY", "")

    if not supabase_url or not supabase_key:
        logger.error("Missing Supabase credentials")
        raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables required")

    return SupabaseDB(supabase_url, supabase_key)
