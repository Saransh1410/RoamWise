import io
from typing import List
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.pdfgen import canvas
from app.schemas.itinerary import ItineraryResponse


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print total page numbers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#78716C"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "ROAMWISE AI  |  EDITORIAL TRAVEL JOURNAL")
            self.setStrokeColor(colors.HexColor("#E7E0D8"))
            self.setLineWidth(0.5)
            self.line(54, 742, letter[0] - 54, 742)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(letter[0] - 54, 36, footer_text)
        self.drawString(54, 36, "Roamwise AI — Curated Travel Itinerary Planner")
        self.setStrokeColor(colors.HexColor("#E7E0D8"))
        self.setLineWidth(0.5)
        self.line(54, 48, letter[0] - 54, 48)
        
        self.restoreState()


class PDFService:
    def generate_pdf(self, trip: ItineraryResponse) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54,
        )

        styles = getSampleStyleSheet()
        
        # Editorial Style Definitions
        title_style = ParagraphStyle(
            "EditorialTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=32,
            textColor=colors.HexColor("#1C1917"),
            spaceAfter=4,
        )
        
        tagline_style = ParagraphStyle(
            "EditorialTagline",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=13,
            leading=18,
            textColor=colors.HexColor("#B84B24"),
            spaceAfter=12,
        )

        brand_badge = ParagraphStyle(
            "BrandBadge",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#2D4A3E"),
            spaceAfter=6,
        )

        body_style = ParagraphStyle(
            "EditorialBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=15,
            textColor=colors.HexColor("#44403C"),
            spaceAfter=10,
        )

        h2_style = ParagraphStyle(
            "SectionH2",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#1C1917"),
            spaceBefore=14,
            spaceAfter=8,
        )

        h3_style = ParagraphStyle(
            "SectionH3",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=colors.HexColor("#2D4A3E"),
            spaceBefore=8,
            spaceAfter=4,
        )

        tip_style = ParagraphStyle(
            "TipStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#78350F"),
        )

        transit_style = ParagraphStyle(
            "TransitStyle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#475569"),
        )

        story = []

        # --- Brand Header ---
        story.append(Paragraph("ROAMWISE AI &bull; CURATED TRAVEL EDITION", brand_badge))
        story.append(Paragraph(trip.title, title_style))
        story.append(Paragraph(trip.tagline, tagline_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E7E0D8"), spaceAfter=14))

        # --- Executive Overview & Meta Box ---
        overview_text = trip.overview
        story.append(Paragraph(overview_text, body_style))
        story.append(Spacer(1, 6))

        # Meta Info Table
        meta_data = [
            [
                Paragraph("<b>Destination:</b>", body_style),
                Paragraph(f"{trip.destination}, {trip.country}", body_style),
                Paragraph("<b>Duration:</b>", body_style),
                Paragraph(f"{trip.duration_days} Days", body_style),
            ],
            [
                Paragraph("<b>Best Time:</b>", body_style),
                Paragraph(trip.best_time_to_visit, body_style),
                Paragraph("<b>Estimated Budget:</b>", body_style),
                Paragraph(f"{trip.currency} {trip.estimated_total_cost:,.2f}", body_style),
            ],
            [
                Paragraph("<b>Weather:</b>", body_style),
                Paragraph(trip.weather_summary, body_style),
                Paragraph("<b>Generated:</b>", body_style),
                Paragraph(trip.created_at[:10], body_style),
            ]
        ]
        meta_table = Table(meta_data, colWidths=[100, 150, 110, 144])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FAF8F5")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E7E0D8")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#F0EAE1")),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 16))

        # --- Day by Day Itinerary ---
        story.append(Paragraph("Daily Itinerary & Journal", h2_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#C85A32"), spaceAfter=12))

        for day in trip.days:
            day_elements = []
            day_elements.append(Paragraph(f"Day {day.day_number}: {day.theme}", h3_style))
            day_elements.append(Paragraph(day.summary, body_style))
            
            # Activities in this day
            for act in day.activities:
                slot_label = act.time_slot.upper()
                cost_label = f"{act.currency} {act.estimated_cost:.0f}" if act.estimated_cost > 0 else "Free / Included"
                act_header = f"<b>[{slot_label}] {act.title}</b> &mdash; <i>{act.location_name}</i> ({cost_label})"
                day_elements.append(Paragraph(act_header, body_style))
                day_elements.append(Paragraph(act.description, body_style))
                
                if act.insider_tip:
                    tip_box_data = [[
                        Paragraph(f"<b>Insider Tip:</b> {act.insider_tip}", tip_style)
                    ]]
                    tip_table = Table(tip_box_data, colWidths=[504])
                    tip_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
                        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#FDE68A")),
                        ('TOPPADDING', (0, 0), (-1, -1), 4),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                        ('LEFTPADDING', (0, 0), (-1, -1), 8),
                    ]))
                    day_elements.append(tip_table)
                    day_elements.append(Spacer(1, 4))
                
                if act.travel_to_next:
                    transit_text = f"&bull; <i>Transit to next:</i> {act.travel_to_next.mode} (~{act.travel_to_next.duration_minutes} min) &mdash; {act.travel_to_next.guidance}"
                    day_elements.append(Paragraph(transit_text, transit_style))
                    day_elements.append(Spacer(1, 4))
            
            # Dining recommendations for this day
            if day.recommended_dining:
                dining_intro = "<b>Curated Dining:</b> " + ", ".join([
                    f"{d.meal_type.capitalize()}: {d.name} ({d.cuisine}, {d.price_level} &mdash; <i>{d.must_try_dish}</i>)"
                    for d in day.recommended_dining
                ])
                day_elements.append(Spacer(1, 4))
                day_elements.append(Paragraph(dining_intro, transit_style))

            day_elements.append(Spacer(1, 10))
            day_elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E7E0D8"), spaceAfter=10))
            story.append(KeepTogether(day_elements))

        # --- Lodging Suggestions ---
        if trip.lodging_suggestions:
            lodging_elements = [
                Paragraph("Curated Stays & Lodging", h2_style),
                HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#2D4A3E"), spaceAfter=8)
            ]
            lodging_rows = [
                [
                    Paragraph("<b>Property</b>", body_style),
                    Paragraph("<b>Neighborhood & Style</b>", body_style),
                    Paragraph("<b>Estimated Rate</b>", body_style),
                    Paragraph("<b>Why We Recommend</b>", body_style)
                ]
            ]
            for stay in trip.lodging_suggestions:
                lodging_rows.append([
                    Paragraph(f"<b>{stay.name}</b>", body_style),
                    Paragraph(f"{stay.neighborhood}<br/><i>{stay.style}</i>", body_style),
                    Paragraph(stay.price_per_night, body_style),
                    Paragraph(stay.why_stay_here, body_style),
                ])
            l_table = Table(lodging_rows, colWidths=[120, 130, 84, 170])
            l_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EAE5DD")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#D3CBC0")),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#EAE5DD")),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            lodging_elements.append(l_table)
            lodging_elements.append(Spacer(1, 14))
            story.append(KeepTogether(lodging_elements))

        # --- Customs & Packing Section ---
        guide_elements = [
            Paragraph("Traveler's Field Notes & Essentials", h2_style),
            HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#D4973B"), spaceAfter=8)
        ]
        
        tips_paragraphs = "<br/>".join([f"&bull; {c}" for c in trip.local_customs_tips])
        pack_paragraphs = "<br/>".join([f"&bull; {p}" for p in trip.packing_essentials])
        
        guide_table_data = [
            [
                Paragraph("<b>Local Customs & Etiquette:</b><br/>" + tips_paragraphs, body_style),
                Paragraph("<b>Packing Essentials:</b><br/>" + pack_paragraphs, body_style),
            ]
        ]
        g_table = Table(guide_table_data, colWidths=[250, 254])
        g_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FAF8F5")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E7E0D8")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E7E0D8")),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        guide_elements.append(g_table)
        story.append(KeepTogether(guide_elements))

        # Build document
        doc.build(story, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes


pdf_service = PDFService()
