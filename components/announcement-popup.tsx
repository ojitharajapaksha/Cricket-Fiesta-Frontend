"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

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
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

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

    // Fetch immediately
    fetchAnnouncements()
  }, [])

  const handleDismiss = () => {
    if (announcements.length > 0) {
      const currentId = announcements[currentIndex].id
      const newDismissed = new Set(dismissed)
      newDismissed.add(currentId)
      setDismissed(newDismissed)
      
      const dismissedIds = JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]')
      dismissedIds.push(currentId)
      sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedIds))
      
      if (currentIndex < announcements.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setIsOpen(false)
      }
    }
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
        
        {/* Close X button in top right */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md border border-gray-200 transition-colors"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Image */}
        {current.imageUrl && (
          <div className="relative">
            <img
              src={current.imageUrl}
              alt={current.title}
              className="w-auto max-w-[90vw] max-h-[75vh] object-contain"
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

        {/* Close button at bottom */}
        <div className="flex justify-center py-3 bg-white border-t border-gray-200">
          <Button
            onClick={handleDismiss}
            className="px-10 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
