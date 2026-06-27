"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import ConfirmDialog from "@/components/confirm-dialog"
import TextInputDialog from "@/components/text-input-dialog"
import { Pause, Play, Plus, Trash2, Check, Flag } from "lucide-react"
import { exerciseNameSuggestions } from "@/lib/exercise-suggestions"
import { queueFeedback } from "@/lib/feedback"

type WorkoutSet = {
  reps: number
  weight: number
  completed: boolean
}

type WorkoutExercise = {
  name: string
  muscleGroup?: string
  completed: boolean
  sets: WorkoutSet[]
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
]

export default function ActiveWorkoutClient({
  sessionId,
  workoutName,
  initialIsPaused,
  initialDuration,
  initialExercises,
}: {
  sessionId: string
  workoutName: string
  startedAt: string
  initialIsPaused: boolean
  initialDuration: number
  totalPausedSeconds: number
  initialExercises: WorkoutExercise[]
}) {
  const router = useRouter()

  const [seconds, setSeconds] = useState(initialDuration)

  const [isPaused, setIsPaused] = useState(initialIsPaused)
  const [isFinishing, setIsFinishing] = useState(false)
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0)
  const [exercises, setExercises] = useState(initialExercises)
  const [saveStatus, setSaveStatus] = useState("Saved")
  const [error, setError] = useState("")
  const [confirmAction, setConfirmAction] = useState<
    "deleteExercise" | "finishWorkout" | null
  >(null)
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)

    const exercisesRef = useRef(exercises)
    const secondsRef = useRef(seconds)

    useEffect(() => {
        exercisesRef.current = exercises
    }, [exercises])

    useEffect(() => {
        secondsRef.current = seconds
    }, [seconds])

  const activeExercise = exercises[selectedExerciseIndex]

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused])

  function formatTime(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  function updateSet(
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) {
    const updatedExercises = [...exercises]
    updatedExercises[selectedExerciseIndex].sets[setIndex][field] = value
    setExercises(updatedExercises)
  }

  function toggleSetCompleted(setIndex: number) {
    const updatedExercises = [...exercises]
    const exercise = updatedExercises[selectedExerciseIndex]

    exercise.sets[setIndex].completed =
      !exercise.sets[setIndex].completed

    exercise.completed =
      exercise.sets.length > 0 &&
      exercise.sets.every((set) => set.completed)

    setExercises(updatedExercises)
  }

  function toggleExerciseCompleted() {
    const updatedExercises = [...exercises]
    const exercise = updatedExercises[selectedExerciseIndex]

    const newValue = !exercise.completed

    exercise.completed = newValue

    exercise.sets = exercise.sets.map((set) => ({
      ...set,
      completed: newValue,
    }))

    setExercises(updatedExercises)
  }

  function addSet() {
    const updatedExercises = [...exercises]
    const exercise = updatedExercises[selectedExerciseIndex]

    exercise.sets.push({
      reps: 0,
      weight: 0,
      completed: false,
    })

    exercise.completed = false

    setExercises(updatedExercises)
  }

  function deleteSet(setIndex: number) {
    const updatedExercises = [...exercises]
    const exercise = updatedExercises[selectedExerciseIndex]

    if (exercise.sets.length === 1) {
      return
    }

    exercise.sets = exercise.sets.filter(
      (_, index) => index !== setIndex
    )

    exercise.completed =
      exercise.sets.length > 0 &&
      exercise.sets.every((set) => set.completed)

    setExercises(updatedExercises)
  }

  function addExercise(name: string, muscleGroup = "Other") {
    const newExercise: WorkoutExercise = {
      name,
      muscleGroup,
      completed: false,
      sets: [
        {
          reps: 0,
          weight: 0,
          completed: false,
        },
      ],
    }

    const updatedExercises = [...exercises, newExercise]

    setExercises(updatedExercises)
    setSelectedExerciseIndex(updatedExercises.length - 1)
    setIsAddExerciseOpen(false)
    queueFeedback({
      title: "Exercise added",
      description: `${name} was added to this workout.`,
      variant: "success",
    })
  }

  function deleteExercise() {
    if (!activeExercise) return

    const updatedExercises = exercises.filter(
      (_, index) => index !== selectedExerciseIndex
    )

    setExercises(updatedExercises)
    queueFeedback({
      title: "Exercise removed",
      description: `${activeExercise.name} was removed from this session.`,
      variant: "success",
    })

    if (selectedExerciseIndex > 0) {
      setSelectedExerciseIndex(selectedExerciseIndex - 1)
    } else {
      setSelectedExerciseIndex(0)
    }
  }

    async function handlePauseResume() {
        setError("")
        const action = isPaused ? "resume" : "pause"

        const response = await fetch(
            `/api/workout-sessions/${sessionId}/pause`,
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action,
                duration: seconds,
            }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            setError(data.error || "Failed to update timer")
            return
        }

        setIsPaused(data.isPaused)

        if (typeof data.duration === "number") {
            setSeconds(data.duration)
        }

        setSaveStatus("Saved")
    }

  async function finishWorkout() {
    if (isFinishing) return

    setError("")
    setIsFinishing(true)

    const response = await fetch(
      `/api/workout-sessions/${sessionId}/finish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exercises,
          duration: seconds,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || "Failed to finish workout")
      setIsFinishing(false)
      return
    }

    const personalBests = Array.isArray(data.personalBests)
      ? data.personalBests
      : []

    if (personalBests.length > 0) {
      queueFeedback({
        title: "Workout finished",
        description: `New personal best${
          personalBests.length === 1 ? "" : "s"
        }: ${personalBests.slice(0, 3).join(", ")}${
          personalBests.length > 3 ? " and more" : ""
        }.`,
        variant: "success",
      })
    } else {
      queueFeedback({
        title: "Workout finished",
        description: "Your completed workout was saved to history.",
        variant: "success",
      })
    }

    router.replace("/dashboard")
  }
  
  const autosaveWorkout = useCallback(async () => {
        setSaveStatus("Saving...")

        const response = await fetch(`/api/workout-sessions/${sessionId}`, {
            method: "PATCH",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            exercises: exercisesRef.current,
            duration: secondsRef.current,
            }),
        })

        if (response.ok) {
            setSaveStatus("Saved")
        } else {
            setSaveStatus("Not saved")
        }
    }, [sessionId])

    useEffect(() => {
        const interval = setInterval(() => {
            autosaveWorkout()
        }, 5000)

        return () => clearInterval(interval)
    }, [autosaveWorkout])

  return ( 
    <div className="p-8 md:p-12">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-secondary font-semibold mb-2">
            Active Workout
          </p>

          <h1 className="text-5xl font-bold">
            {workoutName}
          </h1>

          <div className="mt-4 flex items-center gap-4">
            <p className="text-3xl font-mono">
              {formatTime(seconds)}
            </p>

            <span
              className={`rounded-full px-4 py-1 text-sm font-semibold ${
                isPaused
                  ? "bg-yellow-500 text-black"
                  : "bg-green-500 text-black"
              }`}
            >
              {isPaused ? "Paused" : "Running"}
            </span>
            <span className="rounded-full border border-white/10 px-4 py-1 text-sm font-semibold text-muted-foreground">
                {saveStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePauseResume}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 font-semibold hover:bg-white/10 transition"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isPaused ? "Resume Timer" : "Pause Timer"}
          </button>

          <button
            onClick={() => setConfirmAction("finishWorkout")}
            disabled={isFinishing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-8 py-3 font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(6,182,212,0.42)] active:translate-y-px active:scale-100 disabled:opacity-60"
          >
            <Flag className="h-4 w-4" />
            {isFinishing ? "Finishing..." : "Finish Workout"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-3">
        {exercises.map((exercise, index) => (
          <button
            key={index}
            onClick={() => setSelectedExerciseIndex(index)}
            className={`rounded-xl px-5 py-3 font-semibold transition ${
              selectedExerciseIndex === index
                ? "bg-secondary text-black"
                : "border border-white/10 hover:bg-white/10"
            }`}
          >
            {exercise.completed ? "✓ " : ""}
            {exercise.name}
          </button>
        ))}

        <button
          onClick={() => setIsAddExerciseOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary px-5 py-3 font-semibold text-secondary hover:bg-secondary hover:text-black transition"
        >
          <Plus className="h-4 w-4" />
          Add Exercise
        </button>
      </div>

      {!activeExercise ? (
        <div className="rounded-2xl border border-white/10 p-8">
          <h2 className="text-2xl font-bold">
            No exercises
          </h2>

          <p className="text-muted-foreground mt-2">
            Add an exercise to continue this workout.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                Exercise
              </p>

              <h2 className="text-3xl font-bold">
                {activeExercise.name}
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleExerciseCompleted}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${
                  activeExercise.completed
                    ? "bg-green-500 text-black"
                    : "border border-white/10 hover:bg-white/10"
                }`}
              >
                <Check className="h-4 w-4" />
                {activeExercise.completed
                  ? "Exercise Done"
                  : "Mark Exercise Done"}
              </button>

              <button
                onClick={() => setConfirmAction("deleteExercise")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 transition"
              >
                <Trash2 className="h-4 w-4" />
                Delete Exercise
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {activeExercise.sets.map((set, setIndex) => (
              <div
                key={setIndex}
                className={`grid gap-4 rounded-xl border p-4 md:grid-cols-[100px_1fr_1fr_auto_auto] md:items-end ${
                  set.completed
                    ? "border-green-500/40 bg-green-500/10"
                    : "border-white/10"
                }`}
              >
                <div className="font-semibold">
                  Set {setIndex + 1}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Reps
                  </label>

                  <input
                    type="number"
                    value={set.reps}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      updateSet(
                        setIndex,
                        "reps",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Kg
                  </label>

                  <input
                    type="number"
                    value={set.weight}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      updateSet(
                        setIndex,
                        "weight",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-background/80 p-3 text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                  />
                </div>

                <button
                  onClick={() => toggleSetCompleted(setIndex)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition md:self-end ${
                    set.completed
                      ? "bg-green-500 text-black"
                      : "border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {set.completed ? "Done" : "Mark Done"}
                </button>

                <button
                  onClick={() => deleteSet(setIndex)}
                  aria-label={`Delete set ${setIndex + 1}`}
                  title="Delete set"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 font-semibold text-white transition hover:bg-red-700 md:self-end"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addSet}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-secondary px-6 py-3 font-semibold text-secondary hover:bg-secondary hover:text-black transition"
          >
            <Plus className="h-4 w-4" />
            Add Set
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirmAction === "deleteExercise"}
        title="Delete exercise?"
        description="This will remove this exercise from the active workout."
        confirmLabel="Delete Exercise"
        destructive
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          deleteExercise()
          setConfirmAction(null)
        }}
      />

      <ConfirmDialog
        open={confirmAction === "finishWorkout"}
        title="Finish workout?"
        description="This will save your completed sets and move this workout to history."
        confirmLabel="Finish Workout"
        loading={isFinishing}
        onCancel={() => setConfirmAction(null)}
        onConfirm={finishWorkout}
      />

      <TextInputDialog
        open={isAddExerciseOpen}
        title="Add exercise"
        description="Add a new exercise to this active workout."
        label="Exercise Name"
        placeholder="Bench Press"
        suggestions={exerciseNameSuggestions}
        selectLabel="Muscle Group"
        selectOptions={muscleGroups}
        defaultSelectValue="Other"
        confirmLabel="Add Exercise"
        onCancel={() => setIsAddExerciseOpen(false)}
        onConfirm={addExercise}
      />
    </div>
  )
}
