"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewPlayerPage() {
  const router = useRouter()
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

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/players">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Players
              </Button>
            </Link>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Add New Player</h1>
            <p className="text-muted-foreground">Register a new player for the cricket tournament</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
                <CardDescription>Fill in all required details to register the player</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
            <div className="mt-6 flex justify-end gap-4">
              <Link href="/players">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Save Player
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
