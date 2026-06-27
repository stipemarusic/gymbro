"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Save } from "lucide-react"
import ExerciseNameAutocomplete from "@/components/exercise-name-autocomplete"
import { exerciseNameSuggestions } from "@/lib/exercise-suggestions"
import { queueFeedback } from "@/lib/feedback"

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Glutes",
  "Core",
  "Other",
]

export default function NewExercisePage() {
  const [name, setName] = useState("")
  const [muscleGroup, setMuscleGroup] = useState("Other")
  const [error, setError] = useState("")

  const router = useRouter()
  const params = useParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError("Exercise name is required.")
      return
    }

    setError("")

    const response = await fetch("/api/exercises", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workoutId: params.id,
        name: trimmedName,
        muscleGroup,
      }),
    })

    if (!response.ok) {
      setError("Failed to save exercise. Please try again.")
      return
    }

    if (response.ok) {
      queueFeedback({
        title: "Exercise saved",
        description: `${trimmedName} was added to this workout.`,
        variant: "success",
      })
      router.push(`/dashboard/workouts/${params.id}`)
    }
  }

  return (
    <div className="max-w-xl p-8 md:p-12">
      <h1 className="mb-6 text-5xl font-bold tracking-tight">
        New Exercise
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 p-6">
        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-300">
            {error}
          </p>
        )}

        <ExerciseNameAutocomplete
          placeholder="Exercise Name"
          value={name}
          onChange={setName}
          suggestions={exerciseNameSuggestions}
        />

        <select
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        >
          {muscleGroups.map((group) => (
            <option key={group} value={group} className="bg-background text-foreground">
              {group}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!name.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
        >
          <Save className="h-4 w-4" />
          Save Exercise
        </button>
      </form>
    </div>
  )
}
