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

export default function NewCommitteeMemberPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    whatsappNumber: "",
    emergencyContact: "",
    email: "",
    assignedTeam: "",
    experience: "",
    availabilityPlanning: "",
    availabilitySetup: "",
    availabilityMorning: "",
    availabilityAfternoon: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating committee member:", formData)
    // TODO: Implement API call to create committee member
    router.push("/committee")
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
            <Link href="/committee">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Committee
              </Button>
            </Link>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Add Committee Member</h1>
            <p className="text-muted-foreground">Register a new volunteer for the organizing committee</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic contact and department details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid gap-4 sm:grid-cols-2">
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

                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">
                      WhatsApp Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="whatsappNumber"
                      placeholder="07XXXXXXXX"
                      value={formData.whatsappNumber}
                      onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@slt.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="07XXXXXXXX (Optional)"
                      value={formData.emergencyContact}
                      onChange={(e) => handleChange("emergencyContact", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Team Assignment</CardTitle>
                <CardDescription>Role and experience level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTeam">
                    Assigned Team <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.assignedTeam}
                    onValueChange={(value) => handleChange("assignedTeam", value)}
                    required
                  >
                    <SelectTrigger id="assignedTeam">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Event Coordinator">Event Coordinator</SelectItem>
                      <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                      <SelectItem value="Ground Logistics">Ground Logistics</SelectItem>
                      <SelectItem value="Registration Team">Registration Team</SelectItem>
                      <SelectItem value="Team Coordination">Team Coordination</SelectItem>
                      <SelectItem value="Media & Photography">Media & Photography</SelectItem>
                      <SelectItem value="First Aid">First Aid</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Marketing & Communication">Marketing & Communication</SelectItem>
                      <SelectItem value="Awards & Certificates">Awards & Certificates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">
                    Experience Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(value) => handleChange("experience", value)}
                    required
                  >
                    <SelectTrigger id="experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Extensive">Extensive</SelectItem>
                      <SelectItem value="Some">Some</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>Select availability for different time slots</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="availabilityPlanning">Planning Phase</Label>
                    <Select
                      value={formData.availabilityPlanning}
                      onValueChange={(value) => handleChange("availabilityPlanning", value)}
                    >
                      <SelectTrigger id="availabilityPlanning">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fully Available">Fully Available</SelectItem>
                        <SelectItem value="Limited Availability">Limited Availability</SelectItem>
                        <SelectItem value="Not Available">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availabilitySetup">Setup Day</Label>
                    <Select
                      value={formData.availabilitySetup}
                      onValueChange={(value) => handleChange("availabilitySetup", value)}
                    >
                      <SelectTrigger id="availabilitySetup">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fully Available">Fully Available</SelectItem>
                        <SelectItem value="Limited Availability">Limited Availability</SelectItem>
                        <SelectItem value="Not Available">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availabilityMorning">Event Day Morning</Label>
                    <Select
                      value={formData.availabilityMorning}
                      onValueChange={(value) => handleChange("availabilityMorning", value)}
                    >
                      <SelectTrigger id="availabilityMorning">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fully Available">Fully Available</SelectItem>
                        <SelectItem value="Limited Availability">Limited Availability</SelectItem>
                        <SelectItem value="Not Available">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availabilityAfternoon">Event Day Afternoon</Label>
                    <Select
                      value={formData.availabilityAfternoon}
                      onValueChange={(value) => handleChange("availabilityAfternoon", value)}
                    >
                      <SelectTrigger id="availabilityAfternoon">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fully Available">Fully Available</SelectItem>
                        <SelectItem value="Limited Availability">Limited Availability</SelectItem>
                        <SelectItem value="Not Available">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Link href="/committee">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Save Member
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
