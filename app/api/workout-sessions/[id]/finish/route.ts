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
  sets?: WorkoutSetInput[]
}

type ExistingWorkoutExercise = {
  muscleGroup?: string
}

type WorkoutSetInput = {
  reps?: unknown
  weight?: unknown
}

type CompletedWorkoutSet = {
  reps: number
  weight: number
}

type CompletedWorkoutExercise = {
  name?: string
  sets?: CompletedWorkoutSet[]
}

type CompletedWorkoutSession = {
  exercises?: CompletedWorkoutExercise[]
}

function getMuscleGroup(value: unknown) {
  return typeof value === "string" &&
    muscleGroups.includes(value as (typeof muscleGroups)[number])
    ? value
    : "Other"
}

function getEstimatedOneRepMax(weight: number, reps: number) {
  return weight * (1 + reps / 30)
}

function getExerciseBestOneRepMax(exercise: WorkoutExerciseInput) {
  if (!Array.isArray(exercise.sets)) {
    return 0
  }

  return exercise.sets.reduce((best, set) => {
    const reps = typeof set.reps === "number" ? set.reps : 0
    const weight = typeof set.weight === "number" ? set.weight : 0

    if (reps <= 0 || weight <= 0) {
      return best
    }

    return Math.max(best, getEstimatedOneRepMax(weight, reps))
  }, 0)
}

function getPreviousRecords(workouts: CompletedWorkoutSession[]) {
  const records = new Map<string, number>()

  workouts.forEach((workout) => {
    workout.exercises?.forEach((exercise) => {
      if (!exercise.name || !Array.isArray(exercise.sets)) {
        return
      }

      const exerciseName = exercise.name

      exercise.sets.forEach((set) => {
        if (set.reps <= 0 || set.weight <= 0) {
          return
        }

        const estimatedOneRepMax = getEstimatedOneRepMax(
          set.weight,
          set.reps
        )
        const current = records.get(exerciseName) || 0

        records.set(exerciseName, Math.max(current, estimatedOneRepMax))
      })
    })
  })

  return records
}

function getPersonalBestExercises(
  incomingExercises: WorkoutExerciseInput[],
  previousRecords: Map<string, number>
) {
  const personalBests = new Set<string>()

  incomingExercises.forEach((exercise) => {
    if (typeof exercise.name !== "string") {
      return
    }

    const bestOneRepMax = getExerciseBestOneRepMax(exercise)

    if (bestOneRepMax <= 0) {
      return
    }

    const previousBest = previousRecords.get(exercise.name) || 0

    if (bestOneRepMax > previousBest) {
      personalBests.add(exercise.name)
    }
  })

  return Array.from(personalBests)
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

export async function POST(
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

    const incomingExercises = Array.isArray(body.exercises)
      ? body.exercises
      : []
    const previousCompletedSessions = await WorkoutSession.find({
      userId: session.user.id,
      status: "completed",
    }).lean()
    const previousRecords = getPreviousRecords(previousCompletedSessions)
    const personalBests = getPersonalBestExercises(
      incomingExercises,
      previousRecords
    )

    if (Array.isArray(body.exercises)) {
      workoutSession.exercises = preserveMuscleGroups(
        incomingExercises,
        workoutSession.exercises
      )
    }

    workoutSession.endedAt = new Date()
    workoutSession.duration = body.duration || 0
    workoutSession.status = "completed"

    await workoutSession.save()

    return NextResponse.json({
      workoutSession,
      personalBests,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
