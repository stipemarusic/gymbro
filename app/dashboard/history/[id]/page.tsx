import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession } from "@/lib/auth/auth"
import connectDB from "@/lib/db"
import WorkoutSession from "@/models/WorkoutSession"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

type SessionSet = {
  reps: number
  weight: number
  completed?: boolean
}

type SessionExercise = {
  name: string
  muscleGroup?: string
  sets: SessionSet[]
}

type CompletedSession = {
  workoutName: string
  duration?: number
  startedAt?: Date
  endedAt?: Date
  createdAt: Date
  exercises: SessionExercise[]
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDuration(seconds?: number) {
  if (!seconds) {
    return null
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }

  return `${minutes}min`
}

function getMuscleGroup(value: unknown) {
  return typeof value === "string" ? value : "Other"
}

function getSetVolume(set: SessionSet) {
  return set.reps * set.weight
}

function getWorkoutDate(workout: CompletedSession) {
  return workout.endedAt || workout.startedAt || workout.createdAt
}

function getWorkoutStats(workout: CompletedSession) {
  const totalSets = workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.length
  }, 0)

  const totalVolume = workout.exercises.reduce((workoutTotal, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
      return setTotal + getSetVolume(set)
    }, 0)

    return workoutTotal + exerciseVolume
  }, 0)

  return {
    totalSets,
    totalVolume,
  }
}

export default async function HistoryDetailPage({
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

  const workout = await WorkoutSession.findOne({
    _id: id,
    userId: session.user.id,
    status: "completed",
  }).lean()

  if (!workout) {
    notFound()
  }

  const duration = formatDuration(workout.duration)
  const { totalSets, totalVolume } = getWorkoutStats(workout)
  const workoutDate = getWorkoutDate(workout)

  return (
    <div className="p-8 md:p-12 space-y-8">
      <div className="space-y-4">
        <Link
          href="/dashboard/history"
          className="inline-flex rounded-xl bg-secondary px-6 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
        >
          Back to History
        </Link>

        <div>
          <h1 className="text-5xl font-bold tracking-tight">
            {workout.workoutName}
          </h1>

          <p className="text-muted-foreground mt-2 text-lg">
            Completed on {formatDate(workoutDate)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>
              Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {formatDate(workoutDate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {duration || "Not tracked"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {workout.exercises.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Sets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {totalSets}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {totalVolume.toLocaleString()} kg
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {workout.exercises.map((
          exercise: SessionExercise,
          exerciseIndex: number
        ) => (
          <Card key={`${exercise.name}-${exerciseIndex}`}>
            <CardHeader>
              <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                <CardTitle>
                  {exercise.name}
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  {getMuscleGroup(exercise.muscleGroup)}
                </p>
              </div>
            </CardHeader>

            <CardContent>
              {exercise.sets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sets recorded for this exercise.
                </p>
              ) : (
                <div className="space-y-3">
                  {exercise.sets.map((set: SessionSet, index: number) => {
                    const setVolume = getSetVolume(set)

                    return (
                      <div
                        key={`${exercise.name}-${index}`}
                        className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-5"
                      >
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Set
                          </p>
                          <p className="font-semibold">
                            {index + 1}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Reps
                          </p>
                          <p className="font-semibold">
                            {set.reps}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Weight
                          </p>
                          <p className="font-semibold">
                            {set.weight.toLocaleString()} kg
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Volume
                          </p>
                          <p className="font-semibold">
                            {setVolume.toLocaleString()} kg
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <p className="font-semibold">
                            {set.completed ? "Completed" : "Not completed"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
