import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.itinerary import ItineraryResponse, DayPlan, Activity, DiningRecommendation

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ai_provider"] == "Groq"
    assert "groq_configured" in data
    assert "active_database" in data


def test_generate_itinerary_with_mocked_groq():
    fake_uuid = str(uuid.uuid4())
    mock_groq_content = {
        "title": "Kyoto Serenade: A 3-Day Journey",
        "destination": "Kyoto, Japan",
        "country": "Japan",
        "tagline": "Temples and Whispers",
        "overview": "Immersive exploration of historic Kyoto.",
        "best_time_to_visit": "October to November",
        "weather_summary": "Crisp autumn air.",
        "local_customs_tips": ["Bow politely", "Remove shoes indoors"],
        "packing_essentials": ["Walking shoes", "Layered jacket"],
        "estimated_total_cost": 950.0,
        "currency": "USD",
        "budget_breakdown": {
            "accommodation": 40.0,
            "dining": 30.0,
            "activities": 18.0,
            "transit": 7.0,
            "contingency": 5.0
        },
        "days": [
            {
                "day_number": 1,
                "theme": "Arashiyama & Bamboo Groves",
                "summary": "Morning bamboo walks and river serene.",
                "day_budget_estimate": 300.0,
                "activities": [
                    {
                        "id": "act_1_1",
                        "time_slot": "morning",
                        "title": "Arashiyama Bamboo Walk",
                        "description": "Quiet morning stroll through towering bamboo.",
                        "location_name": "Arashiyama",
                        "latitude": 35.0158,
                        "longitude": 135.6713,
                        "estimated_duration_minutes": 90,
                        "estimated_cost": 0.0,
                        "currency": "USD",
                        "category": "nature",
                        "insider_tip": "Go before 8am.",
                        "booking_required": False
                    }
                ],
                "recommended_dining": [
                    {
                        "meal_type": "lunch",
                        "name": "Yudofu Sagano",
                        "cuisine": "Tofu Kaiseki",
                        "neighborhood": "Arashiyama",
                        "price_level": "$$",
                        "must_try_dish": "Hot pot tofu",
                        "notes": "Garden views"
                    }
                ]
            },
            {
                "day_number": 2,
                "theme": "Gion Historic Quarters",
                "summary": "Evening lanterns and geisha culture.",
                "day_budget_estimate": 320.0,
                "activities": [
                    {
                        "id": "act_2_1",
                        "time_slot": "afternoon",
                        "title": "Gion Walk",
                        "description": "Wander through machiya townhouses.",
                        "location_name": "Gion",
                        "latitude": 35.0037,
                        "longitude": 135.7772,
                        "estimated_duration_minutes": 120,
                        "estimated_cost": 15.0,
                        "currency": "USD",
                        "category": "culture",
                        "insider_tip": "Respect local signs.",
                        "booking_required": False
                    }
                ],
                "recommended_dining": []
            },
            {
                "day_number": 3,
                "theme": "Fushimi Inari Torii Gates",
                "summary": "Vermilion torii gates winding up sacred mountain.",
                "day_budget_estimate": 330.0,
                "activities": [
                    {
                        "id": "act_3_1",
                        "time_slot": "morning",
                        "title": "Fushimi Inari Hike",
                        "description": "Hike the scenic shrine paths.",
                        "location_name": "Fushimi",
                        "latitude": 34.9671,
                        "longitude": 135.7727,
                        "estimated_duration_minutes": 150,
                        "estimated_cost": 0.0,
                        "currency": "USD",
                        "category": "culture",
                        "insider_tip": "Hike up past Yotsutsuji cross.",
                        "booking_required": False
                    }
                ],
                "recommended_dining": []
            }
        ],
        "lodging_suggestions": [
            {
                "name": "Gion Heritage Ryokan",
                "neighborhood": "Gion",
                "style": "Traditional Ryokan",
                "price_per_night": "$220/night",
                "why_stay_here": "Authentic tatami and hot cedar bath"
            }
        ]
    }

    mock_chat_completion = MagicMock()
    mock_chat_completion.choices = [
        MagicMock(message=MagicMock(content=__import__("json").dumps(mock_groq_content)))
    ]

    with patch("app.services.ai_service.ai_service.groq_client") as mock_client:
        mock_client.chat.completions.create.return_value = mock_chat_completion

        payload = {
            "destination": "Kyoto, Japan",
            "start_date": "2026-11-01",
            "end_date": "2026-11-03",
            "duration_days": 3,
            "budget_tier": "moderate",
            "currency": "USD",
            "travel_styles": ["cultural", "culinary"],
            "group_type": "couple",
            "traveler_count": 2,
            "pace": "balanced",
            "accommodation_preference": "traditional_ryokan",
            "additional_instructions": "Focus on historic preservation zones."
        }

        response = client.post("/api/v1/itinerary/generate", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Validate consistent UUID format
        assert uuid.UUID(data["id"])
        assert data["destination"] == "Kyoto, Japan"
        assert data["duration_days"] == 3
        assert data["traveler_count"] == 2
        assert len(data["days"]) == 3
        assert "Groq" in data["provider_used"]
        assert data["is_generated_by_ai"] is True


def test_activity_patch_and_delete():
    # 1. Generate trip in demo mode
    payload = {
        "destination": "Rome, Italy",
        "duration_days": 2,
        "budget_tier": "moderate",
        "currency": "EUR",
        "travel_styles": ["cultural"],
        "group_type": "solo",
        "traveler_count": 1,
        "pace": "relaxed"
    }
    gen_res = client.post("/api/v1/itinerary/generate", json=payload)
    trip = gen_res.json()
    trip_id = trip["id"]
    # Check UUID
    assert uuid.UUID(trip_id)

    first_act = trip["days"][0]["activities"][0]
    act_id = first_act["id"]

    # 2. Patch activity
    patch_res = client.patch(
        f"/api/v1/itinerary/{trip_id}/activities/{act_id}",
        json={"title": "Updated Roman Sunrise Walk", "estimated_cost": 45.0}
    )
    assert patch_res.status_code == 200
    updated_trip = patch_res.json()
    assert updated_trip["days"][0]["activities"][0]["title"] == "Updated Roman Sunrise Walk"

    # 3. Delete activity
    del_res = client.delete(f"/api/v1/itinerary/{trip_id}/activities/{act_id}")
    assert del_res.status_code == 200
    remaining_acts = del_res.json()["days"][0]["activities"]
    assert not any(a["id"] == act_id for a in remaining_acts)
