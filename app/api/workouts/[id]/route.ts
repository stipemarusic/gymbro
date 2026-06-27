import connectDB from "@/lib/db"
import Exercise from "@/models/Exercise"
import Workout from "@/models/Workout"
import { getSession } from "@/lib/auth/auth"
import { NextResponse } from "next/server"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string}> } 
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

        const workout = await Workout.findOneAndDelete({
            _id: id,
            userId: session.user.id,
        })

        if (!workout) {
            return NextResponse.json(
                { error: "Workout not found" },
                { status: 404 }
            )
        }

        await Exercise.deleteMany({
            workoutId: id,
            userId: session.user.id,
        })

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        return NextResponse.json (
            { error: String(error) },
            { status: 500 }
        )
    }
}

export async function PATCH(
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

    const workout = await Workout.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id,
      },
      {
        name: body.name,
        description: body.description,
      },
      { new: true }
    )

    if (!workout) {
      return NextResponse.json(
        { error: "Workout not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(workout)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
