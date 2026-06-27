"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { queueFeedback } from "@/lib/feedback"

export default function NewWorkoutPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) {
      setError("Workout name is required.")
      return
    }

    setError("")

    const response = await fetch("/api/workouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: trimmedName,
        description: trimmedDescription,
      }),
    })

    if (!response.ok) {
      setError("Failed to create workout. Please try again.")
      return
    }

    if (response.ok) {
      queueFeedback({
        title: "Workout created",
        description: "Your new workout plan is ready.",
        variant: "success",
      })
      router.push("/dashboard/workouts")
    }
  }

  return (
    <div className="max-w-xl p-8 md:p-12">
      <h1 className="mb-6 text-4xl font-bold">
        New Workout
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-white/10 p-6"
      >
        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-300">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Workout Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-28 w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        />

        <button
          type="submit"
          disabled={!name.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
        >
          <Save className="h-4 w-4" />
          Save Workout
        </button>
      </form>
    </div>
  )
}
