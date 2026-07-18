"""Email service interface and console implementation (dev mode).

Future: Replace ConsoleEmailService with a real provider (Resend, SendGrid, etc.)
by implementing the EmailService Protocol.
"""

from typing import Protocol


class EmailService(Protocol):
    """Protocol for services that deliver transactional emails."""

    async def send_password_reset(self, to_email: str, reset_token: str) -> None:
        """Send a password reset email containing the given token."""
        ...


class ConsoleEmailService:
    """Logs emails to the console. For development only."""

    async def send_password_reset(self, to_email: str, reset_token: str) -> None:
        """Log the password reset token to the console instead of sending an email."""
        import logging

        logger = logging.getLogger(__name__)
        logger.info(
            "[DEV EMAIL] To: %s | Password reset token: %s",
            to_email,
            reset_token,
        )
