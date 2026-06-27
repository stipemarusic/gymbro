import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import Link from "next/link"
import connectDB from "@/lib/db"
import Workout from "@/models/Workout"
import Exercise from "@/models/Exercise"
import { getSession } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

type Workout = {
  _id: string
  name: string
  description?: string
}

type Exercise = {
  workoutId: string
}

export default async function WorkoutsPage() {
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

  return (
    <div className="p-8 md:p-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">
            Workouts
          </h1>

          <p className="text-muted-foreground mt-3 text-lg">
            Manage your training plans and exercises.
          </p>

          <p className="text-secondary mt-4 font-semibold">
            {workouts.length} workout{workouts.length !== 1 ? "s" : ""}{" - "}
            {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Link
          href="/dashboard/workouts/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
        >
          <Plus className="h-4 w-4" />
          Create Workout
        </Link>
      </div>

      {workouts.length === 0 ? (
        <Card className="border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-2xl font-semibold">
              No workouts yet
            </h3>

            <p className="text-muted-foreground mt-3">
              Create your first workout to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {workouts.map((workout: Workout) => {
            const exerciseCount = exercises.filter(
              (exercise: Exercise) =>
                exercise.workoutId.toString() === workout._id.toString()
            ).length

            return (
              <Link
                key={workout._id}
                href={`/dashboard/workouts/${workout._id}`}
              >
                <Card className="h-35 cursor-pointer border border-white/10 transition-all duration-300 hover:border-secondary hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {workout.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex h-full flex-col justify-between">
                    <p className="text-muted-foreground">
                      {workout.description || "No description"}
                    </p>

                    <div>
                      <p className="text-secondary text-sm font-semibold">
                        {exerciseCount} exercise
                        {exerciseCount !== 1 ? "s" : ""}
                      </p>
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
