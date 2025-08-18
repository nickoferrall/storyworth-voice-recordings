'use client'

import React, { useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import dayjs from 'dayjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../src/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../src/components/ui/chart'

interface RegistrationTrend {
  date: string
  count: number
  cumulativeCount: number
}

interface Competition {
  id: string
  name: string
  registrationTrend?: RegistrationTrend[]
}

interface RegistrationTrendsChartProps {
  competitions: Competition[]
  loading?: boolean
}

const generateColors = (count: number) => {
  const colors = [
    'hsl(var(--chart-1))', // orange-ish
    'hsl(var(--chart-2))', // teal-ish
    '#60A5FA', // bright blue (replacing chart-3 which is gray)
    'hsl(var(--chart-4))', // yellow-ish
    'hsl(var(--chart-5))', // orange-ish
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EF4444', // red
    '#10B981', // emerald
    '#3B82F6', // blue
    '#F97316', // orange
    '#EC4899', // pink
  ]

  return Array.from({ length: count }, (_, i) => colors[i % colors.length])
}

export const RegistrationTrendsChart: React.FC<RegistrationTrendsChartProps> = ({
  competitions,
  loading = false,
}) => {
  const [viewMode, setViewMode] = useState<'cumulative' | 'daily'>('cumulative')

  // Extract city name from competition name (e.g., "Playoffs 500 Cambridge" -> "Cambridge")
  const extractCityName = (compName: string): string => {
    // Handle special cases first
    if (compName.includes("Shepherd's Bush")) {
      return "Shepherd's Bush"
    }

    const words = compName.split(' ')
    // Take the last word as the city name
    return words[words.length - 1] || compName
  }

  const { chartData, chartConfig } = useMemo(() => {
    if (loading || !competitions.length) {
      return { chartData: [], chartConfig: {} }
    }

    // Get all unique dates from all competitions
    const allDates = new Set<string>()
    competitions.forEach((comp) => {
      comp.registrationTrend?.forEach((trend) => {
        allDates.add(trend.date)
      })
    })

    const sortedDates = Array.from(allDates).sort()

    // Create chart data with all dates and counts for each competition
    // Track last known cumulative counts for each competition
    const lastCumulativeCounts: Record<string, number> = {}

    const chartData = sortedDates.map((date) => {
      // Convert timestamp to proper date format
      const timestamp = Number(date)
      const parsedDate = dayjs(timestamp)

      const dataPoint: any = {
        date: parsedDate.format('YYYY-MM-DD'),
        formattedDate: parsedDate.format('D MMM'),
      }

      competitions.forEach((comp) => {
        const trendData = comp.registrationTrend?.find((t) => t.date === date)

        if (viewMode === 'cumulative') {
          if (trendData?.cumulativeCount !== undefined) {
            // Update the last known cumulative count
            lastCumulativeCounts[comp.id] = trendData.cumulativeCount
            dataPoint[comp.id] = trendData.cumulativeCount
          } else {
            // Use the last known cumulative count (carry forward)
            dataPoint[comp.id] = lastCumulativeCounts[comp.id] || 0
          }
        } else {
          // For daily view, missing days should be 0
          dataPoint[comp.id] = trendData?.count || 0
        }
      })

      return dataPoint
    })

    // Generate colors for competitions
    const colors = generateColors(competitions.length)

    // Create chart config with simplified city names
    const chartConfig: ChartConfig = {}
    competitions.forEach((comp, index) => {
      const cityName = extractCityName(comp.name)
      chartConfig[comp.id] = {
        label: cityName,
        color: colors[index],
      }
    })

    return { chartData, chartConfig }
  }, [competitions, loading, viewMode])

  const formatDate = (dateStr: string) => {
    // Handle different date formats from database
    let parsedDate = dayjs(dateStr)

    // If it's a timestamp, convert it
    if (!parsedDate.isValid() && !isNaN(Number(dateStr))) {
      const timestamp = Number(dateStr)

      // Handle timestamp conversion
      if (timestamp > 1700000000000) {
        // Millisecond timestamp
        parsedDate = dayjs(timestamp)
      } else if (timestamp > 1700000000) {
        // Second timestamp
        parsedDate = dayjs(timestamp * 1000)
      } else {
        parsedDate = dayjs(timestamp)
      }
    }

    // If still invalid, try parsing as ISO string
    if (!parsedDate.isValid()) {
      parsedDate = dayjs(new Date(dateStr))
    }

    // Use dayjs for consistent date formatting
    return parsedDate.isValid() ? parsedDate.format('D MMM') : dateStr
  }

  const getTotalParticipants = () => {
    return competitions.reduce((total, comp) => {
      const lastTrend = comp.registrationTrend?.[comp.registrationTrend.length - 1]
      return total + (lastTrend?.cumulativeCount || 0)
    }, 0)
  }

  const getLeadingComp = () => {
    if (viewMode === 'daily') {
      // For daily view, find the competition with the most signups on the most recent date
      let allDates: string[] = []
      competitions.forEach((comp) => {
        if (comp.registrationTrend) {
          comp.registrationTrend.forEach((trend) => {
            allDates.push(trend.date)
          })
        }
      })

      // Get the most recent date from all competitions
      const sortedDates = [...new Set(allDates)].sort()
      const mostRecentDate = sortedDates[sortedDates.length - 1]

      if (!mostRecentDate) {
        return getCumulativeLeader()
      }

      let leading = competitions[0]
      let maxRecentSignups = 0
      let hasAnyRecentSignups = false

      competitions.forEach((comp) => {
        if (comp.registrationTrend) {
          const recentData = comp.registrationTrend.find((t) => t.date === mostRecentDate)
          const recentSignups = recentData?.count || 0

          if (recentSignups > 0) {
            hasAnyRecentSignups = true
          }

          if (recentSignups > maxRecentSignups) {
            maxRecentSignups = recentSignups
            leading = comp
          }
        }
      })

      // If no competitions have signups on the most recent date, fall back to cumulative leader
      if (!hasAnyRecentSignups) {
        return getCumulativeLeader()
      }

      return { comp: leading, totalParticipants: maxRecentSignups }
    } else {
      // For cumulative view, use the existing logic
      return getCumulativeLeader()
    }
  }

  const getCumulativeLeader = () => {
    let leading = competitions[0]
    let maxParticipants = 0

    competitions.forEach((comp) => {
      if (comp.registrationTrend && comp.registrationTrend.length > 0) {
        const last = comp.registrationTrend[comp.registrationTrend.length - 1]
        const totalParticipants = last.cumulativeCount

        if (totalParticipants > maxParticipants) {
          maxParticipants = totalParticipants
          leading = comp
        }
      }
    })

    return { comp: leading, totalParticipants: maxParticipants }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Registration Trends</CardTitle>
          <CardDescription className="text-sm">
            New participants per day since 15th July 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    )
  }

  const { comp: leadingComp, totalParticipants } = getLeadingComp()

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg md:text-xl">Registration Trends</CardTitle>
            <CardDescription className="text-sm">
              {viewMode === 'cumulative' ? 'Cumulative' : 'Daily'} participants since 15th
              July 2025
            </CardDescription>
          </div>
          <div className="flex bg-muted rounded-lg p-1 w-fit">
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm rounded-md transition-colors ${
                viewMode === 'cumulative'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cumulative
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-2 py-1 text-xs md:px-3 md:py-1 md:text-sm rounded-md transition-colors ${
                viewMode === 'daily'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Daily
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null

                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {formatDate(label)}
                        </span>
                      </div>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm">
                            {chartConfig[String(entry.dataKey)]?.label ||
                              extractCityName(
                                competitions.find((c) => c.id === entry.dataKey)?.name ||
                                  '',
                              )}
                            :
                          </span>
                          <span className="font-mono text-sm font-bold">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }}
            />

            {competitions.map((comp) => (
              <Line
                key={comp.id}
                dataKey={comp.id}
                type="monotone"
                stroke={`var(--color-${comp.id})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col gap-3 text-sm">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
            {competitions.map((comp, index) => (
              <div key={comp.id} className="flex items-center gap-1">
                <div
                  className="w-2 h-0.5 md:w-3"
                  style={{ backgroundColor: generateColors(competitions.length)[index] }}
                />
                <span className="text-xs md:text-sm text-muted-foreground">
                  {chartConfig[comp.id]?.label || extractCityName(comp.name)}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid gap-2">
            {/* Removed total count sentences - data needs further debugging */}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
