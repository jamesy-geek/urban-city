from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
import json
import asyncio
import os

app = FastAPI(title="MUIP Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
LETTERS_DIR = os.path.join(os.path.dirname(__file__), "storage", "letters")
os.makedirs(LETTERS_DIR, exist_ok=True)

# Mock data for alerts
MOCK_ALERTS = [
    {
        "id": "a1",
        "title": "Road Block: KR Circle to Devaraja Market",
        "severity": "CRITICAL",
        "type": "ROAD_BLOCK",
        "description": "Complete closure for road resurfacing.",
        "ward_name": "Devaraja Mohalla",
        "lat": 12.305,
        "lng": 76.655,
        "posted_at": (datetime.now()).isoformat(),
        "until": "2026-04-10"
    },
    {
        "id": "a2",
        "title": "Major Construction: Chamundi Hill Road",
        "severity": "HIGH",
        "type": "CONSTRUCTION",
        "description": "Retaining wall construction near viewpoint.",
        "ward_name": "Chamundi Hill",
        "lat": 12.275,
        "lng": 76.671,
        "posted_at": (datetime.now()).isoformat(),
        "until": "2026-05-15"
    }
]

@app.get("/api/v1/citizen/city-status")
async def get_city_status():
    return {
        "last_updated": datetime.now().isoformat(),
        "active_alerts": MOCK_ALERTS,
        "summary": {
            "total_alerts": len(MOCK_ALERTS),
            "road_blocks": 1,
            "construction_zones": 1,
            "flood_warnings": 0,
            "events": 0
        }
    }

@app.get("/api/v1/alerts/active")
async def get_active_alerts():
    return MOCK_ALERTS

@app.post("/api/v1/citizen/chat")
async def chat(request: dict):
    # PRD v2.1: Extract language code
    language_code = request.get("language_code", "en")
    
    # Simple mocked responses based on language
    # For a real implementation, Anthropic API would be called.
    messages = {
        "en": ["Hello!", " I am CityMind,", " your Mysuru urban assistant.", " I can help you draft letters or answer questions."],
        "kn": ["ನಮಸ್ಕಾರ!", " ನಾನು ಸಿಟಿಮೈಂಡ್,", " ನಿಮ್ಮ ಮೈಸೂರು ಸಹಾಯಕ.", " ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ."],
        "hi": ["नमस्ते!", " मैं सिटीमाइंड हूँ,", " आपका मैसूर शहरी सहायक।", " मैं आपकी क्या मदद कर सकता हूँ?"]
    }
    
    # If standard user message asking for permission (mock triggering feature 3 or 1)
    # The actual implementation would have Claude generate the specific structured hierarchy JSON or something similar that the frontend parses. Wait, the PRD says the card is an HTML component within the chat message bubble, or maybe the frontend detects it. We'll just stream text for the mock.
    last_user_msg = ""
    if "messages" in request and len(request["messages"]) > 0:
        last_user_msg = request["messages"][-1].get("content", "").lower()
    
    reply = messages.get(language_code, messages["en"])
    
    if "permission" in last_user_msg or "ಅನುಮತಿ" in last_user_msg or "अनुमति" in last_user_msg:
         if language_code == "en":
              reply = ["For a procession permission, you need:", " Step 1: SP Office.", " Step 2: Local Police Station.", " Shall I help you draft the application letter?"]
         elif language_code == "kn":
              reply = ["ಮೆರವಣಿಗೆ ಅನುಮತಿಗೆ:", " ಹಂತ 1: SP ಕಚೇರಿ.", " ಹಂತ 2: ಸ್ಥಳೀಯ ಠಾಣೆ.", " ನಾನು ಅರ್ಜಿ ಪತ್ರ ತಯಾರು ಮಾಡಲು ಸಹಾಯ ಮಾಡಲೇ?"]
         else:
              reply = ["जुलूस अनुमति के लिए:", " चरण 1: SP कार्यालय।", " क्या मैं आपका आवेदन पत्र तैयार करने में मदद करूं?"]

    async def event_generator():
        for msg in reply:
            yield f"data: {json.dumps({'type': 'token', 'content': msg})}\n\n"
            await asyncio.sleep(0.1)
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# PDF Letter Generation Flow (PRD v2.1)
class LetterFormData(BaseModel):
    name: str
    purpose: str
    date: str
    start_time: str
    end_time: str
    from_location: str
    to_location: str
    route: str
    participant_count: int
    mobile: str
    notes: Optional[str] = None

class GenerateLetterRequest(BaseModel):
    session_id: str
    language_code: str = "en"
    form_data: LetterFormData

@app.post("/api/v1/citizen/generate-letter")
async def generate_letter(request: GenerateLetterRequest):
    ref_number = f"LTR-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    
    # Feature 1.6 Map Data Mock
    # Procession maps to SP Office
    office_name = "Office of the Superintendent of Police"
    office_address = "Devaraja Urs Road, Mysuru - 570001"
    office_lat = 12.3052
    office_lng = 76.6553
    
    if request.form_data.purpose.lower() == "road blockage":
        office_name = "MCC Engineering Department"
        office_address = "MCC Head Office, Sayyaji Rao Road, Mysuru - 570021"
        office_lat = 12.3084
        office_lng = 76.6520

    # Create dummy PDF file
    dummy_pdf_path = os.path.join(LETTERS_DIR, f"{ref_number}.pdf")
    with open(dummy_pdf_path, "w") as f:
        f.write("%PDF-1.4\n%Dummy PDF for " + ref_number)

    return {
        "reference_number": ref_number,
        "pdf_url": f"/api/v1/citizen/letters/{ref_number}/pdf",
        "office_name": office_name,
        "office_address": office_address,
        "office_lat": office_lat,
        "office_lng": office_lng
    }

@app.get("/api/v1/citizen/letters/{reference_number}/pdf")
async def get_letter_pdf(reference_number: str):
    file_path = os.path.join(LETTERS_DIR, f"{reference_number}.pdf")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF completely not found")
    
    return FileResponse(
        path=file_path, 
        media_type="application/pdf", 
        filename=f"Application_{reference_number}.pdf",
        content_disposition_type="attachment"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
