import { Schema, model, models } from "mongoose";

const WorkoutSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Workout =
  models.Workout || model("Workout", WorkoutSchema);

export default Workout;
