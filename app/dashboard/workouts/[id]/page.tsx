import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import connectDB from "@/lib/db"
import Exercise from "@/models/Exercise"
import Workout from "@/models/Workout"
import Link from "next/link"
import DeleteWorkoutButton from "@/components/delete-workout-button"
import StartWorkoutButton from "@/components/start-workout-button"
import { getSession } from "@/lib/auth/auth"
import { notFound, redirect } from "next/navigation"
import { Pencil, Plus } from "lucide-react"

type Exercise = {
  _id: string
  name: string
  sets?: unknown[]
}

export default async function WorkoutPage({
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

  const workout = await Workout.findOne({
    _id: id,
    userId: session.user.id,
  }).lean()

  if (!workout) {
    notFound()
  }

  const exercises = await Exercise.find({
    workoutId: id,
    userId: session.user.id,
  }).lean()

  return (
    <div className="p-8 md:p-12">
      <div>
        <h1 className="text-5xl font-bold tracking-tight">
          {workout.name}
        </h1>

        <p className="text-muted-foreground mt-2 text-lg">
          {workout.description || "No description"}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <StartWorkoutButton workoutId={id} />

        <Link
          href={`/dashboard/workouts/${id}/new-exercise`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100"
        >
          <Plus className="h-4 w-4" />
          Add Exercise
        </Link>

        <Link
          href={`/dashboard/workouts/${id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/10"
        >
          <Pencil className="h-4 w-4" />
          Edit Workout
        </Link>
          <DeleteWorkoutButton
          workoutId={id}
        />
      </div>
      <div className="grid gap-4 mt-8 md:grid-cols-2 xl:grid-cols-3">
        {exercises.map((exercise: Exercise) => (
          <Link key={exercise._id} href={`/dashboard/workouts/${id}/exercise/${exercise._id}`}>
            <Card className="cursor-pointer border border-white/10 hover:border-secondary hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300">
              <CardHeader>
                <CardTitle>
                  {exercise.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exercise.sets?.length || 4} sets
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
