import connectDB from "@/lib/db"
import Exercise from "@/models/Exercise"
import ExerciseEditor from "@/components/exercise-editor"
import { getSession } from "@/lib/auth/auth"
import { notFound, redirect } from "next/navigation"

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Glutes",
  "Core",
  "Other",
] as const

function getMuscleGroup(value: unknown) {
  return typeof value === "string" &&
    muscleGroups.includes(value as (typeof muscleGroups)[number])
    ? value
    : "Other"
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{
    id: string
    exerciseId: string
  }>
}) {
  const session = await getSession()

  if (!session) {
    redirect("/sign-in")
  }

  const { id, exerciseId } = await params

  await connectDB()

  const exercise = await Exercise.findOne({
    _id: exerciseId,
    workoutId: id,
    userId: session.user.id,
  }).lean()

  if (!exercise) {
    notFound()
  }

  return (
    <div className="p-8 md:p-12">
      <h1 className="text-5xl font-bold tracking-tight">
        {exercise.name}
      </h1>

      <div className="space-y-4 mt-8">
        <ExerciseEditor
            exerciseId={exerciseId}
            workoutId={String(exercise.workoutId)}
            exerciseName={exercise.name}
            initialMuscleGroup={getMuscleGroup(exercise.muscleGroup)}
            initialSets={exercise.sets}
        />
      </div>
    </div>
  )
}
