import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ProfileUserId from "@/components/profile-user-id"
import { getSession } from "@/lib/auth/auth"
import connectDB from "@/lib/db"
import Exercise from "@/models/Exercise"
import WorkoutSession from "@/models/WorkoutSession"
import { redirect } from "next/navigation"

type SessionSet = {
  reps: number
  weight: number
}

type SessionExercise = {
  sets: SessionSet[]
}

type CompletedSession = {
  exercises: SessionExercise[]
}

function getWorkoutVolume(workout: CompletedSession) {
  return workout.exercises.reduce((workoutTotal, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
      return setTotal + set.reps * set.weight
    }, 0)

    return workoutTotal + exerciseVolume
  }, 0)
}

function getWorkoutSets(workout: CompletedSession) {
  return workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.length
  }, 0)
}

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect("/sign-in")
  }

  await connectDB()

  const completedSessions = await WorkoutSession.find({
    userId: session.user.id,
    status: "completed",
  }).lean()

  const totalExercises = await Exercise.countDocuments({
    userId: session.user.id,
  })

  const totalVolume = completedSessions.reduce((total, workout: CompletedSession) => {
    return total + getWorkoutVolume(workout)
  }, 0)

  const totalSets = completedSessions.reduce((total, workout: CompletedSession) => {
    return total + getWorkoutSets(workout)
  }, 0)

  return (
    <div className="p-8 md:p-12 space-y-8">
      <div>
        <h1 className="text-5xl font-bold tracking-tight">
          Profile
        </h1>

        <p className="text-muted-foreground mt-2 text-lg">
          View your account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Account Overview
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {session.user.name && (
            <div>
              <p className="text-sm text-muted-foreground">
                Name
              </p>
              <p className="font-semibold">
                {session.user.name}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>
            <p className="font-semibold">
              {session.user.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              User ID
            </p>
            <ProfileUserId userId={session.user.id} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Completed Workouts
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {completedSessions.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Total Exercises
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {totalExercises}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Total Sets
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {totalSets.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Total Volume
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {totalVolume.toLocaleString()} kg
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="font-semibold">
            Profile editing is not available yet.
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            Account changes will be added in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
