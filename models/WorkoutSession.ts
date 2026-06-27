import mongoose, { Schema } from "mongoose"

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Glutes",
  "Core",
  "Other",
] as const

const SessionSetSchema = new Schema(
  {
    reps: {
      type: Number,
      default: 0,
    },

    weight: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
)

const SessionExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    muscleGroup: {
      type: String,
      enum: MUSCLE_GROUPS,
      default: "Other",
    },

    sets: {
      type: [SessionSetSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
)

const WorkoutSessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    workoutId: {
      type: Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
    },

    workoutName: {
      type: String,
      required: true,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: 0,
    },

    isPaused: {
      type: Boolean,
      default: false,
    },

    pausedAt: {
      type: Date,
      default: null,
    },

    totalPausedSeconds: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    exercises: {
      type: [SessionExerciseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

if (
  mongoose.models.WorkoutSession &&
  !mongoose.models.WorkoutSession.schema.path("exercises.muscleGroup")
) {
  mongoose.deleteModel("WorkoutSession")
}

const WorkoutSession =
  mongoose.models.WorkoutSession ||
  mongoose.model("WorkoutSession", WorkoutSessionSchema)

export default WorkoutSession
