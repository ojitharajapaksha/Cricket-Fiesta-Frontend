"use client"

import { useState, useEffect } from "react"
import { X, Bell, AlertTriangle, CheckCircle, Calendar, Megaphone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

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

const typeConfig = {
  INFO: {
    icon: Bell,
    color: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200'
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200'
  },
  SUCCESS: {
    icon: CheckCircle,
    color: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
    border: 'border-green-200'
  },
  EVENT: {
    icon: Calendar,
    color: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-700',
    border: 'border-purple-200'
  },
  PROMOTION: {
    icon: Megaphone,
    color: 'bg-pink-500',
    badge: 'bg-pink-100 text-pink-700',
    border: 'border-pink-200'
  }
}

export function AnnouncementPopup() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/active`)
        const data = await response.json()
        if (data.status === 'success' && data.data.length > 0) {
          // Check which announcements have been dismissed in this session
          const dismissedIds = JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]')
          const undismissed = data.data.filter((a: Announcement) => !dismissedIds.includes(a.id))
          
          if (undismissed.length > 0) {
            setAnnouncements(undismissed)
            setIsOpen(true)
          }
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
      }
    }

    // Fetch after a short delay to not block initial page load
    const timer = setTimeout(fetchAnnouncements, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    if (announcements.length > 0) {
      const currentId = announcements[currentIndex].id
      const newDismissed = new Set(dismissed)
      newDismissed.add(currentId)
      setDismissed(newDismissed)
      
      // Store in session storage
      const dismissedIds = JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]')
      dismissedIds.push(currentId)
      sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedIds))
      
      // Move to next announcement or close
      if (currentIndex < announcements.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setIsOpen(false)
      }
    }
  }

  const handleNext = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (announcements.length === 0) return null

  const current = announcements[currentIndex]
  const config = typeConfig[current.type]
  const Icon = config.icon

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className={`${config.color} p-4 text-white`}>
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <Badge className={`${config.badge} mb-1`}>
                    {current.type}
                  </Badge>
                  <DialogTitle className="text-white text-lg">{current.title}</DialogTitle>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 -mr-2 -mt-2"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-4">
          {current.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={current.imageUrl}
                alt={current.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">{current.content}</p>
          </div>

          {current.linkUrl && (
            <a
              href={current.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              {current.linkText || 'Learn More'}
            </a>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t ${config.border} p-4 bg-muted/30`}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {announcements.length > 1 && (
                <span>{currentIndex + 1} of {announcements.length}</span>
              )}
            </div>
            <div className="flex gap-2">
              {announcements.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentIndex === announcements.length - 1}
                  >
                    Next
                  </Button>
                </>
              )}
              <Button size="sm" onClick={handleDismiss}>
                {currentIndex === announcements.length - 1 ? 'Close' : 'Dismiss'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
