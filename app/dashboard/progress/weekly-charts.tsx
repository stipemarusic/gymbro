"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type WeeklyStats = {
  key: string
  label: string
  shortLabel: string
  workouts: number
  sets: number
  volume: number
}

type MuscleBalance = {
  muscleGroup: string
  sets: number
}

type DailyVolume = {
  key: string
  label: string
  volume: number
}

const chartConfig = {
  workouts: {
    label: "Workouts",
    color: "var(--chart-2)",
  },
  volume: {
    label: "Volume",
    color: "var(--chart-1)",
  },
  sets: {
    label: "Sets",
    color: "var(--chart-3)",
  },
  muscleSets: {
    label: "Sets",
    color: "var(--chart-2)",
  },
  dailyVolume: {
    label: "Daily Volume",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

function WorkoutsBarChart({
  data,
}: {
  data: WeeklyStats[]
}) {
  const maxValue = Math.max(...data.map((week) => week.workouts), 0)
  const tickCount = Math.max(maxValue + 1, 2)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>
          Workouts Per Week
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        <ChartContainer
          config={chartConfig}
          className="h-56 w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            barCategoryGap="32%"
            margin={{
              top: 8,
              right: 8,
              left: 0,
              bottom: 4,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              minTickGap={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={48}
              allowDecimals={false}
              tickCount={tickCount}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelKey="label"
                />
              }
            />
            <Bar
              dataKey="workouts"
              fill="var(--color-workouts)"
              maxBarSize={42}
              radius={6}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function VolumeLineChart({
  data,
}: {
  data: WeeklyStats[]
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>
          Weekly Volume Trend
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        <ChartContainer
          config={chartConfig}
          className="h-56 w-full"
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              top: 8,
              right: 8,
              left: 0,
              bottom: 4,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              minTickGap={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={56}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelKey="label"
                />
              }
            />
            <Line
              dataKey="volume"
              type="monotone"
              stroke="var(--color-volume)"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "var(--color-volume)",
              }}
              activeDot={{
                r: 5,
              }}
            />
          </LineChart>
        </ChartContainer>

        <p className="text-sm text-muted-foreground mt-2">
          Values shown in kg.
        </p>
      </CardContent>
    </Card>
  )
}

function MuscleBalanceRadarChart({
  data,
}: {
  data: MuscleBalance[]
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>
          Muscle Balance
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        <ChartContainer
          config={chartConfig}
          className="h-72 w-full"
        >
          <RadarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 8,
              right: 24,
              bottom: 8,
              left: 24,
            }}
          >
            <PolarGrid />
            <PolarAngleAxis
              dataKey="muscleGroup"
              tickLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  nameKey="muscleSets"
                />
              }
            />
            <Radar
              dataKey="sets"
              name="Sets"
              fill="var(--color-muscleSets)"
              fillOpacity={0.25}
              stroke="var(--color-muscleSets)"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>

        <p className="text-sm text-muted-foreground mt-2">
          Total sets per muscle group over the last 30 days.
        </p>
      </CardContent>
    </Card>
  )
}

function DailyVolumeAreaChart({
  data,
}: {
  data: DailyVolume[]
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>
          Daily Volume
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4">
        <ChartContainer
          config={chartConfig}
          className="h-56 w-full"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              top: 8,
              right: 8,
              left: 0,
              bottom: 4,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={1}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={56}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelKey="label"
                />
              }
            />
            <Area
              dataKey="volume"
              name="Daily Volume"
              type="monotone"
              fill="var(--color-dailyVolume)"
              fillOpacity={0.2}
              stroke="var(--color-dailyVolume)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>

        <p className="text-sm text-muted-foreground mt-2">
          Volume by day over the last 14 days, shown in kg.
        </p>
      </CardContent>
    </Card>
  )
}

export default function WeeklyCharts({
  weeklyData,
  muscleBalanceData,
  dailyVolumeData,
}: {
  weeklyData: WeeklyStats[]
  muscleBalanceData: MuscleBalance[]
  dailyVolumeData: DailyVolume[]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <MuscleBalanceRadarChart
        data={muscleBalanceData}
      />

      <VolumeLineChart
        data={weeklyData}
      />

      <WorkoutsBarChart
        data={weeklyData}
      />

      <DailyVolumeAreaChart
        data={dailyVolumeData}
      />
    </div>
  )
}
