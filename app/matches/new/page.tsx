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

export default function NewMatchPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    matchType: "",
    homeTeam: "",
    awayTeam: "",
    scheduledDate: "",
    scheduledTime: "",
    umpire1: "",
    umpire2: "",
    scorer: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating match:", formData)
    // TODO: Implement API call to create match
    router.push("/matches")
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const teams = ["Thunder Strikers", "Lightning Warriors", "Phoenix Blazers", "Storm Chasers"]

  return (
    <ResponsiveLayout>
      <div className="container mx-auto max-w-3xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <Link href="/matches">
            <Button variant="ghost" size="sm" className="mb-2 lg:mb-4 gap-1 lg:gap-2 text-xs lg:text-sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Matches
            </Button>
          </Link>
          <h1 className="mb-1 lg:mb-2 text-xl lg:text-3xl font-bold text-foreground">Create New Match</h1>
          <p className="text-xs lg:text-base text-muted-foreground">Schedule a new cricket match</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          {/* Match Details */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Match Details</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Select teams and match type</CardDescription>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-3 lg:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matchType">
                    Match Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.matchType}
                    onValueChange={(value) => handleChange("matchType", value)}
                    required
                  >
                    <SelectTrigger id="matchType">
                      <SelectValue placeholder="Select match type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="League">League</SelectItem>
                      <SelectItem value="Semi-Final">Semi-Final</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="homeTeam">
                      Home Team <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.homeTeam}
                      onValueChange={(value) => handleChange("homeTeam", value)}
                      required
                    >
                      <SelectTrigger id="homeTeam">
                        <SelectValue placeholder="Select home team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team} value={team} disabled={team === formData.awayTeam}>
                            {team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="awayTeam">
                      Away Team <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.awayTeam}
                      onValueChange={(value) => handleChange("awayTeam", value)}
                      required
                    >
                      <SelectTrigger id="awayTeam">
                        <SelectValue placeholder="Select away team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team} value={team} disabled={team === formData.homeTeam}>
                            {team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Schedule */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Schedule</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Set match date and time</CardDescription>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-3 lg:space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleChange("scheduledDate", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">
                      Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleChange("scheduledTime", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Officials */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Match Officials</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Assign umpires and scorer</CardDescription>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-3 lg:space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="umpire1">Umpire 1</Label>
                    <Input
                      id="umpire1"
                      placeholder="Enter name"
                      value={formData.umpire1}
                      onChange={(e) => handleChange("umpire1", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="umpire2">Umpire 2</Label>
                    <Input
                      id="umpire2"
                      placeholder="Enter name"
                      value={formData.umpire2}
                      onChange={(e) => handleChange("umpire2", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scorer">Scorer</Label>
                  <Input
                    id="scorer"
                    placeholder="Enter name"
                    value={formData.scorer}
                    onChange={(e) => handleChange("scorer", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 lg:gap-4">
            <Link href="/matches">
              <Button type="button" variant="outline" size="sm" className="text-xs lg:text-sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="sm" className="gap-1 lg:gap-2 text-xs lg:text-sm">
              <Save className="h-3 w-3 lg:h-4 lg:w-4" />
              Create Match
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveLayout>
  )
}
