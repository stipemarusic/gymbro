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
import { redirect } from "next/navigation"

type SessionSet = {
  reps: number
  weight: number
}

type SessionExercise = {
  name: string
  muscleGroup?: string
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

function getWorkoutDate(workout: CompletedSession) {
  return workout.endedAt || workout.startedAt || workout.createdAt
}

function getWorkoutStats(workout: CompletedSession) {
  const totalSets = workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.length
  }, 0)

  const totalVolume = workout.exercises.reduce((workoutTotal, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
      return setTotal + set.reps * set.weight
    }, 0)

    return workoutTotal + exerciseVolume
  }, 0)

  return {
    totalSets,
    totalVolume,
  }
}

export default async function HistoryPage() {
  const session = await getSession()

  if (!session) {
    redirect("/sign-in")
  }

  await connectDB()

  const completedSessions = await WorkoutSession.find({
    userId: session.user.id,
    status: "completed",
  })
    .sort({ endedAt: -1, startedAt: -1, createdAt: -1 })
    .lean()

  return (
    <div className="p-8 md:p-12 space-y-8">
      <div>
        <h1 className="text-5xl font-bold tracking-tight">
          Workout History
        </h1>

        <p className="text-muted-foreground mt-2 text-lg">
          Review your completed workouts.
        </p>
      </div>

      {completedSessions.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-semibold">
              No completed workouts yet.
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Finish your first workout to build your training history.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {completedSessions.map((workout: CompletedSession) => {
            const duration = formatDuration(workout.duration)
            const { totalSets, totalVolume } = getWorkoutStats(workout)
            const workoutDate = getWorkoutDate(workout)

            return (
              <Link
                key={workout._id}
                href={`/dashboard/history/${workout._id}`}
                className="block"
              >
            <Card className="cursor-pointer border border-white/10 transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                  <CardHeader>
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <CardTitle>
                        {workout.workoutName}
                      </CardTitle>

                      <p className="text-sm text-muted-foreground">
                        {formatDate(workoutDate)}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Date
                        </p>
                        <p className="font-semibold">
                          {formatDate(workoutDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Duration
                        </p>
                        <p className="font-semibold">
                          {duration || "Not tracked"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Exercises
                        </p>
                        <p className="font-semibold">
                          {workout.exercises.length}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Sets
                        </p>
                        <p className="font-semibold">
                          {totalSets}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Volume
                        </p>
                        <p className="font-semibold">
                          {totalVolume > 0
                            ? `${totalVolume.toLocaleString()} kg`
                            : "Not tracked"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold">
                        Exercises
                      </p>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {workout.exercises.map((exercise) => (
                          <div
                            key={`${workout._id}-${exercise.name}`}
                            className="rounded-xl border border-white/10 p-3"
                          >
                            <p className="font-semibold">
                              {exercise.name}
                            </p>

                            <p className="text-sm text-muted-foreground mt-1">
                              {exercise.sets.length} set
                              {exercise.sets.length === 1 ? "" : "s"} &bull;{" "}
                              {getMuscleGroup(exercise.muscleGroup)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
