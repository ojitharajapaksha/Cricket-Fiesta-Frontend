"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  targetDate: Date
  eventName?: string
}

export function CountdownTimer({ targetDate, eventName = "Event" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const isEventStarted = targetDate.getTime() <= new Date().getTime()

  if (!isClient) {
    return (
      <div className="flex flex-col items-center gap-3 lg:gap-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground lg:text-sm">
          Loading countdown...
        </p>
      </div>
    )
  }

  if (isEventStarted) {
    return (
      <div className="flex flex-col items-center gap-3 lg:gap-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-green-600 dark:text-green-400">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
          </span>
          <span className="text-sm font-semibold lg:text-base">{eventName} is LIVE!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 lg:gap-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground lg:text-sm">
        Countdown to {eventName}
      </p>
      <div className="flex items-center gap-2 lg:gap-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeSeparator />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeSeparator />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeSeparator />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <Card className="flex flex-col items-center justify-center bg-primary/5 border-primary/20 p-2 lg:p-4 min-w-[50px] lg:min-w-[80px]">
      <span className="text-xl font-bold text-primary lg:text-4xl">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground lg:text-xs">
        {label}
      </span>
    </Card>
  )
}

function TimeSeparator() {
  return (
    <span className="text-lg font-bold text-primary/50 lg:text-2xl">:</span>
  )
}
