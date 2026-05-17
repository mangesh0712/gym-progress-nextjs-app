"""
Email Service - Send emails via EmailJS
"""

import os
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)


class EmailService:
    """Send emails using EmailJS API"""

    def __init__(self):
        self.service_id = os.getenv("EMAILJS_SERVICE_ID", "")
        self.template_id = os.getenv("EMAILJS_TEMPLATE_ID", "")
        self.public_key = os.getenv("EMAILJS_PUBLIC_KEY", "")
        self.private_key = os.getenv("EMAILJS_PRIVATE_KEY", "")
        self.api_url = "https://api.emailjs.com/api/v1.0/email/send"

        if not all([self.service_id, self.template_id, self.public_key, self.private_key]):
            logger.warning("EmailJS credentials not fully configured")

    async def send_otp_email(self, email: str, phone: str, otp_code: str) -> bool:
        """
        Send OTP via email.

        Args:
            email: Recipient email address
            phone: Phone number for reference
            otp_code: 6-digit OTP code

        Returns:
            True if successful, False otherwise
        """
        try:
            payload = {
                "service_id": self.service_id,
                "template_id": self.template_id,
                "user_id": self.public_key,
                "accessToken": self.private_key,
                "template_params": {
                    "to_email": email,
                    "otp_code": otp_code,
                    "phone": phone,
                    "expires_in": "10 minutes",
                },
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(self.api_url, json=payload, timeout=10.0)

                if response.status_code == 200:
                    logger.info(f"OTP email sent successfully to {email}")
                    return True
                else:
                    logger.error(
                        f"Failed to send OTP email to {email}: {response.status_code} - {response.text}"
                    )
                    return False

        except Exception as e:
            logger.error(f"Error sending OTP email to {email}: {str(e)}")
            return False


# Singleton instance
_email_service: Optional[EmailService] = None


def get_email_service() -> EmailService:
    """Get email service instance"""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
