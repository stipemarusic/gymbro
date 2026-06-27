import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { getSession } from "@/lib/auth/auth"
import connectDB from "@/lib/db"
import WorkoutSession from "@/models/WorkoutSession"
import RecordsFilter from "@/components/records-filter"
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
  startedAt?: Date
  endedAt?: Date
  createdAt: Date
  exercises: SessionExercise[]
}

type ExerciseRecord = {
  name: string
  muscleGroup: string
  maxWeight: number
  bestReps: number
  bestEstimatedOneRepMax: number
  bestVolumeSet: number
  date: Date
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

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getEstimatedOneRepMax(weight: number, reps: number) {
  return weight * (1 + reps / 30)
}

function getMuscleGroup(value: unknown) {
  return typeof value === "string" &&
    muscleGroups.includes(value as (typeof muscleGroups)[number])
    ? value
    : "Other"
}

function getMuscleGroupSortIndex(muscleGroup: string) {
  const index = muscleGroups.findIndex((group) => group === muscleGroup)
  return index === -1 ? muscleGroups.length - 1 : index
}

function getWorkoutDate(workout: CompletedSession) {
  return workout.endedAt || workout.startedAt || workout.createdAt
}

function getRecords(workouts: CompletedSession[]) {
  const records = new Map<string, ExerciseRecord>()

  workouts.forEach((workout) => {
    const workoutDate = getWorkoutDate(workout)

    workout.exercises.forEach((exercise) => {
      const muscleGroup = getMuscleGroup(exercise.muscleGroup)

      exercise.sets.forEach((set) => {
        if (set.weight <= 0 || set.reps <= 0) {
          return
        }

        const volume = set.weight * set.reps
        const estimatedOneRepMax = getEstimatedOneRepMax(
          set.weight,
          set.reps
        )
        const current = records.get(exercise.name)

        if (!current) {
          records.set(exercise.name, {
            name: exercise.name,
            muscleGroup,
            maxWeight: set.weight,
            bestReps: set.reps,
            bestEstimatedOneRepMax: estimatedOneRepMax,
            bestVolumeSet: volume,
            date: workoutDate,
          })
          return
        }

        current.maxWeight = Math.max(current.maxWeight, set.weight)
        current.bestReps = Math.max(current.bestReps, set.reps)
        current.bestEstimatedOneRepMax = Math.max(
          current.bestEstimatedOneRepMax,
          estimatedOneRepMax
        )
        current.bestVolumeSet = Math.max(current.bestVolumeSet, volume)

        if (
          estimatedOneRepMax >= current.bestEstimatedOneRepMax ||
          volume >= current.bestVolumeSet
        ) {
          current.date = workoutDate
        }
      })
    })
  })

  return Array.from(records.values()).sort((a, b) => {
    const groupDifference =
      getMuscleGroupSortIndex(a.muscleGroup) -
      getMuscleGroupSortIndex(b.muscleGroup)

    if (groupDifference !== 0) {
      return groupDifference
    }

    const oneRepMaxDifference =
      b.bestEstimatedOneRepMax - a.bestEstimatedOneRepMax

    if (oneRepMaxDifference !== 0) {
      return oneRepMaxDifference
    }

    const maxWeightDifference = b.maxWeight - a.maxWeight

    if (maxWeightDifference !== 0) {
      return maxWeightDifference
    }

    return a.name.localeCompare(b.name)
  })
}

export default async function RecordsPage() {
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

  const records = getRecords(completedSessions)
  const filterRecords = records.map((record) => ({
    name: record.name,
    muscleGroup: record.muscleGroup,
    maxWeight: record.maxWeight,
    bestReps: record.bestReps,
    bestEstimatedOneRepMax: record.bestEstimatedOneRepMax,
    bestVolumeSet: record.bestVolumeSet,
    dateLabel: formatDate(record.date),
  }))

  return (
    <div className="p-8 md:p-12 space-y-8">
      <div>
        <h1 className="text-5xl font-bold tracking-tight">
          Records
        </h1>

        <p className="text-muted-foreground mt-2 text-lg">
          Track your best completed workout sets.
        </p>
      </div>

      {filterRecords.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-semibold">
              No records yet. Finish a workout with weighted sets to see records.
            </p>
          </CardContent>
        </Card>
      ) : (
        <RecordsFilter records={filterRecords} />
      )}
    </div>
  )
}
