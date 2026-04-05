
**MUIP**
Mysuru Urban Intelligence Platform

**PRD 2 — CITIZEN DASHBOARD**
**CityMind AI Chatbot — Feature Addendum**
Version 2.0  |  Status: Ready for Build  |  Team QUINTUS

**Project**
Mysuru Urban Intelligence Platform (MUIP)
**Document Type**
Product Requirements Document — Feature Addendum
**Scope**
CityMind AI Chatbot — 3 New Features
**Version**
2.0 (Extends PRD 2 v1.0)
**Team**
QUINTUS
**Target Route**
/citizen/chat — CityMind AI Chatbot
**Depends On**
PRD 1 (Backend) + PRD 2 v1.0 (Citizen Dashboard)

**§0  ****Overview & Purpose**

This document defines three new features to be added to the CityMind AI Chatbot (Section 5 of PRD 2). These features extend the existing chatbot at /citizen/chat without modifying any other part of the Citizen Dashboard. All three features are additive — they do not replace or alter existing chatbot behavior.

**New Features at a Glance**
Feature 1 — PDF Letter Generation  :  Chatbot collects citizen info conversationally, generates a draft permission letter, exports as PDF, then shows route to the relevant government office on the map.
Feature 2 — Multi-Language Support  :  CityMind communicates in English, Kannada, and Hindi. Language auto-detected and user-switchable.
Feature 3 — Smart Permission Recommendation  :  When a citizen says they want to take permission for an event, CityMind presents the full government approval hierarchy for Mysuru.

All existing features from PRD 2 v1.0 remain unchanged. The system prompt, SSE streaming, session management, localStorage keys, and form integration described in PRD 2 §5 continue to apply.

**§1  ****Feature 1 — PDF Letter Generation via Chat**

## **1.1  What This Feature Does**
When a citizen tells CityMind they want to apply for permission for an event (procession, activist rally, road blockage, etc.), CityMind enters a guided "letter drafting flow". It collects required information one question at a time, drafts a formal application letter, generates a downloadable PDF, and then shows the citizen exactly where to physically submit it — with a map route.

## **1.2  Trigger Conditions**
CityMind enters the PDF drafting flow when the user's message matches any of these intent patterns:
- Explicit request: "I want to write a letter", "help me apply for permission", "draft a letter for me"
- Event-type mention: "procession permission", "rally application", "road blockage request"
- After Smart Permission Recommendation (Feature 3) — if user says "yes, help me apply"

**Implementation Note**
Detect these intents in the system prompt. When triggered, CityMind must respond: "I'll help you draft the application letter. I'll ask you a few questions — answer one at a time." Then begin the collection flow below.

## **1.3  Information Collection Flow**
CityMind collects the following fields ONE AT A TIME through natural conversation. It must not ask multiple questions at once. After each answer, it briefly acknowledges before asking the next question.

**Field**
**Type**
**Required**
**Notes / Options**
Applicant Full Name
Text
Yes
Ask: "First, what is your full name?"
Purpose / Event Type
Select
Yes
Procession / Activist Rally / Road Blockage / Public Meeting / Other — ask in plain language
Date of Event
Date
Yes
Must be a future date. Reject past dates politely.
Start Time
Time
Yes
Ask: "What time will it start?"
Estimated End Time
Time
Yes
Ask: "When do you expect it to end?"
Starting Point
Text
Yes
Ask: "Where will it start from?"
Destination / End Point
Text
Yes
Ask: "Where will it end?"
Route Description
Textarea
Yes
Ask: "Please describe the route — which roads or areas will be covered?"
Approx. Participant Count
Number
Yes
Ask: "How many people do you expect to participate?"
Contact Mobile Number
Text
Yes
10-digit Indian mobile number. Validate format.
Additional Notes
Text
No
Ask: "Is there anything else important to mention?" — optional, skip if user says no.

## **1.4  Review & Confirmation**
After collecting all fields, CityMind presents a formatted summary in the chat as a readable list. It then asks: "Does everything look correct? I'll generate your letter now." If the user says no, ask which field to change and update it.

## **1.5  PDF Generation — Frontend**
When the user confirms, the frontend calls a new API endpoint (see §1.7). A loading indicator appears in the chat bubble: "Generating your letter..." with a spinner. On success, CityMind's next message renders a download card in the chat:

**Chat Download Card Component**
Icon: document/PDF icon
Title: "Application Letter — [Event Type]"
Subtitle: "Ref: [reference_number]  |  Generated: [timestamp]"
Primary button: [Download PDF] — triggers file download
Secondary button: [Show Route to Office] — triggers map display (§1.6)

## **1.6  Map Route Display (Post-Download)**
After the PDF is downloaded (or when the user clicks "Show Route to Office"), the chat page's right panel switches to a mini embedded Leaflet.js map (replaces or overlays the chat input area temporarily).

The map shows:
- User's current location (requested via browser Geolocation API — if denied, default to Mysuru Palace Circle)
- Destination marker: the relevant government office for the event type
- A route line between the two points (use OpenRouteService API or static directions URL)

**Event Type**
**Government Office**
**Map Coordinates**
Procession / Rally
SP Office, Devaraja Urs Rd
12.3052° N, 76.6553° E
Road Blockage
MCC Office, Sayyaji Rao Rd
12.3084° N, 76.6520° E
Public Meeting
SP Office (same as above)
12.3052° N, 76.6553° E

CityMind's message below the map card reads: "Here is the route to [Office Name]. You can use Google Maps for turn-by-turn navigation." Include a hyperlink: Open in Google Maps (linked to google.com/maps/dir/?api=1&destination=[lat,lng]).

## **1.7  PDF Letter Specification**
The generated PDF is an A4, print-ready draft application letter — NOT the official form (that is handled by /citizen/forms). This is a draft cover letter for informal submission assistance.

- Format: A4, 20mm margins, Helvetica font
- Header: 'To, The Superintendent of Police / MCC Commissioner [based on event type], Mysuru'
- Subject line: 'Application for Permission — [Event Type] on [Date]'
- Body: 3 paragraphs — introduction (name/address), event details (date/time/route/participants), request and declaration
- Footer: 'Draft generated by MUIP CityMind AI | muip.in | Ref: [ref_number]'
- Watermark text: 'DRAFT — For Reference Only'

## **1.8  New API Endpoint**
**POST /api/v1/citizen/generate-letter**
Request body: { session_id: str, form_data: { name, purpose, date, start_time, end_time, from_location, to_location, route, participant_count, mobile, notes } }
Response: { reference_number: str, pdf_url: str, office_name: str, office_lat: float, office_lng: float, office_address: str }
PDF stored at: /backend/storage/letters/{reference_number}.pdf
Accessible via: GET /api/v1/citizen/letters/{reference_number}/pdf
Implementation: ReportLab (same stack as existing form PDFs in PRD 2 §7)

**§2  ****Feature 2 — Multi-Language Support (English / Kannada / Hindi)**

## **2.1  Scope**
CityMind must be able to communicate in three languages: English (default), Kannada (ಕನ್ನಡ), and Hindi (हिन्दी). Language support applies to the entire CityMind conversation — responses, prompts, suggested questions, download card text, and map labels generated by the chatbot.

**Out of Scope**
The rest of the Citizen Dashboard UI (nav, forms, map panel) continues to support English and Kannada only as defined in PRD 2 v1.0 §10. Hindi is chatbot-only.
The existing Kannada UI label toggle (muip_lang key) is unchanged.

## **2.2  Language Detection**
CityMind auto-detects the user's language from their first message using Unicode script ranges:
- Kannada script (U+0C80–U+0CFF detected) → respond in Kannada
- Devanagari script (U+0900–U+097F detected) → respond in Hindi
- Latin script or ambiguous → respond in English (default)

Detection happens in the frontend before sending to the backend. The detected language_code ('en' | 'kn' | 'hi') is passed in the API request body alongside the messages array.

## **2.3  Language Switcher UI**
A language selector is shown inside the chat header bar (above the message thread), separate from the global MUIP nav language toggle. It has three pill buttons:
- EN  |  ಕನ್ನಡ  |  हिन्दी
Active pill: filled blue background. Inactive: ghost/outline. Switching language:
- Stores preference in localStorage key muip_chat_lang ('en' | 'kn' | 'hi')
- Overrides auto-detection for the remainder of the session
- Does not clear the existing conversation — CityMind's NEXT response adopts the new language

## **2.4  System Prompt Additions**
Append the following instructions to the existing CityMind system prompt (§5 of PRD 2 v1.0). These are injected dynamically based on language_code:

**lang**
**Injected System Prompt Instruction**
en
Respond in English throughout this conversation.
kn
Respond entirely in Kannada script. Use simple, everyday Kannada — not overly formal. All questions in the PDF letter flow must also be in Kannada.
hi
Respond entirely in Hindi (Devanagari script). Use simple, everyday Hindi. All questions in the PDF letter flow must also be in Hindi.

## **2.5  Suggested Questions — Translations**
The empty-state suggested question chips must appear in the active language:

**English**
**Kannada**
**Hindi**
What roads are blocked?
ಯಾವ ರಸ್ತೆಗಳು ಮುಚ್ಚಿವೆ?
कौन सी सड़कें बंद हैं?
Procession permission?
ಮೆರವಣಿಗೆ ಅನುಮತಿ?
जुलूस की अनुमति?
Dasara traffic impact?
ದಸರಾ ಟ್ರಾಫಿಕ್ ಪರಿಣಾಮ?
दशहरा ट्रैफिक प्रभाव?
Flood risk wards?
ಪ್ರವಾಹ ಅಪಾಯದ ವಾರ್ಡ್?
बाढ़ जोखिम वाले वार्ड?
Help me apply
ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಸಹಾಯ
आवेदन में मदद करें

## **2.6  Updated localStorage Keys**
Add the following new key to the existing localStorage schema (PRD 2 v1.0 §14):
- muip_chat_lang  →  'en' | 'kn' | 'hi'  (default: 'en')

## **2.7  Updated API Request Schema**
Extend the existing POST /api/v1/citizen/chat request body (PRD 2 v1.0 §8) with one new field:
**Updated Chat Request Body**
{ messages: [{role, content}], session_id: str, active_form: str|null, city_context: {...}, language_code: 'en'|'kn'|'hi' }
Backend uses language_code to select the correct system prompt language injection (§2.4 above).
If language_code is absent, backend defaults to 'en'.

**§3  ****Feature 3 — Smart Permission Recommendation**

## **3.1  What This Feature Does**
When a citizen expresses intent to obtain a government permission for an event (in any of the three supported languages), CityMind automatically presents a structured government approval hierarchy — showing exactly which offices are involved, in what order, and what each step entails. This helps citizens understand the bureaucratic path before they apply.

## **3.2  Trigger Detection**
CityMind activates the permission recommendation response when it detects phrases matching the following intent — across all three languages:

**English Trigger Phrases**
**Kannada Trigger Phrases**
**Hindi Trigger Phrases**
I want to take permission
ಅನುಮತಿ ತೆಗೆದುಕೊಳ್ಳಲು ಬಯಸುತ್ತೇನೆ
मुझे अनुमति लेनी है
I need permission for...
ನನಗೆ ಅನುಮತಿ ಬೇಕು
अनुमति चाहिए
How to get permission
ಅನುಮತಿ ಹೇಗೆ ಪಡೆಯುವುದು
अनुमति कैसे लें
Apply for event permission
ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಅರ್ಜಿ
कार्यक्रम के लिए आवेदन
Permission for rally / march
ರ್ಯಾಲಿಗೆ ಅನುಮತಿ
रैली की अनुमति

These triggers are embedded in the system prompt as recognizable intent patterns. CityMind does NOT rely on keyword matching — it uses its language understanding to identify permission-seeking intent even when phrased differently.

## **3.3  Permission Hierarchy — By Event Type**
When the trigger is detected, CityMind first asks: "What kind of event are you planning?" and presents options. Based on the response, it shows the appropriate hierarchy:

### **3.3.1  Procession / Activist Rally / Public March**
**Government Approval Hierarchy — Procession / Rally**
Step 1 — Office of the Superintendent of Police (SP), Mysuru
Submit application here. Address: Devaraja Urs Road, Mysuru - 570001
Role: Receives application, initiates formal review process.

Step 2 — Inspector In-Charge (IIC), Local Police Station
SP forwards application to the police station of the area where the event will occur.
Role: Field verification — checks route safety, population density, prior incidents.

Step 3 — Sub-Divisional Police Officer (SDPO)
IIC report is forwarded here for sub-divisional review.
Role: Intermediate approval authority. May add conditions.

Step 4 — Superintendent of Police (SP) — Final Authority
SDPO's recommendation returns to SP.
Role: Grants or denies the license. Issues formal permission letter with conditions.

### **3.3.2  Road Blockage / Temporary Road Closure**
**Government Approval Hierarchy — Road Blockage**
Step 1 — MCC Engineering Department, Mysuru City Corporation
Address: MCC Head Office, Sayyaji Rao Road, Mysuru - 570021
Role: Receives closure request, assigns traffic engineer for assessment.

Step 2 — Ward Engineer / Zonal Engineer
Conducts physical site inspection of proposed closure area.
Role: Assesses traffic impact, alternative routes, drain/utility impact.

Step 3 — City Traffic Police (if on a major road)
For closures on arterial/major roads, police NOC is mandatory.
Address: Mysuru City Traffic Police, Bannimantap

Step 4 — MCC Commissioner (for full closures > 3 days)
Extended or full closures require Commissioner-level sign-off.
Role: Final authority for significant road blockages.

### **3.3.3  Loudspeaker / Sound System Permission**
**Government Approval Hierarchy — Loudspeaker**
Step 1 — Office of the Deputy Commissioner of Police / SP, Mysuru
Same office as procession permissions.
Role: Single-window for loudspeaker applications.

Step 2 — Local Police Station Verification
IIC verifies proximity to hospitals, schools, silence zones.

Step 3 — SP / DCP — Final Authority
Grants permission with time and decibel restrictions per High Court order.
Conditions: Must comply with HC-mandated dB limits (45 dB day / 35 dB night in silence zones)

## **3.4  Visual Hierarchy Card in Chat**
CityMind renders the hierarchy as a structured card component inside the chat (not just plain text). The card is rendered as an HTML component within the chat message bubble:
- Each step is a numbered row with a color-coded badge (Step 1 = blue, Step 2 = teal, etc.)
- Office name is bold, address is muted text below
- Role description in regular text
- Arrow connector between steps
- Final step has a green 'Final Authority' badge

## **3.5  Follow-up CTA**
After presenting the hierarchy, CityMind always appends one of these follow-up messages (in the active language):
- EN: "Would you like me to help you draft the application letter? I can collect the details and generate a PDF for you."
- KN: "ನಾನು ಅರ್ಜಿ ಪತ್ರ ತಯಾರು ಮಾಡಲು ಸಹಾಯ ಮಾಡಲೇ? PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದು."
- HI: "क्या मैं आपका आवेदन पत्र तैयार करने में मदद करूं? मैं PDF बना सकता हूं।"

If the citizen responds affirmatively, CityMind immediately begins the PDF Letter Generation flow (Feature 1, §1.3).

**§4  ****Backend Changes & New Endpoints**

## **4.1  Updated System Prompt (Full Replacement)**
Replace the system prompt in /api/v1/citizen/chat (PRD 2 v1.0 §5) with the following extended version. Changes are marked with [NEW]:

**System Prompt — Full Updated Version**
You are CityMind, the official AI assistant for the Mysuru Urban Intelligence Platform (MUIP). You help ordinary citizens of Mysuru, Karnataka understand:

1. What is happening in their city right now (based on data you are given in the conversation)
2. How urban planning decisions affect their daily life — traffic, roads, construction, events like Dasara
3. How to fill out civic forms for procession permissions, road closure requests, construction notices, and loudspeaker permissions
4. General information about Mysuru city, its wards, landmarks, and municipal systems
5. How to navigate government services relevant to urban life in Mysuru

[NEW] LANGUAGE: {LANGUAGE_INSTRUCTION} — respond ONLY in this language throughout.

[NEW] PDF LETTER FLOW: If the user wants to draft an application letter, collect: full name, purpose/event type, date, start time, end time, starting point, destination, route description, participant count, mobile number, additional notes — ONE question at a time. After all fields are collected, present a summary and confirm before instructing the frontend to generate the PDF.

[NEW] PERMISSION HIERARCHY: If the user expresses intent to 'take permission' or 'apply for permission', first ask what type of event, then present the full government approval hierarchy for that event type (SP → IIC → SDPO → SP for processions; MCC → Ward Engineer → Traffic Police → MCC Commissioner for road blockage; SP/DCP for loudspeakers). Always offer to draft the letter next.

You are NOT able to: approve applications, access individual citizen data, make government decisions, or provide legal advice.

## **4.2  New Letter Generation Endpoint**
**POST /api/v1/citizen/generate-letter**
Auth: None (public endpoint)
File: backend/app/api/v1/citizen.py

Request: {
session_id: str,
language_code: 'en' | 'kn' | 'hi',
form_data: {
name: str, purpose: str, date: str, start_time: str, end_time: str,
from_location: str, to_location: str, route: str,
participant_count: int, mobile: str, notes: str | null
}
}

Response: {
reference_number: str (format: LTR-YYYYMMDD-XXXX),
pdf_url: str (/api/v1/citizen/letters/{ref}/pdf),
office_name: str,
office_address: str,
office_lat: float,
office_lng: float
}

PDF storage: /backend/storage/letters/{reference_number}.pdf
Implementation: ReportLab (same as existing form PDFs)

## **4.3  Letter PDF Retrieval Endpoint**
**GET /api/v1/citizen/letters/{reference_number}/pdf**
Auth: None
Response: PDF file (Content-Type: application/pdf, Content-Disposition: attachment)
404 if reference_number not found

**§5  ****Frontend Component Specification**

## **5.1  Language Switcher Component**
Location: Inside the CityMind chat page header bar (/citizen/chat), right-aligned above the message thread.

- Component: <LanguageSwitcher /> — three pill buttons
- Props: activeLanguage ('en'|'kn'|'hi'), onChange callback
- On change: updates localStorage muip_chat_lang, updates language_code sent in subsequent API calls
- Pill labels: 'EN' | 'ಕನ್ನಡ' | 'हिन्दी'
- Styling: matches existing chat header design system (government blue accent)

## **5.2  PDF Download Card Component**
Location: Rendered inside a CityMind chat message bubble after letter generation.

- Component: <LetterDownloadCard /> — full-width card inside assistant bubble
- Props: referenceNumber, pdfUrl, officeName, officeLat, officeLng, officeAddress
- State: downloaded (bool) — tracks if PDF has been downloaded
- [Download PDF] button: calls GET /api/v1/citizen/letters/{ref}/pdf, triggers file download
- [Show Route to Office] button: triggers <MiniMap /> component

## **5.3  Mini Map Component**
Location: Appears below the chat input bar (or in an overlay panel) when the route button is clicked.

- Component: <OfficeRouteMap /> — 300px height Leaflet.js embedded map
- Behavior: requests user geolocation → if granted, shows route from user to office; if denied, shows only office marker with address label
- Always shows: office marker with name label, 'Open in Google Maps' link
- Dismissible: 'Close Map' button or clicking outside

## **5.4  Permission Hierarchy Card Component**
Location: Rendered inside a CityMind chat message bubble when Smart Permission Recommendation triggers.

- Component: <PermissionHierarchyCard /> — structured step card
- Props: eventType, steps (array of { stepNumber, officeName, address, role, isFinal })
- Each step: numbered badge (government blue) + office name (bold) + role description + address (muted)
- Connector: vertical line between steps (CSS border-left)
- Final step: green 'Final Authority' badge
- Footer: CTA button — 'Help Me Draft Application Letter' — triggers PDF letter flow

**§6  ****Testing & Acceptance Criteria**

## **Feature 1 — PDF Generation**
- CityMind collects all required fields one at a time (never multiple questions simultaneously)
- PDF generates within 5 seconds of user confirmation
- Downloaded PDF is valid A4 format with all collected data correctly populated
- 'Draft' watermark is visible on the PDF
- Map shows correct government office for each event type
- Google Maps link opens with correct destination coordinates

## **Feature 2 — Multi-Language**
- Auto-detection correctly identifies Kannada from Kannada script input
- Auto-detection correctly identifies Hindi from Devanagari script input
- Language switcher persists language across new messages in the same session
- All PDF flow questions appear in the selected language
- Suggested question chips update language when switcher is toggled
- Language preference persists in localStorage across page refresh

## **Feature 3 — Permission Recommendation**
- Trigger fires for permission-seeking intent in all three languages
- Correct hierarchy is shown for each of the three event categories
- Hierarchy card renders correctly in the chat bubble
- CTA at the bottom links to PDF letter flow
- Clicking 'Help Me Draft' seamlessly begins the collection flow from §1.3

**§7  ****Constraints & What Must Not Change**

The following elements from PRD 2 v1.0 must NOT be modified by this addendum:
- The existing /citizen/forms flow, form fields, and form PDF generation
- The global MUIP language toggle (English/Kannada nav labels)
- The City Map page (/citizen/map) — no changes
- The localStorage keys defined in PRD 2 v1.0 §14 (only muip_chat_lang is added)
- The SSE streaming architecture for the chat API
- The existing system prompt knowledge base — only appended, not replaced
- The CityMind avatar, message bubble styling, and session management behavior

**PRD 2 v2.0 — End of Document**
Team QUINTUS | PESCE Mandya | Mysuru Urban Intelligence Platform