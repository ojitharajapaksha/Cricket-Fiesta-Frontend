"use client"

import { useEffect, useState, useRef } from "react"

interface DashboardStats {
  players: {
    total: number
    attended: number
    attendanceRate: number
  }
  teams: {
    total: number
  }
  matches: {
    total: number
    live: number
    completed: number
    upcoming: number
  }
  food: {
    total: number
    collected: number
    pending: number
    collectionRate: number
  }
  committee: {
    total: number
    active: number
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Animated counter component - counts 1, 2, 3, 4... up to the final value
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)

  // Intersection observer to detect when element is visible (when user scrolls to it)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Stop observing once visible
        }
      },
      { 
        threshold: 0.5, // Element must be 50% visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully in view
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  // Start counting when visible and value is available
  useEffect(() => {
    if (!isVisible || value === 0 || hasStarted.current) return
    
    hasStarted.current = true
    let currentCount = 0
    
    // Calculate interval - aim for ~2.5 seconds total animation
    const totalDuration = 2500
    const interval = Math.max(30, Math.min(200, totalDuration / value))
    
    const timer = setInterval(() => {
      currentCount += 1
      setCount(currentCount)
      
      if (currentCount >= value) {
        clearInterval(timer)
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <div ref={ref} className="mb-1 text-2xl font-bold text-primary lg:mb-2 lg:text-4xl">
      {value > 0 ? `${count}${suffix}` : "—"}
    </div>
  )
}

export function StatsSection() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/dashboard/stats`)
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
        // Set default values on error
        setStats({
          players: { total: 0, attended: 0, attendanceRate: 0 },
          teams: { total: 0 },
          matches: { total: 0, live: 0, completed: 0, upcoming: 0 },
          food: { total: 0, collected: 0, pending: 0, collectionRate: 0 },
          committee: { total: 0, active: 0 },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <section className="border-y border-border bg-accent py-8 lg:py-16">
        <div className="container mx-auto px-3 lg:px-4">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5 lg:gap-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="mb-1 h-8 w-16 mx-auto animate-pulse rounded bg-primary/20 lg:mb-2 lg:h-10 lg:w-20" />
                <div className="h-4 w-24 mx-auto animate-pulse rounded bg-muted-foreground/20 lg:h-5 lg:w-28" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const statsData = [
    {
      value: stats?.food.total || 0,
      label: "Total Participants",
      suffix: "+",
    },
    {
      value: stats?.players.total || 0,
      label: "Total Players",
      suffix: "+",
    },
    {
      value: stats?.teams.total || 0,
      label: "Cricket Teams",
      suffix: "",
    },
    {
      value: stats?.matches.total || 0,
      label: "Total Matches",
      suffix: "",
    },
    {
      value: stats?.committee.total || 0,
      label: "OC Members",
      suffix: "+",
    },
  ]

  return (
    <section className="border-y border-border bg-accent py-8 lg:py-16">
      <div className="container mx-auto px-3 lg:px-4">
        {error && (
          <p className="text-center text-xs text-muted-foreground mb-4 lg:text-sm">
            Live stats temporarily unavailable
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5 lg:gap-8">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <div className="text-xs text-muted-foreground lg:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
