# Prompt Engineering Documentation

## AI Model

**Anthropic Claude Sonnet 4.6** via n8n's Langchain Agent node (`@n8n/n8n-nodes-langchain.agent` v3.1) with a **Structured Output Parser** (`@n8n/n8n-nodes-langchain.outputParserStructured` v1.3) to enforce a deterministic JSON schema.

---

## Final Prompt (Production)

The prompt is configured in the **AI Ticket Classifier** node:

```text
Classify the following support ticket.

Subject: {{ $json.subject }}
Message: {{ $json.message }}

Rules:
- billing: payment, invoice, refund, subscription, pricing, charges
- technical: bugs, errors, login, performance, API, feature broken
- general: how-to, account info, feature request, feedback

Priority: urgent=service down, high=major feature broken, medium=single user issue, low=general question

Return JSON: { category, confidence (0-1), reasoning, priority, suggestedResponse, keywords[] }
```

---

## Structured Output Schema

The output is enforced by n8n's **Structured Output Parser** node using this JSON example schema:

```json
{
  "category": "technical",
  "confidence": 0.95,
  "reasoning": "User reports login failure which is a technical access issue",
  "priority": "high",
  "suggestedResponse": "Thank you for reporting this. Our technical team will investigate your login issue within 2 hours.",
  "keywords": ["login", "access", "authentication"]
}
```

### Field Definitions

| Field | Type | Constraints | Purpose |
|---|---|---|---|
| `category` | string | `billing` \| `technical` \| `general` | Determines which Slack channel receives the ticket |
| `confidence` | float | 0.0 – 1.0 | Drives the confidence threshold gate (≥ 0.7 = auto-route, < 0.7 = fallback + human review) |
| `reasoning` | string | Free text | Explains the AI's classification logic for audit trail |
| `priority` | string | `urgent` \| `high` \| `medium` \| `low` | Displayed in Slack messages for team prioritization |
| `suggestedResponse` | string | 1-2 sentences | Used in the Gmail auto-reply to the customer |
| `keywords` | string[] | Extracted terms | Logged to Google Sheets for trend analysis |

---

## Prompt Design Iterations

### Iteration 1 — Naive (Failed)

**Prompt:** _"Read this message and tell me if it's billing, technical, or general. Also summarize it."_

**Problem:** Claude returned conversational prose like _"This appears to be a billing-related inquiry about..."_ — which broke downstream Switch node routing because the output wasn't parseable JSON.

**Lesson:** Without explicit structure constraints, LLMs default to natural language. You cannot use free-text AI output in conditional branching nodes.

### Iteration 2 — Explicit JSON request (Improved but fragile)

**Prompt:** Added "Respond ONLY with valid JSON" instruction and listed exact field names.

**Problem:** Claude occasionally wrapped the JSON in markdown code fences (` ```json ... ``` `) or added a preamble like "Here is the classification:". This broke `JSON.parse()` in the downstream Code node.

**Lesson:** Prompt-level JSON enforcement is unreliable. You need a structural guarantee, not just an instruction.

### Iteration 3 — Structured Output Parser (Production ✅)

**Solution:** Used n8n's Langchain `outputParserStructured` node, which:
1. Appends format instructions to the prompt automatically
2. Validates the AI response against the JSON schema
3. Retries or throws a structured error if validation fails

**Result:** 100% consistent structured output across 5+ consecutive test runs. The schema is defined once and enforced at the framework level, not in the prompt.

---

## Why This Design Works

1. **Separation of concerns:** The prompt handles _classification logic_ (rules, priority definitions). The output parser handles _format enforcement_ (JSON schema). Neither responsibility leaks into the other.

2. **Keyword hints over examples:** The prompt lists keywords (`payment, invoice, refund...`) rather than full example messages. This prevents the AI from pattern-matching against a small example set and instead allows it to generalize.

3. **Confidence as a control lever:** By requiring `confidence: 0.0-1.0`, we create a threshold gate downstream. If the AI is uncertain (< 0.7), the ticket is routed to a general queue with a `needsHumanReview: true` flag. This prevents confident-but-wrong routing.

4. **Priority taxonomy:** Defining `urgent/high/medium/low` with concrete criteria (`urgent = service down`) prevents the AI from inventing its own scale or defaulting everything to "medium."

5. **Suggested response:** Including `suggestedResponse` in the output lets us auto-populate the Gmail reply, but because it's AI-generated per-ticket rather than a template, each customer gets a contextually relevant acknowledgment.
