from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional
from app.schemas.itinerary import (
    TripRequest,
    ItineraryResponse,
    ActivityUpdatePayload,
    DayRegenerateRequest
)
from app.services.ai_service import ai_service
from app.services.db_service import db_service

router = APIRouter(prefix="/itinerary", tags=["Itinerary"])


@router.post("/generate", response_model=ItineraryResponse)
async def generate_itinerary(req: TripRequest):
    """
    Generate an authentic, tailored multi-day travel itinerary with day plans,
    activities, dining, lodging, and estimated budgets using Groq LLM.
    Automatically persists to the active database.
    """
    try:
        itinerary = ai_service.generate_itinerary(req)
        db_service.save_trip(itinerary)
        return itinerary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate itinerary: {str(e)}")


@router.post("/{trip_id}/regenerate-day/{day_number}", response_model=ItineraryResponse)
async def regenerate_day(
    trip_id: str,
    day_number: int,
    payload: Optional[DayRegenerateRequest] = None
):
    """
    Regenerate a specific day's theme and activities using Groq while preserving the rest of the journey.
    """
    trip = db_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if day_number < 1 or day_number > trip.duration_days:
        raise HTTPException(status_code=400, detail="Invalid day number for this trip")

    focus = payload.focus if payload else None
    notes = payload.additional_notes if payload else None

    try:
        updated_trip = ai_service.regenerate_day(trip, day_number, focus=focus, additional_notes=notes)
        db_service.save_trip(updated_trip)
        return updated_trip
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Day regeneration failed: {str(e)}")


@router.post("/{trip_id}/regenerate", response_model=ItineraryResponse)
async def regenerate_full_itinerary(
    trip_id: str,
    custom_instructions: Optional[str] = Body(None, embed=True)
):
    """
    Regenerate the entire itinerary with Groq using updated instructions while preserving trip identity.
    """
    trip = db_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    try:
        updated_trip = ai_service.regenerate_itinerary(trip, custom_instructions=custom_instructions)
        db_service.save_trip(updated_trip)
        return updated_trip
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Full itinerary regeneration failed: {str(e)}")


@router.patch("/{trip_id}/activities/{activity_id}", response_model=ItineraryResponse)
async def update_activity(
    trip_id: str,
    activity_id: str,
    payload: ActivityUpdatePayload
):
    """
    Update details (title, description, cost, slot, tip) for a specific activity.
    """
    trip = db_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    found = False
    for day in trip.days:
        for act in day.activities:
            if act.id == activity_id:
                found = True
                if payload.title is not None:
                    act.title = payload.title
                if payload.description is not None:
                    act.description = payload.description
                if payload.time_slot is not None:
                    act.time_slot = payload.time_slot
                if payload.category is not None:
                    act.category = payload.category  # type: ignore
                if payload.estimated_cost is not None:
                    act.estimated_cost = payload.estimated_cost
                if payload.insider_tip is not None:
                    act.insider_tip = payload.insider_tip
                break
        if found:
            break

    if not found:
        raise HTTPException(status_code=404, detail="Activity not found in trip")

    db_service.save_trip(trip)
    return trip


@router.delete("/{trip_id}/activities/{activity_id}", response_model=ItineraryResponse)
async def delete_activity(trip_id: str, activity_id: str):
    """
    Delete a specific activity from an itinerary.
    """
    trip = db_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    found = False
    for day in trip.days:
        orig_len = len(day.activities)
        day.activities = [act for act in day.activities if act.id != activity_id]
        if len(day.activities) < orig_len:
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Activity not found")

    db_service.save_trip(trip)
    return trip
