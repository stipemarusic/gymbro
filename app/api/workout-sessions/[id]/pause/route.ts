import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import WorkoutSession from "@/models/WorkoutSession"
import { getSession } from "@/lib/auth/auth"

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
    const body = await request.json()

    await connectDB()

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

    if (body.action === "pause") {
      if (!workoutSession.isPaused) {
        workoutSession.isPaused = true
        workoutSession.pausedAt = new Date()
        workoutSession.duration = body.duration || workoutSession.duration
      }
    }

    if (body.action === "resume") {
      if (workoutSession.isPaused && workoutSession.pausedAt) {
        const pausedSeconds = Math.floor(
          (Date.now() -
            new Date(workoutSession.pausedAt).getTime()) /
            1000
        )

        workoutSession.totalPausedSeconds += pausedSeconds
        workoutSession.isPaused = false
        workoutSession.pausedAt = null
      }
    }

    await workoutSession.save()

    return NextResponse.json(workoutSession)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
