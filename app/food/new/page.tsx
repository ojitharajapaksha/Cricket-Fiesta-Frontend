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

export default function NewFoodRegistrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    traineeId: "",
    mobileNumber: "",
    department: "",
    foodPreference: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating food registration:", formData)
    // TODO: Implement API call to create registration and generate QR code
    router.push("/food")
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
            <Link href="/food">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Food Distribution
              </Button>
            </Link>
            <h1 className="mb-2 text-3xl font-bold text-foreground">New Food Registration</h1>
            <p className="text-muted-foreground">Register a participant for meal distribution</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Registration Information</CardTitle>
                <CardDescription>
                  Fill in all required details. QR code will be generated automatically.
                </CardDescription>
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

                {/* Trainee ID and Mobile */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="traineeId">
                      Trainee ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="traineeId"
                      placeholder="TRN001"
                      value={formData.traineeId}
                      onChange={(e) => handleChange("traineeId", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">
                      Mobile Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="mobileNumber"
                      placeholder="07XXXXXXXX"
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange("mobileNumber", e.target.value)}
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

                {/* Food Preference */}
                <div className="space-y-2">
                  <Label htmlFor="foodPreference">
                    Food Preference <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.foodPreference}
                    onValueChange={(value) => handleChange("foodPreference", value)}
                    required
                  >
                    <SelectTrigger id="foodPreference">
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-4">
              <Link href="/food">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Save Registration
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
