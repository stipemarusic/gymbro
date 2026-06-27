"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play } from "lucide-react"
import { queueFeedback } from "@/lib/feedback"

export default function StartWorkoutButton({
  workoutId,
}: {
  workoutId: string
}) {
  const router = useRouter()
  const [error, setError] = useState("")

  async function startWorkout() {
    setError("")

    const response = await fetch("/api/workout-sessions/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workoutId,
      }),
    })

    if (!response.ok) {
      setError("Failed to start workout. Please try again.")
      return
    }

    const workoutSession = await response.json()

    queueFeedback({
      title: "Workout started",
      description: "Your active workout is ready.",
      variant: "success",
    })

    router.push(`/dashboard/active-workout/${workoutSession._id}`)
  }

  return (
    <div className="space-y-2">
      <button
        onClick={startWorkout}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
      >
        <Play className="h-4 w-4" />
        Start Workout
      </button>

      {error && (
        <p className="text-sm font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
