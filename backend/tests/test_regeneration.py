import uuid
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_regenerate_single_day_and_full():
    # 1. Create a base trip
    payload = {
        "destination": "Paris, France",
        "duration_days": 2,
        "budget_tier": "moderate",
        "currency": "EUR",
        "travel_styles": ["culinary"],
        "group_type": "couple",
        "traveler_count": 2,
        "pace": "balanced"
    }
    gen_res = client.post("/api/v1/itinerary/generate", json=payload)
    trip = gen_res.json()
    trip_id = trip["id"]
    assert uuid.UUID(trip_id)

    # 2. Test single day regeneration
    regen_day_res = client.post(
        f"/api/v1/itinerary/{trip_id}/regenerate-day/1",
        json={"focus": "Artisan Boulangeries & Montmartre Hidden Cafes"}
    )
    assert regen_day_res.status_code == 200
    updated_trip = regen_day_res.json()
    assert updated_trip["id"] == trip_id
    # Day 2 should be untouched
    assert len(updated_trip["days"]) == 2

    # 3. Test full itinerary regeneration
    regen_full_res = client.post(
        f"/api/v1/itinerary/{trip_id}/regenerate",
        json={"custom_instructions": "Focus entirely on bohemian cafes and art history."}
    )
    assert regen_full_res.status_code == 200
    full_updated = regen_full_res.json()
    assert full_updated["id"] == trip_id
    assert len(full_updated["days"]) == 2
