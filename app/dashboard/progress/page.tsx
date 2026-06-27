import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession } from "@/lib/auth/auth"
import connectDB from "@/lib/db"
import WorkoutSession from "@/models/WorkoutSession"
import { redirect } from "next/navigation"
import WeeklyCharts from "./weekly-charts"

type SessionSet = {
  reps: number
  weight: number
}

type SessionExercise = {
  muscleGroup?: string
  sets: SessionSet[]
}

type CompletedSession = {
  startedAt?: Date
  endedAt?: Date
  createdAt: Date
  exercises: SessionExercise[]
}

type DailyActivity = {
  key: string
  label: string
  workoutCount: number
}

type DailyVolume = {
  key: string
  label: string
  volume: number
}

type WeeklyStats = {
  key: string
  label: string
  shortLabel: string
  workouts: number
  sets: number
  volume: number
}

type MuscleBalance = {
  muscleGroup: string
  sets: number
}

const dayInMs = 24 * 60 * 60 * 1000
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

function startOfDay(date: Date) {
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day
}

function startOfWeek(date: Date) {
  const week = startOfDay(date)
  const day = week.getDay()
  const diff = day === 0 ? -6 : 1 - day
  week.setDate(week.getDate() + diff)
  return week
}

function getDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })
}

function formatWeekLabel(date: Date) {
  return `Week of ${formatDayLabel(date)}`
}

function getWorkoutSets(workout: CompletedSession) {
  return workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.length
  }, 0)
}

function getWorkoutVolume(workout: CompletedSession) {
  return workout.exercises.reduce((workoutTotal, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
      return setTotal + set.reps * set.weight
    }, 0)

    return workoutTotal + exerciseVolume
  }, 0)
}

function getWorkoutDate(workout: CompletedSession) {
  return workout.endedAt || workout.startedAt || workout.createdAt
}

function getMuscleGroup(value: unknown) {
  return typeof value === "string" &&
    muscleGroups.includes(value as (typeof muscleGroups)[number])
    ? value
    : "Other"
}

function getMuscleBalance(workouts: CompletedSession[]) {
  const today = startOfDay(new Date())
  const startDate = new Date(today.getTime() - 29 * dayInMs)
  const balance = new Map<string, MuscleBalance>()

  muscleGroups.forEach((muscleGroup) => {
    balance.set(muscleGroup, {
      muscleGroup,
      sets: 0,
    })
  })

  workouts.forEach((workout) => {
    const workoutDate = getWorkoutDate(workout)

    if (startOfDay(workoutDate) < startDate) {
      return
    }

    workout.exercises.forEach((exercise) => {
      const muscleGroup = getMuscleGroup(exercise.muscleGroup)
      const current = balance.get(muscleGroup)

      if (current) {
        current.sets += exercise.sets.length
      }
    })
  })

  return Array.from(balance.values())
}

function getDailyActivity(workouts: CompletedSession[]) {
  const today = startOfDay(new Date())
  const activity = new Map<string, DailyActivity>()

  for (let index = 13; index >= 0; index -= 1) {
    const date = new Date(today.getTime() - index * dayInMs)
    const key = getDateKey(date)

    activity.set(key, {
      key,
      label: formatDayLabel(date),
      workoutCount: 0,
    })
  }

  workouts.forEach((workout) => {
    const key = getDateKey(getWorkoutDate(workout))
    const day = activity.get(key)

    if (day) {
      day.workoutCount += 1
    }
  })

  return Array.from(activity.values())
}

function getDailyVolume(workouts: CompletedSession[]) {
  const today = startOfDay(new Date())
  const volumeByDay = new Map<string, DailyVolume>()

  for (let index = 13; index >= 0; index -= 1) {
    const date = new Date(today.getTime() - index * dayInMs)
    const key = getDateKey(date)

    volumeByDay.set(key, {
      key,
      label: formatDayLabel(date),
      volume: 0,
    })
  }

  workouts.forEach((workout) => {
    const key = getDateKey(getWorkoutDate(workout))
    const day = volumeByDay.get(key)

    if (day) {
      day.volume += getWorkoutVolume(workout)
    }
  })

  return Array.from(volumeByDay.values())
}

function getWeeklyStats(workouts: CompletedSession[]) {
  const stats = new Map<string, WeeklyStats>()
  const thisWeekStart = startOfWeek(new Date())

  for (let index = 5; index >= 0; index -= 1) {
    const weekStart = new Date(
      thisWeekStart.getTime() - index * 7 * dayInMs
    )
    const key = getDateKey(weekStart)

    stats.set(key, {
      key,
      label: formatWeekLabel(weekStart),
      shortLabel: formatDayLabel(weekStart),
      workouts: 0,
      sets: 0,
      volume: 0,
    })
  }

  workouts.forEach((workout) => {
    const weekStart = startOfWeek(getWorkoutDate(workout))
    const key = getDateKey(weekStart)
    const current = stats.get(key)

    if (!current) {
      return
    }

    current.workouts += 1
    current.sets += getWorkoutSets(workout)
    current.volume += getWorkoutVolume(workout)

    stats.set(key, current)
  })

  return Array.from(stats.values()).sort((a, b) =>
    a.key.localeCompare(b.key)
  )
}

function getThisWeekSummary(workouts: CompletedSession[]) {
  const weekStart = startOfWeek(new Date())
  const today = startOfDay(new Date())
  const daysElapsed = Math.floor(
    (today.getTime() - weekStart.getTime()) / dayInMs
  ) + 1
  const thisWeekWorkouts = workouts.filter((workout) => {
    return startOfDay(getWorkoutDate(workout)) >= weekStart
  })
  const trainedDays = new Set(
    thisWeekWorkouts.map((workout) => getDateKey(getWorkoutDate(workout)))
  )

  return {
    workouts: thisWeekWorkouts.length,
    restDays: Math.max(daysElapsed - trainedDays.size, 0),
    sets: thisWeekWorkouts.reduce((total, workout) => {
      return total + getWorkoutSets(workout)
    }, 0),
    volume: thisWeekWorkouts.reduce((total, workout) => {
      return total + getWorkoutVolume(workout)
    }, 0),
  }
}

function StatCard({
  title,
  value,
  helper,
}: {
  title: string
  value: string | number
  helper: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-4xl font-bold text-secondary">
          {value}
        </p>

        <p className="text-sm text-muted-foreground mt-1">
          {helper}
        </p>
      </CardContent>
    </Card>
  )
}

export default async function ProgressPage() {
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

  const summary = getThisWeekSummary(completedSessions)
  const dailyActivity = getDailyActivity(completedSessions)
  const dailyVolume = getDailyVolume(completedSessions)
  const weeklyStats = getWeeklyStats(completedSessions)
  const muscleBalance = getMuscleBalance(completedSessions)

  return (
    <div className="p-8 md:p-12 space-y-8">
      <div>
        <h1 className="text-5xl font-bold tracking-tight">
          Progress
        </h1>

        <p className="text-muted-foreground mt-2 text-lg">
          Review your training consistency and weekly workload.
        </p>
      </div>

      {completedSessions.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-semibold">
              No completed workouts yet.
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Finish a workout to start tracking progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Workouts This Week"
              value={summary.workouts}
              helper="Completed sessions"
            />
            <StatCard
              title="Rest Days This Week"
              value={summary.restDays}
              helper="Days without a completed workout"
            />
            <StatCard
              title="Total Sets This Week"
              value={summary.sets}
              helper="Recorded sets"
            />
            <StatCard
              title="Total Volume This Week"
              value={`${summary.volume} kg`}
              helper="Weight multiplied by reps"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Daily Activity
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
                {dailyActivity.map((day) => (
                  <div
                    key={day.key}
                    className={`rounded-xl border p-4 ${
                      day.workoutCount > 0
                        ? "border-secondary bg-secondary/10"
                        : "border-white/10"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {day.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {day.workoutCount > 0
                        ? `${day.workoutCount} workout${
                            day.workoutCount === 1 ? "" : "s"
                          }`
                        : "Rest"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <WeeklyCharts
            weeklyData={weeklyStats}
            muscleBalanceData={muscleBalance}
            dailyVolumeData={dailyVolume}
          />
        </>
      )}
    </div>
  )
}
