"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Megaphone,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface Announcement {
  id: string
  title: string
  content: string
  imageUrl: string | null
  linkUrl: string | null
  linkText: string | null
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'EVENT' | 'PROMOTION'
  isActive: boolean
  priority: number
  startDate: string
  endDate: string | null
  createdAt: string
}

const typeConfig = {
  INFO: { icon: Bell, color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  WARNING: { icon: AlertTriangle, color: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
  SUCCESS: { icon: CheckCircle, color: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  EVENT: { icon: Calendar, color: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
  PROMOTION: { icon: Megaphone, color: 'bg-pink-500', badge: 'bg-pink-100 text-pink-700' }
}

type AnnouncementType = 'INFO' | 'WARNING' | 'SUCCESS' | 'EVENT' | 'PROMOTION'

interface FormData {
  title: string
  content: string
  imageUrl: string
  linkUrl: string
  linkText: string
  type: AnnouncementType
  isActive: boolean
  priority: number
  startDate: string
  endDate: string
}

const emptyForm: FormData = {
  title: '',
  content: '',
  imageUrl: '',
  linkUrl: '',
  linkText: '',
  type: 'INFO',
  isActive: true,
  priority: 0,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: ''
}

export default function AnnouncementsPage() {
  const router = useRouter()
  // Auth check - only Super Admin can manage announcements
  const { loading: authLoading, isSuperAdmin, token } = useAuth('SUPER_ADMIN')
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (isSuperAdmin && token) {
      fetchAnnouncements()
    }
  }, [isSuperAdmin, token])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.status === 'success') {
        setAnnouncements(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
      setError('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/announcements/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          imageUrl: form.imageUrl || null,
          linkUrl: form.linkUrl || null,
          linkText: form.linkText || null,
          endDate: form.endDate || null
        })
      })

      const data = await response.json()
      if (data.status === 'success') {
        setSuccess(editingId ? 'Announcement updated!' : 'Announcement created!')
        setIsDialogOpen(false)
        setEditingId(null)
        setForm(emptyForm)
        fetchAnnouncements()
      } else {
        setError(data.message || 'Failed to save announcement')
      }
    } catch (error) {
      setError('Failed to save announcement')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id)
    setForm({
      title: announcement.title,
      content: announcement.content,
      imageUrl: announcement.imageUrl || '',
      linkUrl: announcement.linkUrl || '',
      linkText: announcement.linkText || '',
      type: announcement.type,
      isActive: announcement.isActive,
      priority: announcement.priority,
      startDate: new Date(announcement.startDate).toISOString().slice(0, 16),
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().slice(0, 16) : ''
    })
    setIsDialogOpen(true)
  }

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        fetchAnnouncements()
      }
    } catch (error) {
      console.error('Failed to toggle announcement:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        setSuccess('Announcement deleted!')
        setDeleteId(null)
        fetchAnnouncements()
      }
    } catch (error) {
      setError('Failed to delete announcement')
    }
  }

  const openNewDialog = () => {
    setEditingId(null)
    setForm(emptyForm)
    setIsDialogOpen(true)
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Announcements</h1>
                <p className="text-sm text-muted-foreground">Create popup announcements for the home page</p>
              </div>
            </div>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50 text-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
            <CardDescription>Manage popup announcements displayed on the home page</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Announcements</h3>
                <p className="text-muted-foreground">Create your first announcement to display on the home page.</p>
                <Button onClick={openNewDialog} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Announcement
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => {
                    const config = typeConfig[announcement.type]
                    const Icon = config.icon
                    return (
                      <TableRow key={announcement.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`${config.color} p-1.5 rounded`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{announcement.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {announcement.content.slice(0, 50)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={config.badge}>{announcement.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={announcement.isActive}
                              onCheckedChange={() => handleToggleActive(announcement.id)}
                            />
                            <span className="text-sm">
                              {announcement.isActive ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <Eye className="h-3 w-3" /> Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <EyeOff className="h-3 w-3" /> Inactive
                                </span>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{announcement.priority}</TableCell>
                        <TableCell>
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(announcement)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setDeleteId(announcement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Announcement title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Announcement content..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="EVENT">Event</SelectItem>
                    <SelectItem value="PROMOTION">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkUrl">Link URL (optional)</Label>
                <Input
                  id="linkUrl"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={form.linkText}
                  onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  placeholder="Learn More"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (optional)</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
              />
              <Label htmlFor="isActive">Active (visible on home page)</Label>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this announcement? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
