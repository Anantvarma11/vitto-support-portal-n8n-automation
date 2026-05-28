# AI Support Ticket Router — Vitto Technical Assessment

**Author:** Anant Varma
**Scenario:** C — Support Ticket Router
**Stack:** n8n · Claude Sonnet 4.6 · Slack · Gmail · Google Sheets

---

### What Was Built

An end-to-end n8n automation that receives support tickets via webhook, classifies them using Claude Sonnet 4.6 with enforced structured output, and routes them to department-specific Slack channels (`#billing-support`, `#technical-support`, `#general-support`). Every ticket gets a personalized Gmail auto-reply and is logged to Google Sheets with 13 fields for audit and analytics.

### Why These Tools

- **n8n:** Selected for its native Langchain integration, which allows using a structured output parser to enforce JSON schemas on AI responses — eliminating brittle regex or prompt-only JSON enforcement. The visual branching, Merge node, and `responseNode` webhook mode also made the routing logic clean and testable.
- **Claude Sonnet 4.6:** Chosen for strong instruction-following and reasoning transparency. The `reasoning` field in the output schema lets us audit *why* the AI classified each ticket, which is critical for trust in production.
- **Structured Output Parser (Langchain):** Rather than relying on `response_format: json_object` (which only guarantees valid JSON, not schema compliance), the structured output parser validates against a defined schema and retries on failure.

### Architecture Highlights

- **Input validation:** An IF node checks for required fields (`email`, `message`) and returns a 400 JSON error for malformed payloads — preventing wasted AI API calls.
- **Confidence threshold gate:** If the AI's classification confidence is below 70%, the ticket is re-routed to the general queue with a `needsHumanReview: true` flag instead of being silently misrouted.
- **Merge node:** After the Switch routes tickets to 3 different Slack channels, a Merge node reconverges all branches into a single stream for Gmail and Google Sheets — avoiding duplicated downstream logic.
- **Null-safe normalization:** The Set node uses `$json.body?.email ?? $json.email ?? ""` expressions to handle varying payload shapes gracefully.

### Limitations

- **Single LLM dependency:** If the Anthropic API goes down, the workflow halts at the AI classification step. A production system should implement an LLM fallback (e.g., auto-switch to OpenAI GPT-4o via HTTP Request on Anthropic failure).
- **No global error trigger:** Input validation and confidence fallback are handled, but an unexpected crash in Slack/Gmail/Sheets nodes would not be caught. Adding an Error Trigger → alerting node would close this gap.
- **Static confidence threshold:** The 0.7 threshold is hardcoded. In production, this should be tunable via n8n environment variables based on observed accuracy.

### Future Improvements

- **RAG-powered responses:** Query an internal knowledge base before generating `suggestedResponse` so the auto-reply includes actual resolution steps, not just acknowledgment.
- **Streamlit dashboard:** Visualize ticket volume, category distribution, and average confidence over time using the Google Sheets audit log.
- **Multi-model routing:** Use a fast/cheap model (Claude Haiku) for obvious tickets and escalate ambiguous ones to Claude Sonnet for deeper classification.

### Lessons Learned

The key engineering insight was that **prompt engineering alone is insufficient for production AI automation**. Prompts can request structured output, but only a framework-level parser (like n8n's Langchain structured output node) can *guarantee* it. This distinction — treating the LLM as a function with typed inputs/outputs rather than a chatbot — is what separates demo workflows from production ones.
