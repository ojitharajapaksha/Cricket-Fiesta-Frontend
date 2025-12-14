"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Loader2, X, Upload } from "lucide-react"
import { toast } from "sonner"

interface ProfileImageUploadProps {
  currentImage?: string | null
  name: string
  email: string
  userType: 'player' | 'committee'
  onImageUpdated: (imageUrl: string) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function ProfileImageUpload({ currentImage, name, email, userType, onImageUpdated }: ProfileImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be less than 5MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !previewUrl) {
      toast.error('Please select an image first')
      return
    }

    setUploading(true)

    try {
      const token = localStorage.getItem('token')
      
      // For simplicity, we'll use base64 encoding for the image
      // In production, you'd want to use a proper file upload service like Cloudinary, S3, etc.
      // But for now, we'll store the base64 string directly
      
      // Compress and resize image if needed
      const compressedImage = await compressImage(previewUrl, 400, 400, 0.8)
      
      const endpoint = userType === 'player' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/players/profile-image`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/committee/profile-image/by-email`
      
      const bodyKey = userType === 'player' ? 'profileImage' : 'imageUrl'
      
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          [bodyKey]: compressedImage,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload image')
      }

      toast.success('Profile picture updated!')
      onImageUpdated(compressedImage)
      setIsOpen(false)
      setPreviewUrl(null)
      setSelectedFile(null)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const compressImage = (base64: string, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = base64
    })
  }

  const handleCancel = () => {
    setIsOpen(false)
    setPreviewUrl(null)
    setSelectedFile(null)
  }

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
        <Avatar className="h-20 w-20 border-2 border-primary/20">
          <AvatarImage src={currentImage || undefined} alt={name} />
          <AvatarFallback className="text-lg bg-primary/10 text-primary">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture. It will be displayed on the public pages.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {/* Preview */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-2 border-primary/20">
                <AvatarImage src={previewUrl || currentImage || undefined} alt={name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              {previewUrl && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => {
                    setPreviewUrl(null)
                    setSelectedFile(null)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Choose Image
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Supports JPEG, PNG, WebP. Max 5MB.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancel} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!previewUrl || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
