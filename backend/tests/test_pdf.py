from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_pdf_export_and_download():
    # 1. Generate trip first
    payload = {
        "destination": "Paris, France",
        "duration_days": 2,
        "budget_tier": "moderate",
        "currency": "EUR",
        "travel_styles": ["culinary", "cultural"],
        "group_type": "couple",
        "pace": "balanced"
    }
    gen_res = client.post("/api/v1/itinerary/generate", json=payload)
    trip = gen_res.json()
    trip_id = trip["id"]

    # 2. Download via GET
    get_res = client.get(f"/api/v1/pdf/{trip_id}/download")
    assert get_res.status_code == 200
    assert get_res.headers["content-type"] == "application/pdf"
    assert get_res.content.startswith(b"%PDF-")
    assert len(get_res.content) > 1000

    # 3. Direct export via POST body
    post_res = client.post("/api/v1/pdf/export", json=trip)
    assert post_res.status_code == 200
    assert post_res.headers["content-type"] == "application/pdf"
    assert post_res.content.startswith(b"%PDF-")
    assert len(post_res.content) > 1000
