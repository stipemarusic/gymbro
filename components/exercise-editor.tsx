"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ConfirmDialog from "@/components/confirm-dialog"
import ExerciseNameAutocomplete from "@/components/exercise-name-autocomplete"
import { Plus, Save, Trash2 } from "lucide-react"
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

export default function ExerciseEditor({
  exerciseId,
  workoutId,
  exerciseName,
  initialMuscleGroup,
  initialSets,
}: {
  exerciseId: string
  workoutId: string
  exerciseName: string
  initialMuscleGroup: string
  initialSets: {
    reps: number
    weight: number
  }[]
}) {
  const [sets, setSets] = useState(initialSets)
  const [name, setName] = useState(exerciseName)
  const [muscleGroup, setMuscleGroup] = useState(
    initialMuscleGroup || "Other"
  )
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  function updateSet(
    index: number,
    field: "reps" | "weight",
    value: number
  ) {
    const updated = [...sets]

    updated[index] = {
      ...updated[index],
      [field]: value,
    }

    setSets(updated)
  }

  function addSet() {
    setSets([
      ...sets,
      {
        reps: 10,
        weight: 0,
      },
    ])
  }

  function removeSet(index: number) {
    setSets(
      sets.filter((_, i) => i !== index)
    )
  }

  async function saveSets() {
    const trimmedName = name.trim()

    if (!trimmedName) {
      setError("Exercise name is required.")
      return
    }

    setError("")

    const response = await fetch(`/api/exercises/${exerciseId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: trimmedName,
        muscleGroup,
        sets,
      }),
    })

    if (!response.ok) {
      setError("Failed to save exercise. Please try again.")
      return
    }

    queueFeedback({
      title: "Exercise saved",
      description: "Your exercise changes were saved.",
      variant: "success",
    })

    router.push(`/dashboard/workouts/${workoutId}`)
  }

  async function deleteExercise() {
    setError("")

    const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "DELETE"
    })

    if (!response.ok) {
        setError("Failed to delete exercise. Please try again.")
        setIsDeleteConfirmOpen(false)
        return
    }

    queueFeedback({
        title: "Exercise deleted",
        description: "The exercise was removed from this workout.",
        variant: "success",
    })

    router.push(
        `/dashboard/workouts/${workoutId}`
    )
  }

  return (
    <>
        {error && (
            <p className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-300">
                {error}
            </p>
        )}

        <div className="mb-8">
            <label className="block mb-2 font-medium">
                Exercise Name
            </label>
            <ExerciseNameAutocomplete
                value={name}
                onChange={setName}
                suggestions={exerciseNameSuggestions}
            />
        </div>
        <div className="mb-8">
            <label className="block mb-2 font-medium">
                Muscle Group
            </label>
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
        </div>
        <div className="space-y-4 mt-8">
        {sets.map((set, index) => (
            <div
            key={index}
            className="grid gap-4 rounded-xl border border-white/10 p-4 md:grid-cols-[80px_1fr_auto_1fr_auto_auto] md:items-center"
            >
            <span className="w-16">
                Set {index + 1}
            </span>

            <input
                type="number"
                value={set.reps}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                updateSet(
                    index,
                    "reps",
                    Number(e.target.value)
                )
                }
                className="w-24 rounded-lg border border-white/10 bg-background/80 p-2 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />

            <span>reps</span>

            <input
                type="number"
                value={set.weight}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                updateSet(
                    index,
                    "weight",
                    Number(e.target.value)
                )
                }
                className="w-24 rounded-lg border border-white/10 bg-background/80 p-2 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />

            <span>kg</span>
            {sets.length > 1 &&(
                <button
                onClick={() => removeSet(index)}
                aria-label={`Remove set ${index + 1}`}
                title="Remove set"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 font-semibold text-white transition hover:bg-red-700 cursor-pointer"
            >
                <Trash2 className="h-4 w-4" />
            </button>
            )}
            </div>
        ))}

        <div className="flex gap-4">
            <button
            onClick={addSet}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-2 text-black font-semibold cursor-pointer shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
            >
            <Plus className="h-4 w-4" />
            Add Set
            </button>

            <button
            onClick={saveSets}
            disabled={!name.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2 font-semibold cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
            <Save className="h-4 w-4" />
            Save
            </button>
            <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition cursor-pointer"
            >
                <Trash2 className="h-4 w-4" />
                Delete Exercise
            </button>
        </div>
        </div>
        <ConfirmDialog
            open={isDeleteConfirmOpen}
            title="Delete exercise?"
            description="This will remove this exercise from the workout."
            confirmLabel="Delete Exercise"
            destructive
            onCancel={() => setIsDeleteConfirmOpen(false)}
            onConfirm={deleteExercise}
        />
    </>
  )
}
