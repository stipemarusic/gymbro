import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Exercise, { MUSCLE_GROUPS } from "@/models/Exercise";
import Workout from "@/models/Workout";
import { getSession } from "@/lib/auth/auth";

function getMuscleGroup(value: unknown) {
  return typeof value === "string" &&
    MUSCLE_GROUPS.includes(value as (typeof MUSCLE_GROUPS)[number])
    ? value
    : "Other";
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const exercises = await Exercise.find({
      userId: session.user.id,
    });

    return NextResponse.json(exercises);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const workout = await Workout.findOne({
      _id: body.workoutId,
      userId: session.user.id,
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Workout not found" },
        { status: 404 }
      );
    }

    const exercise = await Exercise.create({
      userId: session.user.id,
      workoutId: body.workoutId,
      name: body.name,
      muscleGroup: getMuscleGroup(body.muscleGroup),
    });

    return NextResponse.json(exercise);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
