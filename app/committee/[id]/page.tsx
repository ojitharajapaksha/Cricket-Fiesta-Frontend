"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface CommitteeMember {
  id: string
  fullName: string
  role?: string
  roleOrder: number
  imageUrl?: string
  department: string
  whatsappNumber: string
  emergencyContact?: string
  email?: string
  assignedTeam?: string
  experienceLevel: string
  isApproved: boolean
}

export default function EditCommitteePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { loading: authLoading, isAuthenticated, isSuperAdmin, token } = useAuth('ADMIN_OR_SUPER')
  const { id } = use(params)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [member, setMember] = useState<CommitteeMember | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    roleOrder: "999",
    department: "",
    whatsappNumber: "",
    emergencyContact: "",
    email: "",
    assignedTeam: "",
    experienceLevel: "NONE",
    isApproved: false,
    imageUrl: "",
  })

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchMember()
    }
  }, [isAuthenticated, token])

  const fetchMember = async () => {
    try {
      const response = await fetch(`${API_URL}/api/committee/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        setMember(data.data)
        setFormData({
          fullName: data.data.fullName || "",
          role: data.data.role || "",
          roleOrder: String(data.data.roleOrder || 999),
          department: data.data.department || "",
          whatsappNumber: data.data.whatsappNumber || "",
          emergencyContact: data.data.emergencyContact || "",
          email: data.data.email || "",
          assignedTeam: data.data.assignedTeam || "",
          experienceLevel: data.data.experienceLevel || "NONE",
          isApproved: data.data.isApproved || false,
          imageUrl: data.data.imageUrl || "",
        })
      }
    } catch (error) {
      toast.error("Failed to load committee member")
      router.push("/committee")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`${API_URL}/api/committee/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          roleOrder: parseInt(formData.roleOrder),
        }),
      })

      const data = await response.json()
      if (data.status === "success") {
        toast.success("Committee member updated successfully")
        router.push("/committee")
      } else {
        toast.error(data.message || "Failed to update committee member")
      }
    } catch (error) {
      toast.error("Failed to update committee member")
    } finally {
      setSaving(false)
    }
  }

  const handleApprovalToggle = async () => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admins can approve committee members")
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/committee/${id}/approval`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isApproved: !formData.isApproved,
        }),
      })

      const data = await response.json()
      if (data.status === "success") {
        setFormData({ ...formData, isApproved: !formData.isApproved })
        toast.success(formData.isApproved ? "Member unapproved" : "Member approved")
      } else {
        toast.error(data.message || "Failed to update approval status")
      }
    } catch (error) {
      toast.error("Failed to update approval status")
    }
  }

  if (authLoading || loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/committee")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Committee Member</h1>
            <p className="text-muted-foreground">Update member information and settings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Main Organizer, Event Coordinator"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleOrder">Display Order</Label>
                  <Input
                    id="roleOrder"
                    type="number"
                    min="1"
                    placeholder="1 = First, 2 = Second, etc."
                    value={formData.roleOrder}
                    onChange={(e) => setFormData({ ...formData, roleOrder: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Lower numbers appear first on public page</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                  <Input
                    id="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTeam">Assigned Team</Label>
                  <Input
                    id="assignedTeam"
                    value={formData.assignedTeam}
                    onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="SOME">Some</SelectItem>
                      <SelectItem value="EXTENSIVE">Extensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Profile Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {isSuperAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Approved members appear on the public OC Members page
                    </p>
                  </div>
                  <Switch
                    checked={formData.isApproved}
                    onCheckedChange={handleApprovalToggle}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/committee")}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveLayout>
  )
}
