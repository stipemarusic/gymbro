"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const filters = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Glutes",
  "Core",
  "Other",
] as const

type MuscleGroupFilter = (typeof filters)[number]

export type RecordsFilterRecord = {
  name: string
  muscleGroup: string
  maxWeight: number
  bestReps: number
  bestEstimatedOneRepMax: number
  bestVolumeSet: number
  dateLabel: string
}

export default function RecordsFilter({
  records,
}: {
  records: RecordsFilterRecord[]
}) {
  const [selectedFilter, setSelectedFilter] =
    useState<MuscleGroupFilter>("All")

  const filteredRecords = useMemo(() => {
    if (selectedFilter === "All") {
      return records
    }

    return records.filter((record) => {
      return record.muscleGroup === selectedFilter
    })
  }, [records, selectedFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                isSelected
                  ? "bg-secondary text-black shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  : "border border-white/10 text-foreground hover:border-secondary hover:bg-secondary/10 hover:text-secondary"
              }`}
            >
              {filter}
            </button>
          )
        })}
      </div>

      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <p className="font-semibold">
              No records for this muscle group yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecords.map((record) => (
            <Card key={record.name}>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <CardTitle>
                    {record.name}
                  </CardTitle>

                  <span className="w-fit rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                    {record.muscleGroup}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Max Weight
                    </p>
                    <p className="font-semibold">
                      {record.maxWeight.toLocaleString()} kg
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Best Reps
                    </p>
                    <p className="font-semibold">
                      {record.bestReps.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Estimated 1RM
                    </p>
                    <p className="font-semibold">
                      {record.bestEstimatedOneRepMax.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 1,
                        }
                      )} kg
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Best Volume Set
                    </p>
                    <p className="font-semibold">
                      {record.bestVolumeSet.toLocaleString()} kg
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Best Record Date
                  </p>
                  <p className="font-semibold">
                    {record.dateLabel}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
