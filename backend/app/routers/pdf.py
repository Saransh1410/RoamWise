from fastapi import APIRouter, HTTPException, Response
from app.services.pdf_service import pdf_service
from app.services.db_service import db_service
from app.schemas.itinerary import ItineraryResponse

router = APIRouter(prefix="/pdf", tags=["PDF Export"])


@router.get("/{trip_id}/download")
async def download_trip_pdf(trip_id: str):
    """
    Generate and stream an editorial travel guide PDF for a saved trip.
    """
    trip = db_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    try:
        pdf_bytes = pdf_service.generate_pdf(trip)
        safe_filename = f"Roamwise_{trip.destination.replace(' ', '_')}_{trip.duration_days}Days.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/export")
async def export_itinerary_pdf(trip: ItineraryResponse):
    """
    Generate and stream an editorial travel guide PDF directly from client itinerary JSON.
    """
    try:
        pdf_bytes = pdf_service.generate_pdf(trip)
        safe_filename = f"Roamwise_{trip.destination.replace(' ', '_')}_{trip.duration_days}Days.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")
