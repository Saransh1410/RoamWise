import json
import uuid
import re
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.core.config import settings
from app.schemas.itinerary import (
    TripRequest,
    ItineraryResponse,
    DayPlan,
    Activity,
    DiningRecommendation,
    LodgingRecommendation,
    TransitInfo,
)

logger = logging.getLogger("roamwise.ai")


class AIService:
    """
    Groq-Exclusive AI Service for Roamwise AI:
    - Official Groq Python SDK is the sole LLM provider.
    - Uses structured JSON mode (`response_format={"type": "json_object"}`).
    - Full Pydantic validation before saving or returning.
    - Supports full itinerary generation, individual-day regeneration, and full regeneration.
    - Transparently labels fallback as 'Offline Demo Mode (Sample Data)' when Groq key is absent or fails.
    """

    def __init__(self):
        self.groq_client = None
        self.model = settings.GROQ_MODEL or "llama-3.3-70b-versatile"
        self._init_groq()

    def _init_groq(self):
        if settings.GROQ_API_KEY:
            try:
                from groq import Groq
                self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
                logger.info(f"[AI] Groq client initialized successfully with model {self.model}.")
            except Exception as e:
                logger.error(f"[AI] Groq client initialization error: {e}")
                self.groq_client = None
        else:
            logger.info("[AI] GROQ_API_KEY not configured. Running in explicit Demo Mode.")

    def get_provider_status(self) -> Dict[str, Any]:
        return {
            "sole_provider": "Groq",
            "model": self.model,
            "configured": bool(settings.GROQ_API_KEY),
            "is_live_ready": self.groq_client is not None,
        }

    def generate_itinerary(self, req: TripRequest) -> ItineraryResponse:
        """
        Generate complete structured itinerary using Groq.
        Falls back explicitly to labelled Demo Mode if Groq key is missing or calls fail.
        """
        if self.groq_client:
            try:
                return self._generate_with_groq(req)
            except Exception as e:
                logger.error(f"[AI:Groq] Generation failed: {e}. Falling back to labelled Demo Mode.")
                return self._generate_demo_mode_itinerary(req, error_reason=str(e))

        return self._generate_demo_mode_itinerary(req, error_reason="GROQ_API_KEY not provided")

    def _generate_with_groq(self, req: TripRequest) -> ItineraryResponse:
        system_prompt = (
            "You are the senior editorial travel writer and journey curator for Roamwise AI. "
            "You craft deeply authentic, practical, day-by-day travel itineraries. "
            "You must return ONLY a single, valid JSON object matching the requested schema. "
            "Do not include any Markdown fencing, backticks, or preamble."
        )

        user_prompt = f"""
Create a highly curated, immersive {req.duration_days}-day travel itinerary for {req.destination}.

Traveler Profile & Explicit Requirements:
- Destination: {req.destination}
- Dates: {req.start_date or 'Flexible'} to {req.end_date or 'Flexible'} ({req.duration_days} total days)
- Travelers: {req.traveler_count} ({req.group_type})
- Budget Tier: {req.budget_tier} (Currency: {req.currency})
- Styles & Interests: {', '.join(req.travel_styles)}
- Daily Pace: {req.pace}
- Accommodation Preference: {req.accommodation_preference}
- Dietary Preferences: {', '.join(req.dietary_preferences) if req.dietary_preferences else 'None specified'}
- Accessibility Needs: {req.accessibility_needs or 'None specified'}
- Must-See Landmarks: {', '.join(req.must_see_landmarks) if req.must_see_landmarks else 'Curate the absolute best landmarks'}
- Additional Traveler Notes: {req.additional_instructions or 'None'}

Required JSON Schema:
{{
    "title": "Evocative Magazine Editorial Title",
    "destination": "{req.destination}",
    "country": "Country name",
    "tagline": "Poetic, evocative one-line summary",
    "overview": "Rich 2-3 paragraph travel introduction celebrating culture, architecture, and food",
    "best_time_to_visit": "Months and season recommendations",
    "weather_summary": "Expected temperature and weather notes",
    "local_customs_tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"],
    "packing_essentials": ["Pack 1", "Pack 2", "Pack 3", "Pack 4"],
    "estimated_total_cost": 1200.0,
    "currency": "{req.currency}",
    "budget_breakdown": {{
        "accommodation": 40.0,
        "dining": 30.0,
        "activities": 18.0,
        "transit": 7.0,
        "contingency": 5.0
    }},
    "days": [
        {{
            "day_number": 1,
            "theme": "Day theme (e.g. Historic Quarter & Artisan Alleys)",
            "summary": "Short narrative of this day",
            "day_budget_estimate": 300.0,
            "activities": [
                {{
                    "id": "act_1_1",
                    "time_slot": "morning",
                    "title": "Activity name",
                    "description": "Engaging description",
                    "location_name": "Specific place name",
                    "latitude": 35.0116,
                    "longitude": 135.7681,
                    "estimated_duration_minutes": 120,
                    "estimated_cost": 25.0,
                    "currency": "{req.currency}",
                    "category": "culture",
                    "insider_tip": "Specific insider perspective",
                    "booking_required": false,
                    "travel_to_next": {{
                        "mode": "Scenic Walk / Metro",
                        "duration_minutes": 15,
                        "guidance": "Walking direction or transit stop"
                    }}
                }}
            ],
            "recommended_dining": [
                {{
                    "meal_type": "lunch",
                    "name": "Restaurant Name",
                    "cuisine": "Cuisine style",
                    "neighborhood": "Area name",
                    "price_level": "$$",
                    "must_try_dish": "Specialty dish",
                    "notes": "Atmosphere notes"
                }}
            ]
        }}
    ],
    "lodging_suggestions": [
        {{
            "name": "Hotel / Stay Name",
            "neighborhood": "District",
            "style": "{req.accommodation_preference}",
            "price_per_night": "$180/night",
            "why_stay_here": "Curator reason"
        }}
    ]
}}
Ensure days array has exactly {req.duration_days} day objects.
"""

        completion = self.groq_client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=6000,
        )

        raw_content = completion.choices[0].message.content or "{}"
        data = json.loads(raw_content)

        # Standard UUIDv4 assignment
        data["id"] = str(uuid.uuid4())
        data["start_date"] = req.start_date
        data["end_date"] = req.end_date
        data["duration_days"] = req.duration_days
        data["traveler_count"] = req.traveler_count
        data["created_at"] = datetime.now(timezone.utc).isoformat()
        data["is_generated_by_ai"] = True
        data["provider_used"] = f"Groq ({self.model})"
        data["is_demo_mode"] = False
        data["unverified_data_disclaimer"] = (
            "Generated via Groq LLM. All activities, coordinates, and prices are estimates and must be verified before travel."
        )

        return ItineraryResponse.model_validate(data)

    def regenerate_day(
        self,
        trip: ItineraryResponse,
        day_number: int,
        focus: Optional[str] = None,
        additional_notes: Optional[str] = None
    ) -> ItineraryResponse:
        """
        Regenerate a single day using Groq while preserving all other days.
        """
        target_day_idx = None
        for i, d in enumerate(trip.days):
            if d.day_number == day_number:
                target_day_idx = i
                break

        if target_day_idx is None:
            raise ValueError(f"Day {day_number} not found in trip")

        if self.groq_client:
            try:
                system_prompt = (
                    "You are the senior editorial travel curator for Roamwise AI. "
                    "Regenerate a single day for an existing itinerary in valid JSON. "
                    "Output strictly a JSON object with keys: theme, summary, day_budget_estimate, activities, recommended_dining."
                )
                user_prompt = f"""
Regenerate Day {day_number} for this trip to {trip.destination}.
Current Day Theme: {trip.days[target_day_idx].theme}
Requested Focus: {focus or 'Fresh alternative hidden gems and cultural experiences'}
Additional Instructions: {additional_notes or 'None'}
Trip Currency: {trip.currency}

Format strictly matching:
{{
    "theme": "New Day Theme",
    "summary": "New Day Summary",
    "day_budget_estimate": 250.0,
    "activities": [
        {{
            "id": "act_{day_number}_1",
            "time_slot": "morning",
            "title": "Activity Title",
            "description": "Engaging description",
            "location_name": "Location",
            "latitude": 35.0,
            "longitude": 135.0,
            "estimated_duration_minutes": 120,
            "estimated_cost": 20.0,
            "currency": "{trip.currency}",
            "category": "culture",
            "insider_tip": "Insider tip",
            "booking_required": false,
            "travel_to_next": {{
                "mode": "Scenic Walk",
                "duration_minutes": 15,
                "guidance": "Clear transit advice"
            }}
        }}
    ],
    "recommended_dining": [
        {{
            "meal_type": "lunch",
            "name": "Restaurant",
            "cuisine": "Cuisine",
            "neighborhood": "Area",
            "price_level": "$$",
            "must_try_dish": "Signature dish",
            "notes": "Atmosphere"
        }}
    ]
}}
"""
                completion = self.groq_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.7,
                )
                data = json.loads(completion.choices[0].message.content or "{}")
                data["day_number"] = day_number
                data["date"] = trip.days[target_day_idx].date
                trip.days[target_day_idx] = DayPlan.model_validate(data)
                logger.info(f"[AI:Groq] Regenerated day {day_number} with Groq.")
                return trip
            except Exception as e:
                logger.error(f"[AI:Groq] Day regeneration error: {e}. Using deterministic day refresh.")

        # Fallback refresh for day
        day = trip.days[target_day_idx]
        new_theme = focus or "Hidden Treasures, Artisan Workshops & Twilight Promenade"
        day.theme = f"{trip.destination}: {new_theme}"
        day.summary = f"Refreshed curated itinerary for Day {day_number} highlighting {new_theme}."
        for act in day.activities:
            act.title = f"Curated: {act.time_slot.capitalize()} in {trip.destination}"
            act.description = f"Bespoke exploration crafted around {new_theme}."
            act.insider_tip = "Avoid peak hours by timing your visit around golden hour."
        return trip

    def regenerate_itinerary(
        self,
        trip: ItineraryResponse,
        custom_instructions: Optional[str] = None
    ) -> ItineraryResponse:
        """
        Regenerate the full itinerary with Groq using updated instructions.
        """
        req = TripRequest(
            destination=trip.destination,
            start_date=trip.start_date,
            end_date=trip.end_date,
            duration_days=trip.duration_days,
            traveler_count=trip.traveler_count,
            currency=trip.currency,
            additional_instructions=custom_instructions
        )
        new_trip = self.generate_itinerary(req)
        # Preserve original UUID for consistency
        new_trip.id = trip.id
        return new_trip

    def _generate_demo_mode_itinerary(self, req: TripRequest, error_reason: str = "") -> ItineraryResponse:
        """
        Offline Demo Mode Generator:
        Explicitly marked so the user knows this is sample illustrative data rather than live Groq LLM output.
        """
        dest_clean = req.destination.strip()
        trip_uuid = str(uuid.uuid4())

        budget_multipliers = {
            "backpacker": 65.0,
            "moderate": 175.0,
            "luxury": 480.0,
            "ultra_luxe": 990.0
        }
        daily_base = budget_multipliers.get(req.budget_tier, 175.0) * max(1, req.traveler_count * 0.85)
        total_estimated = round(daily_base * req.duration_days, 2)

        days: List[DayPlan] = []
        themes = [
            "Storied Landmarks & Historic Quarters",
            "Artisan Alleys, Local Roasters & Culinary Traditions",
            "Panoramic Architecture, Waterways & Solitude",
            "Culinary Trails, Evening Lights & Hidden Cellars",
            "Botanical Reserves & Golden Hour Viewpoints",
            "Craft Studios, Vintage Boutiques & Independent Galleries",
            "Leisurely Mornings, Heritage Estates & Farewell Dining",
        ]
        time_slots = ["morning", "afternoon", "evening"]
        if req.pace == "packed":
            time_slots.append("night")
        elif req.pace == "relaxed":
            time_slots = ["morning", "afternoon"]

        for d in range(1, req.duration_days + 1):
            day_theme = themes[(d - 1) % len(themes)]
            activities: List[Activity] = []

            for idx, slot in enumerate(time_slots):
                act_id = f"act_{d}_{idx+1}"
                cost_slot = round((daily_base * 0.22) / len(time_slots), 1)
                activities.append(Activity(
                    id=act_id,
                    time_slot=slot,
                    title=f"{slot.capitalize()} Discovery: Historic {dest_clean}",
                    description=f"Experience the authentic neighborhood character, local craftsmanship, and architectural textures of {dest_clean}.",
                    location_name=f"Central {dest_clean}",
                    latitude=35.0116 + (d * 0.003),
                    longitude=135.7681 + (idx * 0.004),
                    estimated_duration_minutes=120,
                    estimated_cost=cost_slot,
                    currency=req.currency,
                    category="culture" if slot == "morning" else ("food" if slot == "evening" else "sightseeing"),
                    insider_tip="Sample demo note: Arrive 20 minutes prior to opening for crowd-free viewing.",
                    booking_required=(idx == 0 and d % 2 == 1),
                    travel_to_next=TransitInfo(mode="Scenic Walk", duration_minutes=15, guidance="Stroll along historic cobblestone corridors.") if idx < len(time_slots) - 1 else None
                ))

            dining = [
                DiningRecommendation(
                    meal_type="breakfast",
                    name=f"Artisan Bakery & Cafe {dest_clean.split()[0]}",
                    cuisine="Specialty Coffee & Viennoiserie",
                    neighborhood="Historic Center",
                    price_level="$$",
                    must_try_dish="Handcrafted breakfast pastry with single-origin roast",
                    notes="Charming sunlit space for morning reading."
                ),
                DiningRecommendation(
                    meal_type="lunch",
                    name=f"Osteria & Bistro {dest_clean.split()[0]}",
                    cuisine="Farm-to-Table Regional",
                    neighborhood="Old Market Quarter",
                    price_level="$$",
                    must_try_dish="Seasonal market specialty or fresh handmade pasta",
                    notes="Authentic local spot with open kitchen."
                ),
                DiningRecommendation(
                    meal_type="dinner",
                    name=f"The Heritage Cellar {dest_clean.split()[0]}",
                    cuisine="Contemporary Regional Tasting",
                    neighborhood="Riverfront",
                    price_level="$$$",
                    must_try_dish="Chef's seasonal tasting menu with paired vintages",
                    notes="Intimate candlelit dining."
                )
            ]

            days.append(DayPlan(
                day_number=d,
                date=None,
                theme=day_theme,
                summary=f"A thoughtfully curated day traversing {dest_clean}, balancing historic discovery with leisurely local dining.",
                activities=activities,
                recommended_dining=dining,
                day_budget_estimate=round(daily_base, 2)
            ))

        lodgings = [
            LodgingRecommendation(
                name=f"The Heritage House {dest_clean}",
                neighborhood="Historic Core",
                style=req.accommodation_preference.replace('_', ' ').title(),
                price_per_night=f"~{req.currency} {int(daily_base * 0.40)}/night",
                why_stay_here="Central location, bespoke character, and curated local recommendations."
            )
        ]

        provider_label = "Offline Demo Mode (Sample Data - Groq Key Not Configured)" if "not provided" in error_reason else f"Offline Demo Mode (Groq Call Failed: {error_reason[:40]})"

        return ItineraryResponse(
            id=trip_uuid,
            title=f"The Art of Traveling {dest_clean}: A {req.duration_days}-Day Journey",
            destination=dest_clean,
            country="Sample Destination",
            start_date=req.start_date,
            end_date=req.end_date,
            duration_days=req.duration_days,
            traveler_count=req.traveler_count,
            tagline=f"Timeless Discoveries, Local Food Trails, and Artful Encounters in {dest_clean}",
            overview=(
                f"{dest_clean} offers a compelling blend of living history, inspiring architecture, "
                f"and authentic culinary culture. This {req.duration_days}-day itinerary balances celebrated highlights "
                f"with quiet, authentic neighborhood encounters."
            ),
            best_time_to_visit="Spring and Autumn",
            weather_summary="Mild, pleasant walking weather with seasonal breezes.",
            local_customs_tips=[
                "Greet shopkeepers upon entering with a courteous local greeting.",
                "Carry cash as family-run artisan shops often prefer local currency.",
                "Dress respectfully when visiting religious and historic sanctuaries.",
                "Savor dining without rushing—meals are regarded as leisurely social rituals."
            ],
            packing_essentials=[
                "Ergonomic, well-broken-in walking shoes",
                "Lightweight layered attire for fluctuating temperatures",
                "Compact power bank and universal plug adapter",
                "Refillable water bottle and foldable daypack"
            ],
            estimated_total_cost=total_estimated,
            currency=req.currency,
            budget_breakdown={
                "accommodation": round(total_estimated * 0.40, 2),
                "dining": round(total_estimated * 0.30, 2),
                "activities": round(total_estimated * 0.18, 2),
                "transit": round(total_estimated * 0.07, 2),
                "contingency": round(total_estimated * 0.05, 2)
            },
            days=days,
            lodging_suggestions=lodgings,
            created_at=datetime.now(timezone.utc).isoformat(),
            is_generated_by_ai=False,
            provider_used=provider_label,
            is_demo_mode=True,
            unverified_data_disclaimer=(
                "DEMO MODE SAMPLE: This sample itinerary was generated using offline fallback data because live Groq API credentials were not configured. "
                "Attractions, costs, and transit times are illustrative and not verified."
            )
        )


ai_service = AIService()
