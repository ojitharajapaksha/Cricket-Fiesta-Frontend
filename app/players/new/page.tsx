"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, ShieldAlert, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewPlayerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'SUPER_ADMIN') {
        setAuthorized(true)
      }
    }
    setLoading(false)
  }, [])

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    contactNumber: "",
    department: "",
    position: "",
    experienceLevel: "",
    emergencyContact: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating player:", formData)
    // TODO: Implement API call to create player
    router.push("/players")
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ResponsiveLayout>
    )
  }

  if (!authorized) {
    return (
      <ResponsiveLayout>
        <div className="container mx-auto max-w-lg p-4 lg:p-6">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
              <CardDescription>
                Only Super Admins can add new players.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/players">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Players
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto max-w-3xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <Link href="/players">
            <Button variant="ghost" size="sm" className="mb-2 lg:mb-4 gap-1 lg:gap-2 text-xs lg:text-sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Players
            </Button>
          </Link>
          <h1 className="mb-1 lg:mb-2 text-xl lg:text-3xl font-bold text-foreground">Add New Player</h1>
          <p className="text-xs lg:text-base text-muted-foreground">Register a new player for the cricket tournament</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Player Information</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Fill in all required details to register the player</CardDescription>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-4 lg:space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                  />
                </div>

                {/* Gender and Contact Number */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)} required>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">
                      Contact Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="contactNumber"
                      placeholder="07XXXXXXXX"
                      value={formData.contactNumber}
                      onChange={(e) => handleChange("contactNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                    required
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Position and Experience */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="position">
                      Playing Position <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => handleChange("position", value)}
                      required
                    >
                      <SelectTrigger id="position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Batsman">Batsman</SelectItem>
                        <SelectItem value="Bowler">Bowler</SelectItem>
                        <SelectItem value="All-Rounder">All-Rounder</SelectItem>
                        <SelectItem value="Wicketkeeper">Wicketkeeper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">
                      Experience Level <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value) => handleChange("experienceLevel", value)}
                      required
                    >
                      <SelectTrigger id="experienceLevel">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="07XXXXXXXX (Optional)"
                    value={formData.emergencyContact}
                    onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

          {/* Actions */}
          <div className="mt-4 lg:mt-6 flex justify-end gap-2 lg:gap-4">
            <Link href="/players">
              <Button type="button" variant="outline" size="sm" className="text-xs lg:text-sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="sm" className="gap-1 lg:gap-2 text-xs lg:text-sm">
              <Save className="h-3 w-3 lg:h-4 lg:w-4" />
              Save Player
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveLayout>
  )
}
