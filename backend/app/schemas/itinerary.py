import uuid
from typing import List, Optional, Dict, Literal, Any
from pydantic import BaseModel, Field, field_validator


class TransitInfo(BaseModel):
    mode: str = Field(..., description="e.g. Walking, Metro, Taxi, High-speed train, Ferry")
    duration_minutes: int = Field(default=15, description="Estimated duration in minutes")
    guidance: str = Field(..., description="Practical directions and transfer advice")


class Activity(BaseModel):
    id: str = Field(default_factory=lambda: f"act_{uuid.uuid4().hex[:8]}", description="Unique activity identifier")
    time_slot: Literal["morning", "afternoon", "evening", "night"] = Field(default="afternoon", description="Time of day")
    title: str = Field(..., description="Descriptive headline of the activity")
    description: str = Field(..., description="Engaging narrative describing the experience")
    location_name: str = Field(..., description="Place name or landmark")
    latitude: Optional[float] = Field(None, description="Approximate latitude for map pins")
    longitude: Optional[float] = Field(None, description="Approximate longitude for map pins")
    estimated_duration_minutes: int = Field(default=120, description="Duration in minutes")
    estimated_cost: float = Field(default=0.0, description="Cost per person in local/requested currency")
    currency: str = Field(default="USD", description="Currency code")
    category: Literal[
        "culture", "food", "nature", "sightseeing", "relaxation", "adventure", "shopping", "transit"
    ] = Field(default="sightseeing")
    insider_tip: Optional[str] = Field(None, description="Local secret, best vantage point, or crowd avoidance")
    booking_required: bool = Field(default=False, description="Whether advance booking or ticket is recommended")
    travel_to_next: Optional[TransitInfo] = Field(None, description="Directions to the following activity")

    @field_validator("time_slot", mode="before")
    @classmethod
    def normalize_time_slot(cls, v):
        if not isinstance(v, str):
            return "afternoon"
        v_low = v.strip().lower()
        if v_low in ("morning", "early_morning", "dawn", "sunrise"):
            return "morning"
        if v_low in ("afternoon", "midday", "noon", "lunchtime"):
            return "afternoon"
        if v_low in ("evening", "sunset", "dusk", "twilight"):
            return "evening"
        if v_low in ("night", "late_night", "nocturne"):
            return "night"
        return "afternoon"

    @field_validator("category", mode="before")
    @classmethod
    def normalize_category(cls, v):
        if not isinstance(v, str):
            return "sightseeing"
        v_low = v.strip().lower()
        mapping = {
            "culture": "culture", "cultural": "culture", "history": "culture", "historic": "culture", "art": "culture", "museum": "culture",
            "food": "food", "dining": "food", "culinary": "food", "cuisine": "food", "wine": "food",
            "nature": "nature", "outdoor": "nature", "outdoors": "nature", "parks": "nature", "scenic": "nature",
            "sightseeing": "sightseeing", "landmark": "sightseeing", "monument": "sightseeing", "experience": "sightseeing",
            "relaxation": "relaxation", "wellness": "relaxation", "spa": "relaxation", "leisure": "relaxation",
            "adventure": "adventure", "sport": "adventure", "hiking": "adventure",
            "shopping": "shopping", "market": "shopping", "retail": "shopping",
            "transit": "transit", "travel": "transit", "train": "transit"
        }
        return mapping.get(v_low, "sightseeing")


class DiningRecommendation(BaseModel):
    meal_type: Literal["breakfast", "lunch", "dinner", "cafe_or_bar"] = Field(...)
    name: str = Field(...)
    cuisine: str = Field(...)
    neighborhood: str = Field(...)
    price_level: str = Field(default="$$", description="$, $$, $$$, or $$$$")
    must_try_dish: str = Field(default="Signature specialty")
    notes: Optional[str] = Field(None)

    @field_validator("meal_type", mode="before")
    @classmethod
    def normalize_meal_type(cls, v):
        if not isinstance(v, str):
            return "lunch"
        v_low = v.strip().lower()
        if "breakfast" in v_low or "brunch" in v_low:
            return "breakfast"
        if "lunch" in v_low or "midday" in v_low:
            return "lunch"
        if "dinner" in v_low or "supper" in v_low:
            return "dinner"
        if "cafe" in v_low or "bar" in v_low or "aperitivo" in v_low or "snack" in v_low or "coffee" in v_low:
            return "cafe_or_bar"
        return "lunch"


class DayPlan(BaseModel):
    day_number: int = Field(..., ge=1)
    date: Optional[str] = Field(None, description="Specific calendar date for this day (YYYY-MM-DD)")
    theme: str = Field(..., description="Editorial theme for this day (e.g. 'Old Town Alleys & Artisan Tea Houses')")
    summary: str = Field(..., description="Short evocative summary of the day's journey")
    activities: List[Activity] = Field(default_factory=list)
    recommended_dining: List[DiningRecommendation] = Field(default_factory=list)
    day_budget_estimate: float = Field(default=0.0)

    @field_validator("activities", mode="before")
    @classmethod
    def filter_valid_activities(cls, v):
        if not isinstance(v, list):
            return []
        valid = []
        for item in v:
            if isinstance(item, dict) and item.get("title"):
                valid.append(item)
            elif isinstance(item, Activity):
                valid.append(item)
        return valid


class LodgingRecommendation(BaseModel):
    name: str = Field(...)
    neighborhood: str = Field(...)
    style: str = Field(..., description="e.g. Boutique Hotel, Luxury Resort, Traditional Ryokan, Chic Loft")
    price_per_night: str = Field(...)
    why_stay_here: str = Field(...)


class TripRequest(BaseModel):
    destination: str = Field(..., min_length=2, description="Destination city, region, or country")
    start_date: Optional[str] = Field(None, description="YYYY-MM-DD format")
    end_date: Optional[str] = Field(None, description="YYYY-MM-DD format")
    duration_days: int = Field(default=4, ge=1, le=14, description="Calculated or specified days")
    budget_tier: Literal["backpacker", "moderate", "luxury", "ultra_luxe"] = Field(default="moderate")
    currency: str = Field(default="USD", description="Currency code (e.g. USD, EUR, GBP, JPY)")
    travel_styles: List[str] = Field(
        default=["cultural", "culinary"],
        description="List of styles: cultural, culinary, nature, relaxed, photography, adventure, hidden_gems"
    )
    group_type: Literal["solo", "couple", "family", "friends"] = Field(default="couple")
    traveler_count: int = Field(default=2, ge=1, le=50, description="Total number of travelers")
    pace: Literal["relaxed", "balanced", "packed"] = Field(default="balanced")
    accommodation_preference: str = Field(
        default="boutique_hotel",
        description="e.g. boutique_hotel, luxury_resort, traditional_guesthouse, budget_hostel, rental_apartment"
    )
    dietary_preferences: Optional[List[str]] = Field(default=None)
    accessibility_needs: Optional[str] = Field(default=None)
    must_see_landmarks: Optional[List[str]] = Field(default=None)
    additional_instructions: Optional[str] = Field(default=None, description="Special user requests or custom notes")

    @field_validator("duration_days", mode="before")
    @classmethod
    def validate_duration(cls, v):
        try:
            val = int(v)
            return max(1, min(val, 14))
        except (ValueError, TypeError):
            return 4


class ItineraryResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Standard RFC 4122 UUID")
    title: str = Field(..., description="Evocative editorial title for the guide")
    destination: str = Field(...)
    country: str = Field(default="")
    start_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    end_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    duration_days: int = Field(...)
    traveler_count: int = Field(default=2)
    tagline: str = Field(...)
    overview: str = Field(...)
    best_time_to_visit: str = Field(default="Year-round")
    weather_summary: str = Field(default="Expect mild seasonal temperatures")
    local_customs_tips: List[str] = Field(default_factory=list)
    packing_essentials: List[str] = Field(default_factory=list)
    estimated_total_cost: float = Field(...)
    currency: str = Field(default="USD")
    budget_breakdown: Dict[str, float] = Field(
        default_factory=lambda: {
            "accommodation": 40.0,
            "dining": 30.0,
            "activities": 18.0,
            "transit": 7.0,
            "contingency": 5.0
        }
    )
    days: List[DayPlan] = Field(default_factory=list)
    lodging_suggestions: List[LodgingRecommendation] = Field(default_factory=list)
    created_at: str = Field(...)
    is_generated_by_ai: bool = Field(default=True)
    provider_used: str = Field(default="Groq")
    is_demo_mode: bool = Field(default=False)
    unverified_data_disclaimer: str = Field(
        default="All costs, transit times, and attraction schedules are AI-generated estimates and must be verified before booking."
    )

    @field_validator("id", mode="before")
    @classmethod
    def ensure_uuid(cls, v):
        if not v:
            return str(uuid.uuid4())
        try:
            return str(uuid.UUID(str(v)))
        except (ValueError, AttributeError):
            return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(v)))


class ActivityUpdatePayload(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_slot: Optional[Literal["morning", "afternoon", "evening", "night"]] = None
    category: Optional[str] = None
    estimated_cost: Optional[float] = None
    insider_tip: Optional[str] = None


class DayRegenerateRequest(BaseModel):
    focus: Optional[str] = Field(None, description="Optional theme or focus for the regenerated day")
    additional_notes: Optional[str] = Field(None, description="Specific instructions for this day")
