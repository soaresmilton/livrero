from datetime import date, datetime

from app.application.use_cases.get_dashboard import (
    build_heatmap_counts,
    compute_streak,
)
from app.infrastructure.persistence.repositories.stats_repository import SessionStat


def _session(day: str, minutes: int = 30, pages: int = 10) -> SessionStat:
    return SessionStat(
        start_time=datetime.fromisoformat(f"{day}T10:00:00"),
        minutes_read=minutes,
        pages=pages,
    )


def test_streak_zero_when_no_recent_activity():
    dates = {date(2026, 1, 1), date(2026, 1, 2)}
    assert compute_streak(dates, date(2026, 7, 6)) == 0


def test_streak_counts_consecutive_days_including_today():
    dates = {date(2026, 7, 6), date(2026, 7, 5), date(2026, 7, 4)}
    assert compute_streak(dates, date(2026, 7, 6)) == 3


def test_streak_continues_from_yesterday_when_no_activity_today():
    dates = {date(2026, 7, 5), date(2026, 7, 4)}
    assert compute_streak(dates, date(2026, 7, 6)) == 2


def test_streak_breaks_on_gap():
    dates = {date(2026, 7, 6), date(2026, 7, 4), date(2026, 7, 3)}
    assert compute_streak(dates, date(2026, 7, 6)) == 1


def test_heatmap_sums_minutes_per_day_within_year():
    sessions = [
        _session("2026-03-01", minutes=20),
        _session("2026-03-01", minutes=10),
        _session("2026-03-02", minutes=45),
        _session("2025-12-31", minutes=99),  # different year, excluded
    ]
    counts = build_heatmap_counts(sessions, 2026)
    assert counts[date(2026, 3, 1)] == 30
    assert counts[date(2026, 3, 2)] == 45
    assert date(2025, 12, 31) not in counts
