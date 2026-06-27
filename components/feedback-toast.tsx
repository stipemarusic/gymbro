"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, X } from "lucide-react"
import {
  FeedbackMessage,
  feedbackEventName,
  readQueuedFeedback,
} from "@/lib/feedback"

export default function FeedbackToast() {
  const [message, setMessage] = useState<FeedbackMessage | null>(null)

  useEffect(() => {
    const queuedMessage = readQueuedFeedback()

    if (queuedMessage) {
      window.setTimeout(() => {
        setMessage(queuedMessage)
      }, 0)
    }

    function handleFeedback(event: Event) {
      const feedbackEvent = event as CustomEvent<FeedbackMessage>
      setMessage(feedbackEvent.detail)
    }

    window.addEventListener(feedbackEventName, handleFeedback)

    return () => {
      window.removeEventListener(feedbackEventName, handleFeedback)
    }
  }, [])

  useEffect(() => {
    if (!message) {
      return
    }

    const timeout = window.setTimeout(() => {
      setMessage(null)
    }, 4500)

    return () => window.clearTimeout(timeout)
  }, [message])

  if (!message) {
    return null
  }

  return (
    <div className="fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-secondary/30 bg-card/95 p-4 text-card-foreground shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {message.title}
          </p>

          {message.description && (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {message.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMessage(null)}
          aria-label="Dismiss message"
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
