import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Workout from "@/models/Workout"
import Exercise from "@/models/Exercise"
import WorkoutSession from "@/models/WorkoutSession"
import { getSession } from "@/lib/auth/auth"

type ExerciseSet = {
  reps: number
  weight: number
}

type WorkoutExercise = {
  name: string
  muscleGroup?: string
  sets: ExerciseSet[]
}

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

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const activeSession = await WorkoutSession.findOne({
        userId: session.user.id,
        status: "active",
    })

    if (activeSession) {
        return NextResponse.json(activeSession)
    }

    const body = await request.json()
    const { workoutId } = body

    const workout = await Workout.findOne({
      _id: workoutId,
      userId: session.user.id,
    }).lean()

    if (!workout) {
      return NextResponse.json(
        { error: "Workout not found" },
        { status: 404 }
      )
    }

    const exercises = await Exercise.find({
      workoutId,
      userId: session.user.id,
    }).lean()

    const workoutSession = await WorkoutSession.create({
      userId: session.user.id,
      workoutId,
      workoutName: workout.name,
      startedAt: new Date(),
      status: "active",
      exercises: exercises.map((exercise: WorkoutExercise) => ({
        name: exercise.name,
        muscleGroup: getMuscleGroup(exercise.muscleGroup),
        sets: exercise.sets.map((set: ExerciseSet) => ({
          reps: set.reps,
          weight: set.weight,
        })),
      })),
    })

    return NextResponse.json(workoutSession)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
