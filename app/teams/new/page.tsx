"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Shuffle, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function NewTeamPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
  })
  const [colorMethod, setColorMethod] = useState<"auto" | "manual">("auto")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Please enter a team name")
      return
    }
    
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(`Team "${formData.name}" created successfully!`)
        router.push("/teams")
      } else {
        throw new Error(data.message || "Failed to create team")
      }
    } catch (error: any) {
      console.error("Error creating team:", error)
      toast.error(error.message || "Failed to create team")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const colorPresets = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#10b981" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#ec4899" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Indigo", value: "#6366f1" },
  ]

  // Professional cricket team color palette
  const professionalColors = [
    { name: "Royal Blue", value: "#1e40af", description: "Mumbai Indians style" },
    { name: "Yellow Gold", value: "#eab308", description: "Chennai Super Kings style" },
    { name: "Sunrise Orange", value: "#f97316", description: "Sunrisers style" },
    { name: "Royal Purple", value: "#7c3aed", description: "Kolkata Knight Riders style" },
    { name: "Crimson Red", value: "#dc2626", description: "Royal Challengers style" },
    { name: "Electric Blue", value: "#0ea5e9", description: "Delhi Capitals style" },
    { name: "Rajasthan Pink", value: "#ec4899", description: "Rajasthan Royals style" },
    { name: "Punjab Red", value: "#b91c1c", description: "Punjab Kings style" },
    { name: "Gujarat Titan Blue", value: "#1e3a8a", description: "Gujarat Titans style" },
    { name: "Lucknow Teal", value: "#14b8a6", description: "Lucknow Super Giants style" },
  ]

  const autoAssignColor = () => {
    const randomColor = professionalColors[Math.floor(Math.random() * professionalColors.length)]
    setFormData((prev) => ({ ...prev, color: randomColor.value }))
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/teams">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Teams
              </Button>
            </Link>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Create New Team</h1>
            <p className="text-muted-foreground">Create a new cricket team for the tournament</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>Enter team name and select a color</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Team Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Thunder Strikers"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                {/* Color Selection */}
                <div className="space-y-4">
                  <Label>
                    Team Color <span className="text-destructive">*</span>
                  </Label>
                  
                  {/* Method Selection */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={colorMethod === "auto" ? "default" : "outline"}
                      onClick={() => setColorMethod("auto")}
                      className="flex-1"
                    >
                      {colorMethod === "auto" && <Check className="mr-2 h-4 w-4" />}
                      Auto-Assign
                    </Button>
                    <Button
                      type="button"
                      variant={colorMethod === "manual" ? "default" : "outline"}
                      onClick={() => setColorMethod("manual")}
                      className="flex-1"
                    >
                      {colorMethod === "manual" && <Check className="mr-2 h-4 w-4" />}
                      Manual Selection
                    </Button>
                  </div>

                  {/* Auto-Assign Mode */}
                  {colorMethod === "auto" && (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 rounded-lg border-2 border-white shadow-lg"
                              style={{ backgroundColor: formData.color }}
                            />
                            <div>
                              <p className="font-medium">Assigned Color</p>
                              <p className="text-sm text-muted-foreground">
                                {professionalColors.find(c => c.value === formData.color)?.name || "Professional Team Color"}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={autoAssignColor}
                            className="gap-2"
                          >
                            <Shuffle className="h-4 w-4" />
                            Randomize
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Colors are automatically selected from professional cricket team palettes. Click randomize to try a different color.
                        </p>
                      </div>

                      {/* Professional Color Palette Preview */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Select from Professional Palette</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                          {professionalColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => handleChange("color", color.value)}
                              className="group relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all hover:scale-105 hover:shadow-md"
                              style={{
                                borderColor: formData.color === color.value ? color.value : "transparent",
                                backgroundColor: formData.color === color.value ? `${color.value}10` : "transparent",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-8 w-8 rounded border-2 border-white shadow-sm"
                                  style={{ backgroundColor: color.value }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{color.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{color.description}</p>
                                </div>
                              </div>
                              {formData.color === color.value && (
                                <div className="absolute top-1 right-1">
                                  <div className="rounded-full bg-green-500 p-0.5">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual Selection Mode */}
                  {colorMethod === "manual" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                        {colorPresets.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => handleChange("color", color.value)}
                            className="group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:scale-105"
                            style={{
                              backgroundColor: color.value,
                              borderColor: formData.color === color.value ? color.value : "transparent",
                            }}
                          >
                            {formData.color === color.value && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="h-4 w-4 rounded-full bg-white" />
                              </div>
                            )}
                            <span className="sr-only">{color.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Custom color:</span>
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => handleChange("color", e.target.value)}
                          className="h-10 w-20 cursor-pointer rounded border border-border"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: formData.color }}
                    >
                      <span className="text-2xl font-bold">{formData.name ? formData.name[0] : "T"}</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{formData.name || "Team Name"}</div>
                      <div className="text-sm text-muted-foreground">Cricket Team</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-4">
              <Link href="/teams">
                <Button type="button" variant="outline" disabled={submitting}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="gap-2" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {submitting ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
