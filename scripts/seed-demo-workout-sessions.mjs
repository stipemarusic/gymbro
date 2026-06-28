import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { MongoClient, ObjectId } from "mongodb"

const demoEmail = "demo@gymbro.com"
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, "..")

function loadEnvFile(fileName) {
  const envPath = path.join(projectRoot, fileName)

  if (!fs.existsSync(envPath)) {
    return
  }

  const envContent = fs.readFileSync(envPath, "utf8")

  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      return
    }

    const equalsIndex = trimmed.indexOf("=")

    if (equalsIndex === -1) {
      return
    }

    const key = trimmed.slice(0, equalsIndex).trim()
    const rawValue = trimmed.slice(equalsIndex + 1).trim()
    const value = rawValue.replace(/^["']|["']$/g, "")

    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}

function daysAgo(days, hour = 18, minute = 0) {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  date.setDate(date.getDate() - days)

  return date
}

function set(reps, weight) {
  return {
    reps,
    weight,
    completed: true,
  }
}

function exercise(name, muscleGroup, sets) {
  if (!muscleGroups.includes(muscleGroup)) {
    throw new Error(`Invalid muscle group: ${muscleGroup}`)
  }

  return {
    name,
    muscleGroup,
    completed: true,
    sets,
  }
}

function session(workoutName, startedAt, duration, exercises) {
  return {
    workoutName,
    startedAt,
    endedAt: new Date(startedAt.getTime() + duration * 1000),
    duration,
    isPaused: false,
    pausedAt: null,
    totalPausedSeconds: 0,
    status: "completed",
    exercises,
  }
}

function templateExercise(name, muscleGroup, sets) {
  if (!muscleGroups.includes(muscleGroup)) {
    throw new Error(`Invalid muscle group: ${muscleGroup}`)
  }

  return {
    name,
    muscleGroup,
    sets,
  }
}

function createDemoWorkoutTemplates() {
  return [
    {
      name: "Push Day",
      description: "Chest, shoulders, and triceps strength work.",
      exercises: [
        templateExercise("Bench Press", "Chest", [
          { reps: 8, weight: 62.5 },
          { reps: 8, weight: 65 },
          { reps: 6, weight: 70 },
        ]),
        templateExercise("Incline Dumbbell Press", "Chest", [
          { reps: 10, weight: 25 },
          { reps: 9, weight: 25 },
          { reps: 8, weight: 27.5 },
        ]),
        templateExercise("Shoulder Press", "Shoulders", [
          { reps: 9, weight: 37.5 },
          { reps: 8, weight: 40 },
          { reps: 7, weight: 40 },
        ]),
        templateExercise("Triceps Pushdown", "Arms", [
          { reps: 12, weight: 27.5 },
          { reps: 12, weight: 30 },
          { reps: 10, weight: 30 },
        ]),
      ],
    },
    {
      name: "Pull Day",
      description: "Back and arm training with heavy pulls.",
      exercises: [
        templateExercise("Deadlift", "Back", [
          { reps: 5, weight: 100 },
          { reps: 4, weight: 110 },
          { reps: 3, weight: 115 },
        ]),
        templateExercise("Lat Pulldown", "Back", [
          { reps: 10, weight: 57.5 },
          { reps: 10, weight: 60 },
          { reps: 8, weight: 62.5 },
        ]),
        templateExercise("Seated Row", "Back", [
          { reps: 10, weight: 52.5 },
          { reps: 9, weight: 55 },
          { reps: 8, weight: 57.5 },
        ]),
        templateExercise("Hammer Curl", "Arms", [
          { reps: 10, weight: 17.5 },
          { reps: 10, weight: 20 },
          { reps: 8, weight: 22.5 },
        ]),
      ],
    },
    {
      name: "Leg Day",
      description: "Squats, hinges, single-leg work, and calves.",
      exercises: [
        templateExercise("Back Squat", "Legs", [
          { reps: 8, weight: 80 },
          { reps: 6, weight: 85 },
          { reps: 5, weight: 90 },
        ]),
        templateExercise("Romanian Deadlift", "Glutes", [
          { reps: 9, weight: 72.5 },
          { reps: 8, weight: 77.5 },
          { reps: 8, weight: 80 },
        ]),
        templateExercise("Bulgarian Split Squat", "Legs", [
          { reps: 10, weight: 20 },
          { reps: 9, weight: 22.5 },
          { reps: 8, weight: 25 },
        ]),
        templateExercise("Standing Calf Raise", "Legs", [
          { reps: 15, weight: 50 },
          { reps: 15, weight: 55 },
          { reps: 12, weight: 60 },
        ]),
      ],
    },
    {
      name: "Core + Glutes",
      description: "Glute strength and core control.",
      exercises: [
        templateExercise("Hip Thrust", "Glutes", [
          { reps: 10, weight: 90 },
          { reps: 8, weight: 95 },
          { reps: 6, weight: 100 },
        ]),
        templateExercise("Cable Crunch", "Core", [
          { reps: 15, weight: 40 },
          { reps: 14, weight: 42.5 },
          { reps: 12, weight: 45 },
        ]),
        templateExercise("Ab Wheel Rollout", "Core", [
          { reps: 10, weight: 0 },
          { reps: 9, weight: 0 },
          { reps: 8, weight: 0 },
        ]),
        templateExercise("Walking Lunge", "Legs", [
          { reps: 12, weight: 20 },
          { reps: 12, weight: 22.5 },
          { reps: 10, weight: 22.5 },
        ]),
      ],
    },
  ]
}

function createDemoSessions() {
  return [
    session("Push Day", daysAgo(13, 18, 15), 3720, [
      exercise("Bench Press", "Chest", [set(8, 60), set(8, 62.5), set(6, 65)]),
      exercise("Incline Dumbbell Press", "Chest", [set(10, 22.5), set(9, 22.5), set(8, 25)]),
      exercise("Shoulder Press", "Shoulders", [set(10, 35), set(8, 37.5), set(8, 37.5)]),
      exercise("Triceps Pushdown", "Arms", [set(12, 25), set(12, 27.5), set(10, 30)]),
    ]),
    session("Pull Day", daysAgo(12, 18, 30), 3480, [
      exercise("Deadlift", "Back", [set(5, 95), set(5, 100), set(4, 105)]),
      exercise("Lat Pulldown", "Back", [set(10, 55), set(10, 57.5), set(8, 60)]),
      exercise("Seated Row", "Back", [set(10, 50), set(9, 52.5), set(8, 55)]),
      exercise("Barbell Curl", "Arms", [set(10, 25), set(9, 27.5), set(8, 30)]),
    ]),
    session("Leg Day", daysAgo(10, 17, 45), 3900, [
      exercise("Back Squat", "Legs", [set(8, 75), set(7, 80), set(6, 82.5)]),
      exercise("Romanian Deadlift", "Glutes", [set(10, 65), set(9, 70), set(8, 72.5)]),
      exercise("Leg Press", "Legs", [set(12, 130), set(10, 140), set(10, 145)]),
      exercise("Standing Calf Raise", "Legs", [set(15, 45), set(15, 50), set(12, 55)]),
    ]),
    session("Upper Body", daysAgo(8, 19, 0), 3300, [
      exercise("Incline Bench Press", "Chest", [set(8, 55), set(8, 57.5), set(7, 60)]),
      exercise("Chest Supported Row", "Back", [set(10, 45), set(10, 47.5), set(9, 50)]),
      exercise("Lateral Raise", "Shoulders", [set(15, 10), set(14, 12.5), set(12, 12.5)]),
      exercise("Cable Curl", "Arms", [set(12, 22.5), set(11, 25), set(10, 25)]),
    ]),
    session("Core + Glutes", daysAgo(7, 10, 30), 2700, [
      exercise("Hip Thrust", "Glutes", [set(10, 80), set(9, 85), set(8, 90)]),
      exercise("Cable Crunch", "Core", [set(15, 35), set(14, 37.5), set(12, 40)]),
      exercise("Hanging Knee Raise", "Core", [set(12, 0), set(12, 0), set(10, 0)]),
      exercise("Walking Lunge", "Legs", [set(12, 20), set(12, 22.5), set(10, 22.5)]),
    ]),
    session("Push Day", daysAgo(6, 18, 10), 3840, [
      exercise("Bench Press", "Chest", [set(8, 62.5), set(7, 65), set(5, 70)]),
      exercise("Incline Dumbbell Press", "Chest", [set(10, 25), set(9, 25), set(8, 27.5)]),
      exercise("Shoulder Press", "Shoulders", [set(9, 37.5), set(8, 40), set(7, 40)]),
      exercise("Overhead Triceps Extension", "Arms", [set(12, 20), set(11, 22.5), set(10, 25)]),
    ]),
    session("Pull Day", daysAgo(5, 18, 20), 3600, [
      exercise("Deadlift", "Back", [set(5, 100), set(4, 110), set(3, 115)]),
      exercise("Pull Up", "Back", [set(8, 0), set(7, 0), set(6, 0)]),
      exercise("Seated Row", "Back", [set(10, 52.5), set(9, 55), set(8, 57.5)]),
      exercise("Hammer Curl", "Arms", [set(10, 17.5), set(10, 20), set(8, 22.5)]),
    ]),
    session("Leg Day", daysAgo(3, 17, 40), 4020, [
      exercise("Back Squat", "Legs", [set(8, 80), set(6, 85), set(5, 90)]),
      exercise("Romanian Deadlift", "Glutes", [set(9, 72.5), set(8, 77.5), set(8, 80)]),
      exercise("Bulgarian Split Squat", "Legs", [set(10, 20), set(9, 22.5), set(8, 25)]),
      exercise("Plank", "Core", [set(60, 0), set(60, 0), set(45, 0)]),
    ]),
    session("Upper Body", daysAgo(2, 19, 15), 3360, [
      exercise("Incline Bench Press", "Chest", [set(8, 57.5), set(7, 62.5), set(6, 65)]),
      exercise("Chest Supported Row", "Back", [set(10, 50), set(9, 52.5), set(8, 55)]),
      exercise("Arnold Press", "Shoulders", [set(10, 20), set(9, 22.5), set(8, 22.5)]),
      exercise("Dips", "Arms", [set(10, 0), set(9, 0), set(8, 0)]),
    ]),
    session("Core + Glutes", daysAgo(1, 11, 0), 2820, [
      exercise("Hip Thrust", "Glutes", [set(10, 90), set(8, 95), set(6, 100)]),
      exercise("Cable Crunch", "Core", [set(15, 40), set(14, 42.5), set(12, 45)]),
      exercise("Ab Wheel Rollout", "Core", [set(10, 0), set(9, 0), set(8, 0)]),
      exercise("Goblet Squat", "Legs", [set(12, 30), set(11, 32.5), set(10, 35)]),
    ]),
  ]
}

loadEnvFile(".env.local")
loadEnvFile(".env")

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI. Add it to .env.local before running this script.")
  process.exit(1)
}

const client = new MongoClient(process.env.MONGODB_URI)

try {
  await client.connect()

  const db = client.db()
  const demoUser = await db.collection("user").findOne({
    email: demoEmail,
  })

  if (!demoUser) {
    console.log(`Demo user ${demoEmail} was not found. Create that account first, then rerun npm run seed:demo.`)
    process.exit(0)
  }

  const userId = String(demoUser.id || demoUser._id)
  const workouts = db.collection("workouts")
  const exercises = db.collection("exercises")
  const workoutSessions = db.collection("workoutsessions")
  const demoWorkoutTemplates = createDemoWorkoutTemplates()
  const demoSessions = createDemoSessions()
  let insertedWorkoutCount = 0
  let skippedWorkoutCount = 0
  let insertedExerciseCount = 0
  let insertedCount = 0
  let skippedCount = 0

  for (const demoWorkout of demoWorkoutTemplates) {
    const existingWorkout = await workouts.findOne({
      userId,
      name: demoWorkout.name,
    })

    if (existingWorkout) {
      skippedWorkoutCount += 1
      continue
    }

    const workoutId = new ObjectId()
    const now = new Date()

    await workouts.insertOne({
      _id: workoutId,
      userId,
      name: demoWorkout.name,
      description: demoWorkout.description,
      createdAt: now,
      updatedAt: now,
    })

    insertedWorkoutCount += 1

    const exerciseDocuments = demoWorkout.exercises.map((demoExercise) => ({
      _id: new ObjectId(),
      userId,
      workoutId: String(workoutId),
      name: demoExercise.name,
      muscleGroup: demoExercise.muscleGroup,
      sets: demoExercise.sets,
      createdAt: now,
      updatedAt: now,
    }))

    if (exerciseDocuments.length > 0) {
      await exercises.insertMany(exerciseDocuments)
      insertedExerciseCount += exerciseDocuments.length
    }
  }

  for (const demoSession of demoSessions) {
    const existingSession = await workoutSessions.findOne({
      userId,
      status: "completed",
      workoutName: demoSession.workoutName,
      startedAt: demoSession.startedAt,
    })

    if (existingSession) {
      skippedCount += 1
      continue
    }

    await workoutSessions.insertOne({
      _id: new ObjectId(),
      userId,
      workoutId: new ObjectId(),
      ...demoSession,
      createdAt: demoSession.startedAt,
      updatedAt: demoSession.endedAt,
    })

    insertedCount += 1
  }

  console.log(`Demo seed complete for ${demoEmail}.`)
  console.log(`Inserted ${insertedWorkoutCount} workout templates.`)
  console.log(`Inserted ${insertedExerciseCount} workout template exercises.`)
  console.log(`Skipped ${skippedWorkoutCount} existing workout templates.`)
  console.log(`Inserted ${insertedCount} completed workout sessions.`)
  console.log(`Skipped ${skippedCount} existing completed workout sessions.`)
  console.log("The script does not delete or update existing sessions.")
} finally {
  await client.close()
}
