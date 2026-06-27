import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Exercise, { MUSCLE_GROUPS } from "@/models/Exercise"
import { getSession } from "@/lib/auth/auth"

function getMuscleGroup(value: unknown) {
  return typeof value === "string" &&
    MUSCLE_GROUPS.includes(value as (typeof MUSCLE_GROUPS)[number])
    ? value
    : "Other"
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

    const exercise = await Exercise.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id,
      },
      {
        ...(body.sets && { sets: body.sets }),
        ...(body.name && { name: body.name }),
        ...("muscleGroup" in body && {
          muscleGroup: getMuscleGroup(body.muscleGroup),
        }),
      },
      { new: true }
    )

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(exercise)
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
        const exercise = await Exercise.findOneAndDelete({
            _id: id,
            userId: session.user.id,
        })

        if (!exercise) {
            return NextResponse.json(
                { error: "Exercise not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        )
    }
    
}
