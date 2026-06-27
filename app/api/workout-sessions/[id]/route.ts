import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import WorkoutSession from "@/models/WorkoutSession"
import { getSession } from "@/lib/auth/auth"

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

type WorkoutExerciseInput = {
  name?: unknown
  muscleGroup?: unknown
}

type ExistingWorkoutExercise = {
  muscleGroup?: string
}

function getMuscleGroup(value: unknown) {
  return typeof value === "string" &&
    muscleGroups.includes(value as (typeof muscleGroups)[number])
    ? value
    : "Other"
}

function preserveMuscleGroups(
  incomingExercises: WorkoutExerciseInput[],
  existingExercises: ExistingWorkoutExercise[]
) {
  return incomingExercises.map((exercise, index) => {
    const existingMuscleGroup = existingExercises[index]?.muscleGroup
    const muscleGroup =
      typeof exercise.muscleGroup === "string"
        ? getMuscleGroup(exercise.muscleGroup)
        : getMuscleGroup(existingMuscleGroup)

    return {
      ...exercise,
      muscleGroup,
    }
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    await connectDB()

    const body = await request.json()

    const workoutSession = await WorkoutSession.findOne({
      _id: id,
      userId: session.user.id,
    })

    if (!workoutSession) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      )
    }

    if (workoutSession.status === "completed") {
      return NextResponse.json(
        { error: "Workout already finished" },
        { status: 400 }
      )
    }

    if (Array.isArray(body.exercises)) {
      workoutSession.exercises = preserveMuscleGroups(
        body.exercises,
        workoutSession.exercises
      )
    }

    workoutSession.duration = body.duration || 0

    await workoutSession.save()

    return NextResponse.json(workoutSession)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
