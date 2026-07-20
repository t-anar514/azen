"use client"

// Fire-and-forget event tracking. Never blocks or throws into the UI — a
// failed beacon must not break a booking flow.
//
// Event set (master plan §7):
//   city_hub_viewed · place_viewed · place_saved · folder_created
//   folder_added_to_trip · guide_profile_viewed · tour_request_submitted
//   transfer_quote_requested · booking_confirmed · post_read

const SESSION_KEY = "azen_session_id"

function sessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return ""
  }
}

export function track(name: string, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return

  const payload = JSON.stringify({
    name,
    props,
    session_id: sessionId(),
    path: window.location.pathname,
  })

  try {
    // sendBeacon survives navigation — important for click-through events
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }))
      return
    }
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* analytics must never surface an error to the user */
  }
}
