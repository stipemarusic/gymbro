export type FeedbackMessage = {
  title: string
  description?: string
  variant?: "success" | "info"
}

const feedbackStorageKey = "gymbro:feedback"
const feedbackEventName = "gymbro:feedback"

export function queueFeedback(message: FeedbackMessage) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    feedbackStorageKey,
    JSON.stringify(message)
  )

  window.dispatchEvent(
    new CustomEvent<FeedbackMessage>(feedbackEventName, {
      detail: message,
    })
  )
}

export function readQueuedFeedback() {
  if (typeof window === "undefined") {
    return null
  }

  const rawMessage = window.localStorage.getItem(feedbackStorageKey)

  if (!rawMessage) {
    return null
  }

  window.localStorage.removeItem(feedbackStorageKey)

  try {
    return JSON.parse(rawMessage) as FeedbackMessage
  } catch {
    return null
  }
}

export { feedbackEventName, feedbackStorageKey }
