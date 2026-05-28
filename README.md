# 🎫 AI Support Ticket Router

> **Vitto Technical Assessment** — AI Automation & Workflow for Inclusive FinTech Operations

An n8n automation workflow that accepts inbound support tickets via webhook, classifies them using **Claude Sonnet 4.6** with structured output parsing, routes them to the appropriate Slack channel, sends a Gmail auto-reply, and logs everything to Google Sheets — fully end-to-end with zero manual intervention.

---

## 📐 Architecture

```
Webhook (POST /support-ticket)
       ↓
Normalize Ticket Payload (Set node — null-safe field extraction)
       ↓
Validate Required Fields (IF node — checks email + message exist)
       ├── ❌ Invalid → Respond 400 Bad Request (JSON error)
       └── ✅ Valid ↓
AI Ticket Classifier (Langchain Agent — Claude Sonnet 4.6)
   ├── Claude Sonnet Model (LLM provider)
   └── Ticket Classification Schema (Structured Output Parser)
       ↓
Enrich Ticket with Classification (Set node — merges original + AI data)
       ↓
Confidence Threshold Check (IF node — confidence ≥ 0.7?)
       ├── ❌ Low confidence → Fallback to General Queue (needsHumanReview: true)
       └── ✅ High confidence ↓
Route by Category (Switch node)
       ├── billing   → Slack: #billing-support
       ├── technical  → Slack: #technical-support
       └── general    → Slack: #general-support
                ↓
Merge Routed Tickets (reconverge all 3 branches)
       ↓
Send Gmail Confirmation (personalized auto-reply with ticket details)
       ↓
Log Ticket to Google Sheets (full audit trail — 13 columns)
       ↓
Respond 200 Success (JSON response with ticket ID, category, priority)
```

---

## 🛠 Tech Stack

| Component | Tool |
|---|---|
| Workflow Engine | n8n (cloud) |
| AI Model | Anthropic Claude Sonnet 4.6 (via Langchain agent node) |
| Structured Output | n8n Langchain Structured Output Parser |
| Integrations | Slack · Gmail · Google Sheets · Webhook |
| Testing Script | Python 3 + `requests` |

---

## ⚙️ Setup & Installation

### 1. Import the Workflow

1. Open your n8n instance
2. Click the **three-dot menu** (top right) → **Import from file**
3. Select `workflows/AI Support Ticket Router.json`
4. All nodes will appear on the canvas

### 2. Configure Credentials

You need to set up 4 credentials in n8n (**Settings → Credentials**):

| Credential | Type | Notes |
|---|---|---|
| **Anthropic API** | API Key | Get from [console.anthropic.com](https://console.anthropic.com) |
| **Slack** | OAuth2 or Bot Token | Bot needs `chat:write` scope. Create channels: `#billing-support`, `#technical-support`, `#general-support` |
| **Gmail** | OAuth2 | Enable Gmail API in Google Cloud Console |
| **Google Sheets** | OAuth2 | Enable Sheets API. Create a spreadsheet with a sheet named `Tickets` |

### 3. Configure Google Sheets

1. Create a Google Sheet with these column headers in the first row:

   ```
   Ticket ID | Name | Email | Subject | Message | Category | Confidence | Priority | Reasoning | Status | Received At | Classified At | Needs Review
   ```

2. Open the **Log Ticket to Google Sheets** node in n8n
3. Select your Google Sheets credential and link the spreadsheet

### 4. Activate the Workflow

1. Toggle the workflow to **Active** (top right)
2. The webhook endpoint will become live at: `https://your-instance.n8n.cloud/webhook/support-ticket`

---

## 🧪 Testing

### Automated Testing (Python Script)

```bash
cd scripts/
pip install -r requirements.txt

# Edit WEBHOOK_URL in ticket_simulator.py to your n8n webhook URL
python ticket_simulator.py
```

The script sends 5 test tickets covering all categories + edge cases:
- Technical (database down — critical)
- Billing (invoice request — low priority)
- General (positive feedback)
- Edge case: missing subject field
- Edge case: ambiguous message

### Manual Testing (cURL)

```bash
curl -X POST https://your-instance.n8n.cloud/webhook/support-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Cannot login to dashboard",
    "message": "I keep getting a 500 error when I try to login. This has been happening since yesterday."
  }'
```

**Expected response:**
```json
{
  "success": true,
  "ticketId": "1716849600000-jane@example.com",
  "category": "technical",
  "priority": "high",
  "confidence": 0.95,
  "message": "Ticket received. Check email for confirmation."
}
```

---

## 📁 Repository Structure

```
vitto-autotriage-internship/
├── workflows/
│   └── AI Support Ticket Router.json   # n8n native workflow export
├── scripts/
│   ├── ticket_simulator.py             # Python load-testing script (5 test cases)
│   └── requirements.txt                # Python dependencies
├── docs/
│   ├── prompts.md                      # Prompt engineering documentation
│   ├── write_up.md                     # 1-page project write-up
│   └── screenshots/                    # Workflow & execution screenshots
├── README.md                           # This file
└── .gitignore
```

---

## 🔒 Error Handling

| Scenario | Handling |
|---|---|
| Missing `email` or `message` fields | `Validate Required Fields` IF node → returns 400 JSON error |
| AI confidence < 70% | `Confidence Threshold Check` → routes to general queue with `needsHumanReview: true` |
| Unknown category from AI | Switch node fallback → routes to `#general-support` |
| Null/missing fields in payload | `Normalize Ticket Payload` uses null-safe expressions with `??` fallbacks |

---

## 🚀 Future Improvements

- **LLM Fallback:** If Anthropic API is down, route to OpenAI GPT-4o via HTTP Request as backup
- **RAG Integration:** Query internal docs before generating `suggestedResponse`
- **Streamlit Dashboard:** Visual frontend showing ticket volume, category distribution, and confidence trends
- **Multi-language Support:** Detect language and route to localized support channels
- **SLA Timer:** Track time-to-first-response and escalate if threshold is breached

---

## 📝 Deliverables

- [x] GitHub repo with workflow JSON + scripts + README
- [ ] Screen recording (1-2 min Loom demo)
- [x] Write-up (see `docs/write_up.md`)
- [x] Prompts documentation (see `docs/prompts.md`)

---

## 📄 License

This project was built as a technical assessment for the Vitto AI Workflow Automation Internship.
