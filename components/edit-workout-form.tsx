"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { queueFeedback } from "@/lib/feedback"

export default function EditWorkoutForm({
  workoutId,
  initialName,
  initialDescription,
}: {
  workoutId: string
  initialName: string
  initialDescription: string
}) {
  const router = useRouter()

  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [error, setError] = useState("")

  async function saveWorkout() {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      setError("Workout name is required.")
      return
    }

    setError("")

    const response = await fetch(`/api/workouts/${workoutId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: trimmedName,
        description: trimmedDescription,
      }),
    })

    if (!response.ok) {
      setError("Failed to save workout. Please try again.")
      return
    }

    queueFeedback({
      title: "Workout updated",
      description: "Your changes were saved.",
      variant: "success",
    })

    router.push(`/dashboard/workouts/${workoutId}`)
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-300">
          {error}
        </p>
      )}

      <div>
        <label className="block mb-2 font-medium">
          Workout Name
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          rows={4}
        />
      </div>

      <button
        onClick={saveWorkout}
        disabled={!name.trim()}
        className="rounded-xl bg-secondary px-6 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save Changes
      </button>
    </div>
  )
}
