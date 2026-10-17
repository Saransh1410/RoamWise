from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.schemas.itinerary import ItineraryResponse
from app.services.db_service import db_service

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.get("", response_model=List[Dict[str, Any]])
async def list_saved_trips():
    """
    Retrieve all saved trip summaries.
    """
    return db_service.list_trips()


@router.get("/{trip_id}", response_model=ItineraryResponse)
async def get_trip_details(trip_id: str):
    """
    Fetch full trip itinerary by ID.
    """
    trip = db_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("/save", response_model=Dict[str, str])
async def save_or_update_trip(trip: ItineraryResponse):
    """
    Save or update an entire trip itinerary object.
    """
    saved_id = db_service.save_trip(trip)
    return {"id": saved_id, "status": "success"}


@router.delete("/{trip_id}")
async def delete_trip(trip_id: str):
    """
    Remove a saved trip.
    """
    success = db_service.delete_trip(trip_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trip not found or already deleted")
    return {"status": "deleted", "id": trip_id}
