import mongoose, { Schema } from "mongoose";

export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Glutes",
  "Core",
  "Other",
] as const;

const SetSchema = new Schema(
  {
    reps: {
      type: Number,
      default: 10,
    },

    weight: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const ExerciseSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    workoutId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    muscleGroup: {
      type: String,
      enum: MUSCLE_GROUPS,
      default: "Other",
    },

    sets: {
      type: [SetSchema],
      default: [
        { reps: 10, weight: 0 },
        { reps: 10, weight: 0 },
        { reps: 10, weight: 0 },
        { reps: 10, weight: 0 },
      ],
    },
  },
  {
    timestamps: true,
  }
);

if (
  mongoose.models.Exercise &&
  !mongoose.models.Exercise.schema.path("muscleGroup")
) {
  mongoose.deleteModel("Exercise");
}

const Exercise =
  mongoose.models.Exercise || mongoose.model("Exercise", ExerciseSchema);

export default Exercise;
