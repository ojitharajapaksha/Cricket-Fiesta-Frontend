"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ResponsiveLayout } from "@/components/app-sidebar"
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
    <ResponsiveLayout>
      <div className="container mx-auto max-w-3xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <Link href="/food">
            <Button variant="ghost" size="sm" className="mb-2 lg:mb-4 gap-1 lg:gap-2 text-xs lg:text-sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Food Distribution
            </Button>
          </Link>
          <h1 className="mb-1 lg:mb-2 text-xl lg:text-3xl font-bold text-foreground">New Food Registration</h1>
          <p className="text-xs lg:text-base text-muted-foreground">Register a participant for meal distribution</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Registration Information</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Fill in all required details. QR code will be generated automatically.
              </CardDescription>
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
          <div className="mt-4 lg:mt-6 flex justify-end gap-2 lg:gap-4">
            <Link href="/food">
              <Button type="button" variant="outline" size="sm" className="text-xs lg:text-sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="sm" className="gap-1 lg:gap-2 text-xs lg:text-sm">
              <Save className="h-3 w-3 lg:h-4 lg:w-4" />
              Save Registration
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveLayout>
  )
}
