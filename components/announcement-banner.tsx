"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  imageUrl: string | null
  linkUrl: string | null
  linkText: string | null
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'EVENT' | 'PROMOTION'
  priority: number
  startDate: string
  endDate: string | null
}

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  INFO: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  WARNING: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  SUCCESS: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  EVENT: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  PROMOTION: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/active`)
        
        if (!response.ok) {
          console.error('Failed to fetch announcements:', response.status)
          return
        }
        
        const data = await response.json()
        
        if (data.status === 'success' && data.data) {
          setAnnouncements(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (announcements.length <= 1) return

    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 5000)

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [announcements.length])

  const resetAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
      }, 5000)
    }
  }

  const handlePrev = () => {
    resetAutoScroll()
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1))
  }

  const handleNext = () => {
    resetAutoScroll()
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const goToSlide = (index: number) => {
    resetAutoScroll()
    setCurrentIndex(index)
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const swipeThreshold = 50 // minimum distance for swipe
    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go to next
        handleNext()
      } else {
        // Swiped right - go to previous
        handlePrev()
      }
    }
  }

  if (loading) {
    return (
      <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-4">
        <div className="container mx-auto px-3 lg:px-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-primary/20" />
            <div className="h-4 w-48 animate-pulse rounded bg-primary/20" />
          </div>
        </div>
      </section>
    )
  }

  if (announcements.length === 0) return null

  const current = announcements[currentIndex]
  const colors = typeColors[current.type] || typeColors.INFO

  return (
    <section 
      className={`${colors.bg} border-y ${colors.border} py-3 lg:py-4 relative overflow-hidden touch-pan-y`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="container mx-auto px-3 lg:px-4">
        <div className="flex items-center gap-3">
          {/* Left Arrow */}
          {announcements.length > 1 && (
            <button
              onClick={handlePrev}
              className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${colors.text} bg-white/80 hover:bg-white border ${colors.border} shadow-sm hover:shadow transition-all`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Announcement Content */}
          <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
            <Megaphone className={`h-5 w-5 shrink-0 ${colors.text}`} />
            
            <div className="flex items-center gap-3 min-w-0">
              {/* Image thumbnail if available */}
              {current.imageUrl && (
                <img
                  src={current.imageUrl}
                  alt=""
                  className="h-10 w-10 lg:h-12 lg:w-12 rounded-lg object-cover shrink-0 border border-white/50 shadow-sm"
                />
              )}
              
              <div className="min-w-0 flex-1">
                <h4 className={`font-semibold text-sm lg:text-base ${colors.text} truncate`}>
                  {current.title}
                </h4>
                {current.content && (
                  <p className="text-xs lg:text-sm text-muted-foreground truncate max-w-md">
                    {current.content}
                  </p>
                )}
              </div>

              {/* Link button */}
              {current.linkUrl && (
                <a
                  href={current.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 ${colors.text} bg-white/70 hover:bg-white rounded-full text-xs font-medium transition-colors shrink-0`}
                >
                  <ExternalLink className="h-3 w-3" />
                  {current.linkText || 'View'}
                </a>
              )}
            </div>
          </div>

          {/* Right Arrow */}
          {announcements.length > 1 && (
            <button
              onClick={handleNext}
              className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${colors.text} bg-white/80 hover:bg-white border ${colors.border} shadow-sm hover:shadow transition-all`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dots indicator */}
        {announcements.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? `w-4 ${colors.text.replace('text-', 'bg-')}` 
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
