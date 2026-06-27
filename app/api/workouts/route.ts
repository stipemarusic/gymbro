import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Workout from "@/models/Workout"
import { getSession } from "@/lib/auth/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const workouts = await Workout.find({
      userId: session.user.id,
    })

    return NextResponse.json(workouts)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
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

    const body = await request.json()

    const workout = await Workout.create({
      userId: session.user.id,
      name: body.name,
      description: body.description,
    })

    return NextResponse.json(workout)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
