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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Save, Loader2, Users, Building2, Clock, Zap } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Team {
  id: string
  name: string
  shortName?: string
  color: string
}

export default function NewMatchPage() {
  const router = useRouter()
  // Auth check - redirects to login if not authenticated
  const { loading: authLoading, isAuthenticated, token, isSuperAdmin } = useAuth('ADMIN_OR_SUPER')
  
  const [teams, setTeams] = useState<Team[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [matchMode, setMatchMode] = useState<"team" | "project">("team")
  
  const [formData, setFormData] = useState({
    matchType: "T10",
    round: "League",
    homeTeamId: "",
    awayTeamId: "",
    homeProject: "",
    awayProject: "",
    scheduledDate: "",
    scheduledTime: "",
    venue: "Main Ground",
    overs: "10",
    umpire1: "",
    umpire2: "",
    scorer: "",
  })

  // Quick time presets
  const timePresets = [
    { label: "Morning", time: "09:00" },
    { label: "Midday", time: "12:00" },
    { label: "Afternoon", time: "15:00" },
    { label: "Evening", time: "18:00" },
  ]

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, scheduledDate: today }));
  }, [])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTeamsAndProjects()
    }
  }, [isAuthenticated, token])

  const fetchTeamsAndProjects = async () => {
    try {
      setLoading(true)
      
      // Fetch teams
      const teamsRes = await fetch(`${API_URL}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json()
        setTeams(teamsData.data || [])
      }

      // Fetch unique projects from users
      const projectsRes = await fetch(`${API_URL}/api/auth/users/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to load teams and projects")
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (matchMode === "team" && (!formData.homeTeamId || !formData.awayTeamId)) {
      toast.error("Please select both teams")
      return
    }
    
    if (matchMode === "project" && (!formData.homeProject || !formData.awayProject)) {
      toast.error("Please select both projects")
      return
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error("Please set date and time")
      return
    }

    setSubmitting(true)
    try {
      // Combine date and time
      const scheduledTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
      
      const matchData: any = {
        matchType: formData.matchType,
        round: formData.round,
        scheduledTime: scheduledTime.toISOString(),
        venue: formData.venue,
        overs: parseInt(formData.overs),
        umpire1: formData.umpire1 || null,
        umpire2: formData.umpire2 || null,
        scorer: formData.scorer || null,
      }

      if (matchMode === "team") {
        matchData.homeTeamId = formData.homeTeamId
        matchData.awayTeamId = formData.awayTeamId
      } else {
        // For project matches, we need to create or use project-based teams
        matchData.homeProject = formData.homeProject
        matchData.awayProject = formData.awayProject
        matchData.isProjectMatch = true
      }

      const response = await fetch(`${API_URL}/api/matches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create match")
      }

      toast.success("Match created successfully!")
      router.push("/matches")
    } catch (error: any) {
      console.error("Failed to create match:", error)
      toast.error(error.message || "Failed to create match")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-set overs based on match type
      if (field === "matchType") {
        if (value === "T10") updated.overs = "10";
        else if (value === "T15") updated.overs = "15";
        else if (value === "T20") updated.overs = "20";
      }
      
      return updated;
    })
  }

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
          {/* Match Mode Selection - Only for Super Admin */}
          {isSuperAdmin && projects.length > 0 && (
            <Card>
              <CardHeader className="p-3 lg:p-6">
                <CardTitle className="text-base lg:text-xl">Match Mode</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Choose between team-based or project-based match</CardDescription>
              </CardHeader>
              <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0">
                <RadioGroup
                  value={matchMode}
                  onValueChange={(value) => setMatchMode(value as "team" | "project")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${matchMode === "team" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem value="team" id="team" />
                    <Label htmlFor="team" className="flex items-center gap-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Team Match</p>
                        <p className="text-xs text-muted-foreground">Between existing teams</p>
                      </div>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${matchMode === "project" ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem value="project" id="project" />
                    <Label htmlFor="project" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Project Match</p>
                        <p className="text-xs text-muted-foreground">Between projects</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Match Details */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Match Details</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                {matchMode === "team" ? "Select teams and match type" : "Select projects and match type"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-3 lg:space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="matchType">
                    Format <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.matchType}
                    onValueChange={(value) => handleChange("matchType", value)}
                    required
                  >
                    <SelectTrigger id="matchType">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T10">T10 (10 Overs)</SelectItem>
                      <SelectItem value="T15">T15 (15 Overs)</SelectItem>
                      <SelectItem value="T20">T20 (20 Overs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="round">
                    Round <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.round}
                    onValueChange={(value) => handleChange("round", value)}
                    required
                  >
                    <SelectTrigger id="round">
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="League">League</SelectItem>
                      <SelectItem value="Quarter Final">Quarter Final</SelectItem>
                      <SelectItem value="Semi-Final">Semi-Final</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                      <SelectItem value="Friendly">Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Team Selection */}
              {matchMode === "team" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="homeTeam">
                      Home Team <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.homeTeamId}
                      onValueChange={(value) => handleChange("homeTeamId", value)}
                      required
                    >
                      <SelectTrigger id="homeTeam">
                        <SelectValue placeholder="Select home team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id} disabled={team.id === formData.awayTeamId}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                              {team.name}
                            </div>
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
                      value={formData.awayTeamId}
                      onValueChange={(value) => handleChange("awayTeamId", value)}
                      required
                    >
                      <SelectTrigger id="awayTeam">
                        <SelectValue placeholder="Select away team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id} disabled={team.id === formData.homeTeamId}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                              {team.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Project Selection */}
              {matchMode === "project" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="homeProject">
                      Home Project <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.homeProject}
                      onValueChange={(value) => handleChange("homeProject", value)}
                      required
                    >
                      <SelectTrigger id="homeProject">
                        <SelectValue placeholder="Select home project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project} value={project} disabled={project === formData.awayProject}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              {project}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="awayProject">
                      Away Project <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.awayProject}
                      onValueChange={(value) => handleChange("awayProject", value)}
                      required
                    >
                      <SelectTrigger id="awayProject">
                        <SelectValue placeholder="Select away project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project} value={project} disabled={project === formData.homeProject}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              {project}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl flex items-center gap-2">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                Schedule
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">Set match date, time and venue</CardDescription>
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

              {/* Quick Time Presets */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  Quick Select Time
                </Label>
                <div className="flex flex-wrap gap-2">
                  {timePresets.map((preset) => (
                    <Button
                      key={preset.time}
                      type="button"
                      variant={formData.scheduledTime === preset.time ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => handleChange("scheduledTime", preset.time)}
                    >
                      {preset.label} ({preset.time})
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    placeholder="Enter venue"
                    value={formData.venue}
                    onChange={(e) => handleChange("venue", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overs">Overs</Label>
                  <Input
                    id="overs"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.overs}
                    onChange={(e) => handleChange("overs", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Officials */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Match Officials</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Assign umpires and scorer (optional)</CardDescription>
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

          {/* Match Summary Preview */}
          {((matchMode === "team" && formData.homeTeamId && formData.awayTeamId) ||
            (matchMode === "project" && formData.homeProject && formData.awayProject)) && 
            formData.scheduledDate && formData.scheduledTime && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="p-3 lg:p-6 pb-2 lg:pb-2">
                <CardTitle className="text-base lg:text-xl text-primary">Match Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center gap-4 text-lg lg:text-xl font-bold mb-2">
                    {matchMode === "team" ? (
                      <>
                        <span>{teams.find(t => t.id === formData.homeTeamId)?.name || "Home"}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span>{teams.find(t => t.id === formData.awayTeamId)?.name || "Away"}</span>
                      </>
                    ) : (
                      <>
                        <span>{formData.homeProject}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span>{formData.awayProject}</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-1">
                      {formData.matchType} • {formData.round} • {formData.overs} Overs
                    </p>
                    <p>
                      📅 {new Date(formData.scheduledDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })} at {formData.scheduledTime}
                    </p>
                    <p>📍 {formData.venue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 lg:gap-4">
            <Link href="/matches">
              <Button type="button" variant="outline" size="sm" className="text-xs lg:text-sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="sm" className="gap-1 lg:gap-2 text-xs lg:text-sm" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
              ) : (
                <Save className="h-3 w-3 lg:h-4 lg:w-4" />
              )}
              {submitting ? "Creating..." : "Create Match"}
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveLayout>
  )
}
