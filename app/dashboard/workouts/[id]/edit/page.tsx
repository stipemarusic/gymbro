import connectDB from "@/lib/db"
import Workout from "@/models/Workout"
import EditWorkoutForm from "@/components/edit-workout-form"
import { getSession } from "@/lib/auth/auth"
import { notFound, redirect } from "next/navigation"

export default async function EditWorkoutPage({
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

  return (
    <div className="max-w-2xl p-8 md:p-12">
      <h1 className="text-5xl font-bold tracking-tight">
        Edit Workout
      </h1>

      <p className="text-muted-foreground mt-2 mb-8 text-lg">
        Update your workout information.
      </p>

      <EditWorkoutForm
        workoutId={id}
        initialName={workout.name}
        initialDescription={workout.description}
      />
    </div>
  )
}
