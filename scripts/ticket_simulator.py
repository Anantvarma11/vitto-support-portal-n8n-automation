"""
ticket_simulator.py — Load testing script for AI Support Ticket Router
-- .- -.. . / -... -.--
Sends synthetic support tickets to the n8n webhook endpoint to validate
end-to-end routing, AI classification, and integration with Slack/Gmail/Sheets.
.- -. .- -. -
Usage:
    1. Set WEBHOOK_URL below to your n8n webhook URL
    2. pip install -r requirements.txt
    3. python ticket_simulator.py
"""

import requests
import json
import time
import sys

# ──────────────────────────────────────────────
# CONFIGURATION — Update this before running
# ──────────────────────────────────────────────

WEBHOOK_URL = "https://anantvarma.app.n8n.cloud/webhook-test/support-ticket"

# ⚠️ Change this to your personal email to receive the auto-replies during your demo!
DEMO_EMAIL = "anantvarma.work@gmail.com"

# ──────────────────────────────────────────────
# TEST CASES — 5 scenarios covering all branches
# ──────────────────────────────────────────────

TEST_TICKETS = [
    {
        "description": "Technical — Critical (database down)",
        "payload": {
            "name": "Ravi Mehta",
            "email": DEMO_EMAIL,
            "subject": "URGENT: Production database is down",
            "message": "Our production database crashed 20 minutes ago. All API endpoints are returning 500 errors. We are losing customer data and revenue. Please escalate immediately.",
        },
        "expected_category": "technical",
        "expected_priority": "urgent",
    },
    {
        "description": "Billing — Low priority (invoice request)",
        "payload": {
            "name": "Priya Sharma",
            "email": DEMO_EMAIL,
            "subject": "Need invoice for May 2025",
            "message": "Hi, I need a copy of our invoice for May 2025. Can you also update the billing email to finance@company.co? Thanks.",
        },
        "expected_category": "billing",
        "expected_priority": "low",
    },
    {
        "description": "General — Positive feedback",
        "payload": {
            "name": "Alex Johnson",
            "email": DEMO_EMAIL,
            "subject": "Love the new dashboard",
            "message": "Just wanted to say the new analytics dashboard is amazing. The charts are so much clearer now. Great work by the team!",
        },
        "expected_category": "general",
        "expected_priority": "low",
    },
    {
        "description": "Edge case — Missing subject field",
        "payload": {
            "name": "Test User",
            "email": DEMO_EMAIL,
            "message": "I can't figure out how to export my data to CSV. The button seems to be missing from the settings page.",
        },
        "expected_category": "technical",
        "expected_priority": "medium",
    },
    {
        "description": "Edge case — Ambiguous message (low confidence expected)",
        "payload": {
            "name": "Jordan Lee",
            "email": DEMO_EMAIL,
            "subject": "Question",
            "message": "Hi, I have a question about my account. Can someone help?",
        },
        "expected_category": "general",
        "expected_priority": "low",
    },
]


def send_ticket(ticket: dict, index: int) -> None:
    """Send a single test ticket to the webhook and print the result."""
    desc = ticket["description"]
    payload = ticket["payload"]

    print(f"\n{'─' * 60}")
    print(f"  Test {index + 1}/{len(TEST_TICKETS)}: {desc}")
    print(
        f"  Expected: category={ticket['expected_category']}, priority={ticket['expected_priority']}"
    )
    print(f"{'─' * 60}")

    try:
        response = requests.post(
            WEBHOOK_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30,
        )

        if response.status_code == 200:
            try:
                data = response.json()
                actual_cat = data.get("category", "N/A")
                actual_pri = data.get("priority", "N/A")
                confidence = data.get("confidence", "N/A")
                match = (
                    "✅" if actual_cat == ticket["expected_category"] else "⚠️  MISMATCH"
                )

                print(f"  Status:     {response.status_code} OK")
                print(f"  Ticket ID:  {data.get('ticketId', 'N/A')}")
                print(f"  Category:   {actual_cat} {match}")
                print(f"  Priority:   {actual_pri}")
                print(f"  Confidence: {confidence}")
            except json.JSONDecodeError:
                print(f"  Status: {response.status_code} (non-JSON response)")
                print(f"  Body:   {response.text[:200]}")
        else:
            print(f"  ❌ HTTP {response.status_code}")
            print(f"  Body: {response.text[:200]}")

    except requests.exceptions.Timeout:
        print("  ❌ Request timed out (30s)")
    except requests.exceptions.ConnectionError:
        print("  ❌ Connection failed — is the n8n webhook active?")
    except Exception as e:
        print(f"  ❌ Error: {e}")


def main():
    print("🚀 AI Support Ticket Router — Load Test")
    print(f"   Target: {WEBHOOK_URL}")
    print(f"   Tickets: {len(TEST_TICKETS)}")

    if "your-n8n-instance" in WEBHOOK_URL:
        print("\n⚠️  WEBHOOK_URL is still set to the placeholder.")
        print("   Edit ticket_simulator.py and set your actual n8n webhook URL.")
        sys.exit(1)

    for i, ticket in enumerate(TEST_TICKETS):
        send_ticket(ticket, i)
        # Small delay between requests to avoid overwhelming the workflow
        if i < len(TEST_TICKETS) - 1:
            time.sleep(2)

    print(f"\n{'═' * 60}")
    print("🏁 Test complete!")
    print("   → Check Slack channels for routed tickets")
    print("   → Check Gmail for auto-reply emails")
    print("   → Check Google Sheets for audit log entries")
    print(f"{'═' * 60}")


if __name__ == "__main__":
    main()
