# PRD 2: MUIP Citizen Dashboard — Public Portal
**Project:** Mysuru Urban Intelligence Platform — Citizen Face  
**Team:** QUINTUS  
**Version:** 1.0  
**Target Agent:** Antigravity (VS Code)  
**Depends on:** PRD 1 (build PRD 1 backend first — this portal uses the same backend)  
**Status:** Ready for Build  

---

## INSTRUCTION TO ANTIGRAVITY

This PRD defines the Citizen Dashboard — the public-facing portion of MUIP. It lives at `/citizen/*` routes in the same Next.js app as the Government Dashboard (PRD 1). It uses the same FastAPI backend but only calls public API endpoints (no auth required). Build everything in this document exactly as described. Do not add features not listed here. Do not ask for clarification.

---

## 1. What This Is

The Citizen Dashboard gives ordinary Mysuru residents read-only visibility into what is happening in their city right now — road blocks, construction, events, flood warnings. They cannot simulate anything. They cannot see government analytics.

Additionally, citizens can:
1. Talk to an AI assistant ("CityMind") that answers questions about Mysuru and helps them understand and fill out civic forms
2. Fill out pre-built digital versions of official Mysuru/Karnataka civic forms
3. Download a print-ready PDF of any filled form, formatted to match what they must physically submit to the relevant government office

**Access rules:**
- No login required for any part of the Citizen Dashboard
- Citizens can see: active alerts, current road blocks/construction, ward map
- Citizens cannot see: simulation controls, simulation history, analytics, government form submissions, other citizens' form data

---

## 2. Design System

Different from the Government Dashboard. Must feel approachable, civic, and clean — not a dark command center.

- **Aesthetic:** Clean civic design. Light background with strong color accents. Feels like an honest government service, not a startup. Trustworthy.
- **Font:** `DM Sans` (headings) + `DM Mono` (data/codes)
- **Colors:**
  - Background: `#f8fafc`
  - Surface: `#ffffff`
  - Border: `#e2e8f0`
  - Primary accent: `#1d4ed8` (government blue)
  - Secondary: `#0891b2` (teal)
  - Warning: `#d97706` (amber)
  - Danger: `#dc2626` (red)
  - Success: `#16a34a` (green)
  - Text primary: `#0f172a`
  - Text muted: `#64748b`
- **Motif:** Subtle dot-grid background texture. Clean card surfaces with soft shadows. Status badges with clear color coding.
- **Motion:** Subtle fade-ins, smooth accordion opens, form field focus animations. No excessive animation.

---

## 3. Page Layout

### Persistent Header (all citizen pages)
- Left: "MUIP" wordmark + "Mysuru Urban Intelligence" subtitle
- Center: Nav links — City Map | CityMind AI | Civic Forms
- Right: Language toggle (English / ಕನ್ನಡ — Kannada) — just UI labels, not full translation; labels only
- No login button. No reference to the government dashboard.

### Footer
- "Data sourced from KGIS Karnataka, OpenStreetMap, OpenCity India"
- "Built by Team QUINTUS | PESCE Mandya"
- "For emergencies call: 112 | MUDA Helpline: 0821-2418888"

---

## 4. City Map Page (`/citizen/map`)

### Layout
Full-viewport-height map with a collapsible status panel on the right (360px wide, collapsible to icon-only).

### Map Content
Use the same Leaflet.js map as the government dashboard, but read-only.

**Layers shown to citizens (no toggle — always visible):**
1. Ward boundaries (thin blue outline, ward name label on hover)
2. Active alerts (colored markers — see below)
3. Drain network (thin blue lines, shown only when zoomed in > zoom level 14)

**No visible:** road network layer, simulation results, ML outputs, government analytics.

**Alert Markers:**
- Critical (red pulsing circle): Road completely blocked, flood
- High (solid orange circle): Major construction, high congestion warning
- Medium (yellow circle): Event-related disruption
- Low (gray circle): Minor advisory

Clicking any marker: opens a popup with — title, severity badge, description, affected ward(s), estimated duration ("Until: [date]" or "Ongoing").

### Status Panel (right side, collapsible)
**Header:** "Mysuru City Status — Live" + last updated timestamp (auto-refreshes every 60 seconds)

**Content:**
- Summary bar: X Active Alerts | Y Road Blocks | Z Construction Zones
- Alert list: scrollable, each item has — severity color bar on left, title, ward name, time since posted
- Clicking an alert in the list: flies map to that alert marker
- Filter buttons at top of list: All | Road Block | Construction | Event | Flood

### Real-Time Data Source
- Poll `/api/v1/alerts/active` every 60 seconds
- Poll `/api/v1/citizen/city-status` every 60 seconds
- No WebSocket needed — polling is sufficient
- Show a subtle "Live" green dot that pulses when data refreshed successfully

---

## 5. CityMind AI Chatbot Page (`/citizen/chat`)

### What CityMind Is
CityMind is an AI assistant powered by the Anthropic Claude API (claude-sonnet-4-20250514). It is accessed via `/api/v1/citizen/chat` on the backend, which proxies to the Anthropic API with a system prompt.

### Backend Chat Endpoint (`/api/v1/citizen/chat`)

**Request:** `POST { messages: [{role, content}], session_id: str }`
**Response:** SSE stream of the AI response

**System Prompt (inject this exactly into every API call):**
```
You are CityMind, the official AI assistant for the Mysuru Urban Intelligence Platform (MUIP). You help ordinary citizens of Mysuru, Karnataka understand:

1. What is happening in their city right now (based on data you are given in the conversation)
2. How urban planning decisions affect their daily life — traffic, roads, construction, events like Dasara
3. How to fill out civic forms for things like procession permissions, road closure requests, construction notices, and loudspeaker permissions
4. General information about Mysuru city, its wards, landmarks, and municipal systems
5. How to navigate government services relevant to urban life in Mysuru

You are friendly, helpful, and speak simply. You do not use technical jargon. When helping users fill out forms, ask them one question at a time — do not overwhelm them. Collect all required information through conversation, then tell them to go to the Forms section and fill the digital form.

You have knowledge of:
- Mysuru's 65 wards and their general locations
- Key landmarks: Mysore Palace, KR Hospital, Cheluvamba Hospital, Devaraja Market, Bannimantap KSRTC Terminal, Mysore Railway Station, Chamundi Hill, Narasimharaja Circle
- Dasara festival traffic patterns (October, 7-8 lakh visitors, Jamboo Savari procession from Palace to Bannimantap)
- The Karnataka police procession permission process: apply at the office of the Superintendent of Police, application is forwarded to the concerned Police Station for verification by IIC, then to SDPO, then SP for license grant. Required info: full name/address/phone, date and time, route, participant count, duration, accompaniments (loudspeaker, music, band, dance troops, fireworks, religious symbols). General conditions include keeping left side of road, not stopping except at specified points, following loudspeaker decibel restrictions, no fireworks on public roads without license, no lathis without special permission.
- Mysuru's municipal body is the Mysuru City Corporation (MCC). MUDA handles urban development.
- Emergency: 112 | MUDA: 0821-2418888

You are NOT able to: approve applications, access individual citizen data, make government decisions, provide legal advice. Always direct users to the appropriate government office for official decisions.

Respond in English. If the user writes in Kannada, respond in Kannada.

Current city status will be injected at the start of each conversation as a system message.
```

### Frontend Chat UI
- Chat interface design: WhatsApp-web style layout, but civic color scheme
- Left 35%: Chat history list (show last 10 conversations by session_id stored in localStorage; clicking loads that conversation)
- Right 65%: Active chat
- Message bubbles: user = right-aligned blue, CityMind = left-aligned white with subtle gray border
- CityMind avatar: small circular logo (MUIP icon)
- Input bar at bottom: text input + send button + mic button (mic = placeholder only, show "Coming soon" toast)
- Streaming: stream the AI response token by token using SSE
- Suggested questions displayed when chat is empty:
  - "What roads are blocked in Mysuru right now?"
  - "How do I get permission for a wedding procession?"
  - "What's the impact of Dasara on traffic?"
  - "Which wards are at flood risk during monsoon?"
  - "How do I report a road issue?"
- Context injection: before the first message in each session, make a silent call to `/api/v1/citizen/city-status` and inject the result as the first system message so CityMind knows current alerts

### Session Management
- Generate a UUID session_id on page load, store in localStorage
- Send full conversation history with every request (Claude has no memory between calls)
- Trim history to last 20 messages if conversation grows long
- "New Chat" button clears session and generates new UUID

---

## 6. Civic Forms Page (`/citizen/forms`)

### Layout
- Left sidebar: list of available form types (icons + names)
- Right main area: selected form or instructions
- Default state (no form selected): show "Choose a form to get started" with brief descriptions of each form type

### Available Forms

There are exactly **4 forms**. Do not add more. Do not remove any.

---

#### Form 1: Procession / Public Event Permission

**Form ID:** `procession`  
**Based on:** Karnataka Police Department procession permission application  
**Submit to (shown in instructions):** Office of the Superintendent of Police, Mysuru  
**Physical office address (shown):** Superintendent of Police, Mysuru District, Devaraja Urs Road, Mysuru - 570001

**Fields:**

**Section A — Applicant Details**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | Text | Yes | min 3 chars |
| Organisation Name | Text | No | — |
| Address Line 1 | Text | Yes | — |
| Address Line 2 | Text | No | — |
| City/Town | Text | Yes | default: Mysuru |
| District | Text | Yes | default: Mysuru |
| PIN Code | Text | Yes | 6 digits |
| Telephone Number | Text | No | 10 digits |
| Mobile Number | Text | Yes | 10 digits |
| Email | Email | No | — |

**Section B — Procession Details**
| Field | Type | Required | Options |
|-------|------|----------|---------|
| Type of Procession | Select | Yes | Marriage / Immersion of Idol / Public Meeting / Festival / Religious Procession / Strike / Other |
| Date of Procession | Date | Yes | must be future date |
| Start Time | Time | Yes | — |
| Estimated End Time | Time | Yes | — |
| Starting Point | Text | Yes | — |
| Destination | Text | Yes | — |
| Proposed Route Description | Textarea | Yes | describe the path |
| Approximate Number of Participants | Number | Yes | min 1 |
| Estimated Duration (hours) | Number | Yes | min 0.5 |

**Section C — Accompaniments**
| Field | Type | Required |
|-------|------|----------|
| Loudspeaker / PA System | Checkbox | No |
| Music Band | Checkbox | No |
| Dance Troupe | Checkbox | No |
| Traditional Equipment | Checkbox | No |
| Religious Symbols / Idols | Checkbox | No |
| Fireworks (requires separate license) | Checkbox | No |
| Armed Persons / Lathis (requires special permission) | Checkbox | No |
| Other Accompaniments | Text | No |

**Section D — Declaration**
Single checkbox: "I hereby declare that all information provided is true and correct. I agree to comply with all conditions of the license including keeping to the left side of the road, not stopping except at specified places, following decibel restrictions on loudspeakers, and obtaining separate permissions for fireworks and weapons. I understand that violation of license conditions is a punishable offence."

Required: must check to proceed.

---

#### Form 2: Road Closure Request

**Form ID:** `road_closure_request`  
**Purpose:** For contractors, event organizers, or citizens requesting temporary road closure for construction or events  
**Submit to:** MUDA (Mysuru Urban Development Authority) / MCC Engineering Department  
**Physical address:** MCC Head Office, Sayyaji Rao Road, Mysuru - 570021

**Fields:**

**Section A — Applicant Details**
Same fields as Form 1 Section A.

**Section B — Road Closure Details**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Reason for Closure | Select | Yes | Construction / Event / Utility Work / Emergency Repair / Other |
| Road Name / Segment | Text | Yes | describe the road(s) |
| Ward Number | Number | Yes | 1–65 |
| Ward Name | Text | Yes | — |
| Locality/Area | Text | Yes | — |
| Proposed Closure Date | Date | Yes | future date |
| Proposed Reopening Date | Date | Yes | after closure date |
| Partial or Complete Closure | Radio | Yes | Partial / Complete |
| Alternative Route Proposed | Textarea | Yes | required if complete closure |
| Will drainage/drains be affected? | Radio | Yes | Yes / No |
| If yes, describe drain impact | Textarea | Conditional | shown only if above = Yes |

**Section C — Supporting Details**
| Field | Type | Required |
|-------|------|----------|
| Name of Contractor/Organisation (if applicable) | Text | No |
| Contact Person on Site | Text | Yes |
| Site Contact Mobile | Text | Yes |
| Description of Work | Textarea | Yes |

**Section D — Declaration**
"I confirm that the above information is accurate. I understand that this request is subject to approval by the concerned authority and that the road must be reopened as per approved schedule."
Required checkbox.

---

#### Form 3: Loudspeaker / Amplifier Permission

**Form ID:** `loudspeaker`  
**Based on:** Karnataka State Police — Application Fee for Amplifier Sound System Permission (listed on KarnatakaOne)  
**Submit to:** Office of the Deputy Commissioner of Police / Superintendent of Police, Mysuru  
**Physical address:** Same as Form 1

**Fields:**

**Section A — Applicant Details**
Same as Form 1 Section A.

**Section B — Event Details**
| Field | Type | Required |
|-------|------|----------|
| Purpose of Use | Select | Yes | Religious Event / Marriage / Cultural Programme / Political Meeting / Festival / Commercial Event / Other |
| Event Name | Text | Yes |
| Venue/Location | Text | Yes |
| Ward Number | Number | Yes |
| Date of Use | Date | Yes |
| Start Time | Time | Yes |
| End Time | Time | Yes |
| Number of Loudspeakers | Number | Yes |
| Estimated Wattage (per speaker) | Number | Yes |
| Is the venue near a hospital/school? | Radio | Yes | Yes / No |

**Section C — Compliance**
| Field | Type |
|-------|------|
| Will decibel limits be followed per HC order? | Required checkbox |
| Equipment will be switched off as per prescribed timings? | Required checkbox |

**Section D — Declaration**
"I declare that the sound system will be used in compliance with the orders of the Hon'ble High Court regarding decibel levels and timings. I accept full responsibility for any violation."
Required checkbox.

---

#### Form 4: Construction Zone Public Notice

**Form ID:** `construction_notice`  
**Purpose:** Self-declaration notice for contractors undertaking roadside/public space construction in Mysuru — to be submitted to MCC Ward Office  
**Submit to:** MCC Ward Office of the relevant ward  

**Fields:**

**Section A — Contractor / Applicant Details**
Same as Form 1 Section A, plus:
- Company/Firm Name (text, required)
- Registration/License Number (text, optional)

**Section B — Construction Details**
| Field | Type | Required |
|-------|------|----------|
| Work Description | Textarea | Yes |
| Location | Text | Yes |
| Ward Number | Number | Yes |
| Nearest Landmark | Text | Yes |
| Proposed Start Date | Date | Yes |
| Proposed Completion Date | Date | Yes |
| Will road space be occupied? | Radio | Yes | Yes / No |
| Percentage of road blocked (if yes) | Select | Conditional | 25% / 50% / 75% / Full Closure |
| Safety measures in place | Textarea | Yes |
| Night lighting provided? | Radio | Yes | Yes / No |
| Will drainage be disturbed? | Radio | Yes | Yes / No |
| Drain restoration plan (if yes) | Textarea | Conditional |

**Section C — Declaration**
"I hereby give public notice of the above construction activity and undertake to restore the road/drain to its original condition upon completion. I will display this notice at the work site."
Required checkbox.

---

### Form Behavior Rules

1. **Multi-step wizard UI:** Each section is a step. Progress bar at top showing Steps 1, 2, 3 (N steps per form). Next/Back buttons. Cannot proceed to next step with validation errors.

2. **Smart field visibility:** Conditional fields appear/disappear instantly based on sibling field values (using React Hook Form `watch`).

3. **Validation:** All required fields validated with Zod on blur and on submit attempt. Error messages shown below each field.

4. **CityMind integration button:** Small floating button on the form page: "Need help? Ask CityMind." Opens a mini chat drawer (300px wide slide-in panel from right) that loads the CityMind chat interface. When a user asks CityMind "help me fill this form", CityMind sees which form is active (passed as context) and guides them through each field conversationally.

5. **Review Screen:** After final section, show a full read-only summary of all answers before submit. "Edit" links back to each section.

6. **Submit action:** `POST /api/v1/forms/submit` with form_type and form_data. Returns `{form_id, pdf_url}`.

7. **Post-submit screen:** Show success message, reference number (form_id), and a prominent "Download PDF" button.

---

## 7. PDF Generation

When a citizen submits a form, the backend generates a print-ready PDF using ReportLab. The PDF is stored and accessible via `/api/v1/forms/{id}/pdf`.

### PDF Specifications

**General:**
- Page size: A4
- Margins: 20mm all sides
- Font: Helvetica (standard, available in ReportLab without extra install)
- Color: Black text on white, with a thin dark blue header bar

**Header (every page):**
- Left: "GOVERNMENT OF KARNATAKA" in bold 10pt
- Center: Form title (e.g., "APPLICATION FOR PROCESSION PERMISSION") in bold 12pt
- Right: MUIP reference number
- Below header: horizontal line

**Body:**
- Section headers: bold, 10pt, underlined
- Field labels: bold, 9pt
- Field values: regular, 9pt
- Fields rendered as: "Label: _____________Value_____________"
- Checkboxes rendered as: "☑ Loudspeaker" or "☐ Music Band"
- Multi-line fields (textarea): wrapped with clear borders

**Footer (every page):**
- "Generated by Mysuru Urban Intelligence Platform (MUIP) — muip.in"
- "Reference No: [form_id] | Generated on: [timestamp]"
- "This form must be physically submitted to: [office name and address]"

**Procession Form Specific:**
- Include the full text of General Conditions (points i through ix from the Karnataka Police procession document) at the bottom of the last page, in 8pt grey text, under heading "GENERAL CONDITIONS OF LICENSE (for official reference)"

**All Forms:**
- Leave a 30mm blank space at the bottom of the last page under "FOR OFFICE USE ONLY" heading with dotted lines for: Date Received, Received By, Signature, Stamp

### PDF File Storage
- Store generated PDFs in `/backend/storage/forms/{form_id}.pdf`
- If using Railway/Render, store in a mounted volume or use Supabase Storage bucket
- PDF URL returned in API response: `/api/v1/forms/{id}/pdf`

---

## 8. Backend Endpoints for Citizen Portal

All endpoints listed here are public (no auth required). They are defined in `backend/app/api/v1/citizen.py` and `backend/app/api/v1/forms.py`.

### City Status
```
GET /api/v1/citizen/city-status
Response: {
  "last_updated": "ISO8601",
  "active_alerts": [...],  // same format as /api/v1/alerts/active
  "summary": {
    "total_alerts": int,
    "road_blocks": int,
    "construction_zones": int,
    "flood_warnings": int,
    "events": int
  }
}
```

### Chat
```
POST /api/v1/citizen/chat
Request: {
  "messages": [{"role": "user"|"assistant", "content": "..."}],
  "session_id": "uuid",
  "active_form": "procession"|"road_closure_request"|"loudspeaker"|"construction_notice"|null,
  "city_context": {...}  // current city-status response
}
Response: SSE stream
  data: {"type": "token", "content": "..."}
  data: {"type": "done"}
  data: {"type": "error", "message": "..."}
```

### Forms
```
GET /api/v1/forms/types
Response: list of {form_id, title, description, submit_to, office_address, field_count}

POST /api/v1/forms/submit
Request: {form_type: str, form_data: {}}
Response: {form_id: uuid, reference_number: str, pdf_url: str, submitted_at: str}

GET /api/v1/forms/{id}/pdf
Response: PDF file (Content-Type: application/pdf)
```

---

## 9. CityMind Context Injection (Implementation Detail)

When the frontend starts a new chat session:
1. Call `GET /api/v1/citizen/city-status`
2. Format the response as a plain-English summary:
   ```
   "Current Mysuru city status: [X] active alerts. 
   Road blocks: [list of titles]. 
   Construction: [list]. 
   Flood warnings: [list]. 
   Events: [list]."
   ```
3. Send this as the first `system`-role message in the conversation (before user's first message)
4. The backend receives this in the `messages` array and includes it in the Anthropic API call

---

## 10. Kannada Labels (UI Only)

These Kannada labels replace the English nav labels when Kannada mode is active. Store in a `i18n/kn.json` file.

```json
{
  "nav.map": "ನಗರ ನಕ್ಷೆ",
  "nav.chat": "ಸಿಟಿಮೈಂಡ್ AI",
  "nav.forms": "ನಾಗರಿಕ ಅರ್ಜಿಗಳು",
  "map.live": "ನೇರ",
  "map.active_alerts": "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು",
  "forms.procession": "ಮೆರವಣಿಗೆ ಅನುಮತಿ",
  "forms.road_closure": "ರಸ್ತೆ ಮುಚ್ಚುವ ವಿನಂತಿ",
  "forms.loudspeaker": "ಧ್ವನಿವರ್ಧಕ ಅನುಮತಿ",
  "forms.construction": "ನಿರ್ಮಾಣ ಸೂಚನೆ",
  "chat.placeholder": "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಿ...",
  "chat.suggested.1": "ಈಗ ಯಾವ ರಸ್ತೆಗಳು ಮುಚ್ಚಿವೆ?",
  "chat.suggested.2": "ಮೆರವಣಿಗೆ ಅನುಮತಿ ಹೇಗೆ ಪಡೆಯುವುದು?",
  "footer.emergency": "ತುರ್ತು: 112"
}
```

Use `useTranslation` hook that reads from localStorage `lang` key ('en' or 'kn') and returns the right string.

---

## 11. Accessibility Requirements

- All form fields have proper `<label>` associations
- Error messages associated via `aria-describedby`
- Map has a text summary sidebar (the status panel) for screen reader users
- Color is never the only differentiator (use icons + text alongside color badges)
- Focus visible on all interactive elements
- Chat input has `aria-label="Message CityMind"`

---

## 12. Mobile Responsiveness

The citizen dashboard must be fully functional on mobile (360px and above).

- Map page: status panel collapses to a bottom sheet on mobile
- Chat page: full-screen on mobile, conversation list hidden behind a menu button
- Forms page: steps stack vertically, sidebar becomes a dropdown on mobile
- Header: collapses to hamburger menu below 768px

---

## 13. What Citizen Dashboard Must NEVER Show

- Any simulation controls or results
- Government analytics or charts
- Other citizens' form submissions or reference numbers
- Any hint that a government portal exists (no links, no mentions)
- Real names of government users who reviewed forms
- Internal ward IDs or database IDs (show reference numbers only)
- Reviewer notes on form submissions (those are internal)

---

## 14. Local Storage Keys Used

```
muip_chat_session_id    → current session UUID
muip_chat_history       → array of {session_id, first_message, timestamp}
muip_lang               → 'en' | 'kn'
muip_map_position       → {lat, lng, zoom}
muip_form_draft_{type}  → saved form draft (auto-save every 30 seconds)
```

Form drafts auto-save so citizens don't lose progress if they navigate away. On returning to a form, show a banner: "You have a saved draft. Continue where you left off?" with Continue / Start Fresh buttons.

---

## 15. Page Titles and Meta

```
/citizen/map   → "City Map — MUIP Mysuru"
/citizen/chat  → "CityMind AI — MUIP Mysuru"
/citizen/forms → "Civic Forms — MUIP Mysuru"
```

Open Graph meta for each page:
- og:image = MUIP logo
- og:description = "Real-time city status and civic services for Mysuru citizens"
