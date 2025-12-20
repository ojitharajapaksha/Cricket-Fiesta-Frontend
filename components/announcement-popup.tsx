"use client"

import React, { useState, useEffect } from "react"
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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


export function AnnouncementPopup() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  // Auto slider interval ref
  const autoSlideRef = React.useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Clear previous dismissals on each page load so popup shows on refresh
        sessionStorage.removeItem('dismissedAnnouncements')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/active`)
        if (!response.ok) {
          console.error('Failed to fetch announcements:', response.status)
          return
        }
        const data = await response.json()
        console.log('Announcements response:', data)
        if (data.status === 'success' && data.data && data.data.length > 0) {
          setAnnouncements(data.data)
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
      }
    }
    fetchAnnouncements()
  }, [])

  // Auto slider effect
  useEffect(() => {
    if (announcements.length > 1 && isOpen) {
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
      }, 5000) // 5 seconds
      return () => {
        if (autoSlideRef.current) clearInterval(autoSlideRef.current)
      }
    } else {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current)
    }
    return undefined
  }, [announcements.length, isOpen])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  if (announcements.length === 0) return null

  const current = announcements[currentIndex]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-fit max-w-[95vw] p-0 overflow-hidden border-4 border-gray-200 bg-white rounded-xl shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">{current.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {current.content || 'Announcement details'}
        </DialogDescription>
        
        {/* Close X button in top right */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md border border-gray-200 transition-colors"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Left Arrow - only show if multiple announcements */}
        {announcements.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white shadow-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Right Arrow - only show if multiple announcements */}
        {announcements.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white shadow-lg transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Image */}
        {current.imageUrl && (
          <div className="relative">
            <img
              src={current.imageUrl}
              alt={current.title}
              className="w-auto max-w-[90vw] max-h-[70vh] object-contain"
            />
          </div>
        )}

        {/* Non-image announcement */}
        {!current.imageUrl && (
          <div className="p-6 min-w-[300px]">
            <h2 className="text-xl font-bold mb-2">{current.title}</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{current.content}</p>
          </div>
        )}

        {/* Link button - styled beautifully */}
        {current.linkUrl && (
          <div className="flex justify-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50">
            <a
              href={current.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <ExternalLink className="h-4 w-4" />
              {current.linkText || 'Learn More'}
            </a>
          </div>
        )}

        {/* Dots indicator and Close button */}
        <div className="flex flex-col items-center gap-2 py-3 bg-white border-t border-gray-200">
          {/* Dots indicator - only show if multiple announcements */}
          {announcements.length > 1 && (
            <div className="flex justify-center gap-2">
              {announcements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'w-6 bg-primary' 
                      : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Counter text */}
          {announcements.length > 1 && (
            <p className="text-xs text-gray-500">
              {currentIndex + 1} of {announcements.length}
            </p>
          )}

          <Button
            onClick={handleClose}
            className="px-10 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
