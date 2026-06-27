import Link from "next/link"
import { redirect } from "next/navigation"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import connectDB from "@/lib/db"
import Workout from "@/models/Workout"
import Exercise from "@/models/Exercise"
import WorkoutSession from "@/models/WorkoutSession"
import { getSession } from "@/lib/auth/auth"

type SessionSet = {
  reps: number
  weight: number
}

type SessionExercise = {
  name: string
  sets: SessionSet[]
}

type CompletedSession = {
  _id: string
  workoutName: string
  duration?: number
  startedAt?: Date
  endedAt?: Date
  createdAt: Date
  exercises: SessionExercise[]
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }

  return `${minutes}min`
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getWorkoutDate(workout: CompletedSession) {
  return workout.endedAt || workout.startedAt || workout.createdAt
}

export default async function Dashboard() {
  const session = await getSession()

  if (!session) {
    redirect("/sign-in")
  }

  await connectDB()

  const workouts = await Workout.find({
    userId: session.user.id,
  }).lean()

  const exercises = await Exercise.find({
    userId: session.user.id,
  }).lean()

  const completedSessions = await WorkoutSession.find({
    userId: session.user.id,
    status: "completed",
  })
    .sort({ endedAt: -1, startedAt: -1, createdAt: -1 })
    .lean()

  const activeSession = await WorkoutSession.findOne({
    userId: session.user.id,
    status: "active",
  }).lean()

  const totalVolume = completedSessions.reduce((total: number, workout: CompletedSession) => {
    const workoutVolume = workout.exercises.reduce(
      (exerciseTotal: number, exercise: SessionExercise) => {
        const exerciseVolume = exercise.sets.reduce(
          (setTotal: number, set: SessionSet) => {
            return setTotal + set.reps * set.weight
          },
          0
        )

        return exerciseTotal + exerciseVolume
      },
      0
    )

    return total + workoutVolume
  }, 0)

  const recordExercises = new Set<string>()

  completedSessions.forEach((workout: CompletedSession) => {
    workout.exercises.forEach((exercise: SessionExercise) => {
      const hasWeight = exercise.sets.some((set: SessionSet) => set.weight > 0)

      if (hasWeight) {
        recordExercises.add(exercise.name)
      }
    })
  })

  const recentWorkouts = completedSessions.slice(0, 3)

  return (
    <div className="p-8 md:p-12 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="text-muted-foreground mt-2 text-lg">
            Track your workouts and progress.
          </p>
        </div>

        <Link
          href="/dashboard/workouts"
          className="rounded-xl bg-secondary px-6 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
        >
          Start Workout
        </Link>
      </div>

      {activeSession && (
        <Card className="border-secondary/40 bg-secondary/5">
          <CardHeader>
            <CardTitle className="text-secondary">
              Active Workout
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-2xl font-bold">
                {activeSession.workoutName}
              </p>

              <p className="text-muted-foreground mt-1">
                Duration:{" "}
                {formatDuration(activeSession.duration || 0)}{" - "}
                {activeSession.isPaused ? "Paused" : "Running"}
              </p>
            </div>

            <Link
              href={`/dashboard/active-workout/${activeSession._id}`}
              className="rounded-xl bg-secondary px-6 py-3 font-semibold text-black text-center shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
            >
              Continue Workout
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Workout Plans</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {workouts.length}
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Saved templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Workouts</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {completedSessions.length}
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Finished sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Volume</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {totalVolume >= 1000
                ? `${(totalVolume / 1000).toFixed(1)}k`
                : totalVolume}
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Kilograms lifted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracked Exercises</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {exercises.length}
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Exercises in plans
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>

          <CardContent>
            <Link
              href="/dashboard/progress"
              className="group flex h-80 flex-col justify-center rounded-xl border border-white/10 bg-secondary/5 p-6 transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
            >
              <p className="text-lg font-semibold text-secondary">
                View Progress Dashboard
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Open your charts for muscle balance, volume trends, weekly workouts, and daily activity.
              </p>

              <span className="mt-6 inline-flex w-fit rounded-xl bg-secondary px-6 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_28px_rgba(6,182,212,0.42)]">
                Open Progress
              </span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Records</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col items-center justify-center h-80">
              <p className="text-7xl font-bold text-secondary">
                {recordExercises.size}
              </p>

              <p className="text-muted-foreground mt-2">
                Exercises with recorded weight
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {recentWorkouts.length === 0 ? (
            <div className="rounded-xl border p-6">
              <p className="font-semibold">
                No completed workouts yet
              </p>

              <p className="text-sm text-muted-foreground mt-1">
                Start and finish a workout to see it here.
              </p>
            </div>
          ) : (
            recentWorkouts.map((workout: CompletedSession) => (
              <div
                key={workout._id}
                className="rounded-xl border p-4"
              >
                <p className="font-semibold">
                  {workout.workoutName}
                </p>

                <p className="text-sm text-muted-foreground">
                  {formatDate(getWorkoutDate(workout))}{" - "}
                  {formatDuration(workout.duration || 0)}{" - "}
                  {workout.exercises.length} exercises
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
