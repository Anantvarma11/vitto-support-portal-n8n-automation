export async function createSupportTicket({ name, email, subject, message, signal }) {
  const url = import.meta.env.VITE_SUPPORT_TICKET_API_URL

  if (!url) {
    // If backend URL isn't configured yet, behave like a mock.
    await new Promise((r) => setTimeout(r, 700))
    return { success: true, ticketId: `local-${Date.now()}`, category: 'general', priority: 'low' }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message }),
    signal,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

