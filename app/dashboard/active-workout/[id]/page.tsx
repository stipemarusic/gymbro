import connectDB from "@/lib/db"
import WorkoutSession from "@/models/WorkoutSession"
import ActiveWorkoutClient from "@/components/active-workout-client"
import { getSession } from "@/lib/auth/auth"
import { notFound, redirect } from "next/navigation"

type SessionSet = {
  reps: number
  weight: number
  completed?: boolean
}

type SessionExercise = {
  name: string
  muscleGroup?: string
  completed?: boolean
  sets: SessionSet[]
}

export default async function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()

  if (!session) {
    redirect("/sign-in")
  }

  const { id } = await params

  await connectDB()

  const workoutSession = await WorkoutSession.findOne({
    _id: id,
    userId: session.user.id,
  }).lean()

  if (!workoutSession) {
    notFound()
  }

  if (workoutSession.status === "completed") {
    redirect("/dashboard")
  }

  return (
    <ActiveWorkoutClient
      sessionId={id}
      workoutName={workoutSession.workoutName}
      startedAt={workoutSession.startedAt.toISOString()}
      initialIsPaused={workoutSession.isPaused || false}
      initialDuration={workoutSession.duration || 0}
      totalPausedSeconds={workoutSession.totalPausedSeconds || 0}
      initialExercises={workoutSession.exercises.map((exercise: SessionExercise) => ({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup || "Other",
        completed: exercise.completed || false,
        sets: exercise.sets.map((set: SessionSet) => ({
          reps: set.reps,
          weight: set.weight,
          completed: set.completed || false,
        })),
      }))}
    />
  )
}
