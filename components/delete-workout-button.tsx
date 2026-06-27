"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ConfirmDialog from "@/components/confirm-dialog"
import { Trash2 } from "lucide-react"
import { queueFeedback } from "@/lib/feedback"

export default function DeleteWorkoutButton({
    workoutId,
}: {
    workoutId: string
}) {
    const router = useRouter()
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [error, setError] = useState("")

    async function deleteWorkout() {
        setError("")

        const response = await fetch(`/api/workouts/${workoutId}`, {
            method: "DELETE",
        })

        if (!response.ok) {
            setError("Failed to delete workout. Please try again.")
            setIsConfirmOpen(false)
            return
        }

        queueFeedback({
            title: "Workout deleted",
            description: "The workout and its exercises were removed.",
            variant: "success",
        })

        router.push("/dashboard/workouts")
    }

    return (
        <>
            <button
                onClick={() => setIsConfirmOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 active:translate-y-px cursor-pointer"
            >
                <Trash2 className="h-4 w-4" />
                Delete Workout
            </button>

            <ConfirmDialog
                open={isConfirmOpen}
                title="Delete workout?"
                description="This will delete this workout and all of its exercises."
                confirmLabel="Delete Workout"
                destructive
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={deleteWorkout}
            />

            {error && (
                <p className="text-sm font-medium text-red-400">
                    {error}
                </p>
            )}
        </>
    )
}
