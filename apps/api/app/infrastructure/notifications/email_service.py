"""Email service interface and console implementation (dev mode).

Future: Replace ConsoleEmailService with a real provider (Resend, SendGrid, etc.)
by implementing the EmailService Protocol.
"""

from typing import Protocol


class EmailService(Protocol):
    async def send_password_reset(self, to_email: str, reset_token: str) -> None: ...


class ConsoleEmailService:
    """Logs emails to the console. For development only."""

    async def send_password_reset(self, to_email: str, reset_token: str) -> None:
        import logging

        logger = logging.getLogger(__name__)
        logger.info(
            "[DEV EMAIL] To: %s | Password reset token: %s",
            to_email,
            reset_token,
        )
