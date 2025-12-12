"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ResponsiveLayout } from "@/components/app-sidebar"
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
    <ResponsiveLayout>
      <div className="container mx-auto max-w-3xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <Link href="/teams">
            <Button variant="ghost" className="mb-3 gap-1.5 text-xs lg:mb-4 lg:gap-2 lg:text-sm" size="sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Teams
            </Button>
          </Link>
          <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">Create New Team</h1>
          <p className="text-xs text-muted-foreground lg:text-base">Create a new cricket team for the tournament</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Team Information</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Enter team name and select a color</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-3 pt-0 lg:space-y-6 lg:p-6 lg:pt-0">
              {/* Team Name */}
              <div className="space-y-1.5 lg:space-y-2">
                <Label htmlFor="name" className="text-xs lg:text-sm">
                  Team Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Thunder Strikers"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="h-8 text-xs lg:h-10 lg:text-sm"
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-3 lg:space-y-4">
                <Label className="text-xs lg:text-sm">
                  Team Color <span className="text-destructive">*</span>
                </Label>
                
                {/* Method Selection */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={colorMethod === "auto" ? "default" : "outline"}
                    onClick={() => setColorMethod("auto")}
                    className="flex-1 text-xs lg:text-sm"
                    size="sm"
                  >
                    {colorMethod === "auto" && <Check className="mr-1.5 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />}
                    Auto
                  </Button>
                  <Button
                    type="button"
                    variant={colorMethod === "manual" ? "default" : "outline"}
                    onClick={() => setColorMethod("manual")}
                    className="flex-1 text-xs lg:text-sm"
                    size="sm"
                  >
                    {colorMethod === "manual" && <Check className="mr-1.5 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />}
                    Manual
                  </Button>
                </div>

                {/* Auto-Assign Mode */}
                {colorMethod === "auto" && (
                  <div className="space-y-2.5 lg:space-y-3">
                    <div className="rounded-lg border border-border bg-muted/50 p-2.5 lg:p-4">
                      <div className="mb-2.5 flex items-center justify-between lg:mb-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div
                            className="h-8 w-8 rounded-lg border-2 border-white shadow-lg lg:h-12 lg:w-12"
                            style={{ backgroundColor: formData.color }}
                          />
                          <div>
                            <p className="text-xs font-medium lg:text-base">Assigned Color</p>
                            <p className="text-[10px] text-muted-foreground lg:text-sm">
                              {professionalColors.find(c => c.value === formData.color)?.name || "Professional Team Color"}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={autoAssignColor}
                          className="gap-1.5 text-xs lg:gap-2 lg:text-sm"
                        >
                          <Shuffle className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span className="hidden sm:inline">Randomize</span>
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground lg:text-xs">
                        Colors are automatically selected from professional cricket team palettes.
                      </p>
                    </div>

                    {/* Professional Color Palette Preview */}
                    <div className="space-y-1.5 lg:space-y-2">
                      <p className="text-xs font-medium lg:text-sm">Select from Professional Palette</p>
                      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5 lg:gap-2">
                        {professionalColors.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => handleChange("color", color.value)}
                            className="group relative overflow-hidden rounded-lg border-2 p-2 text-left transition-all hover:scale-105 hover:shadow-md lg:p-3"
                            style={{
                              borderColor: formData.color === color.value ? color.value : "transparent",
                              backgroundColor: formData.color === color.value ? `${color.value}10` : "transparent",
                            }}
                          >
                            <div className="flex items-center gap-1.5 lg:gap-2">
                              <div
                                className="h-6 w-6 rounded border-2 border-white shadow-sm lg:h-8 lg:w-8"
                                style={{ backgroundColor: color.value }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium truncate lg:text-xs">{color.name}</p>
                              </div>
                            </div>
                            {formData.color === color.value && (
                              <div className="absolute top-0.5 right-0.5 lg:top-1 lg:right-1">
                                <div className="rounded-full bg-green-500 p-0.5">
                                  <Check className="h-2 w-2 text-white lg:h-3 lg:w-3" />
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
                  <div className="space-y-2.5 lg:space-y-3">
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:gap-3">
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
                              <div className="h-3 w-3 rounded-full bg-white lg:h-4 lg:w-4" />
                            </div>
                          )}
                          <span className="sr-only">{color.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground lg:text-sm">Custom:</span>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => handleChange("color", e.target.value)}
                        className="h-8 w-16 cursor-pointer rounded border border-border lg:h-10 lg:w-20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="space-y-1.5 lg:space-y-2">
                <Label className="text-xs lg:text-sm">Preview</Label>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3 lg:gap-4 lg:p-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-white lg:h-16 lg:w-16"
                    style={{ backgroundColor: formData.color }}
                  >
                    <span className="text-lg font-bold lg:text-2xl">{formData.name ? formData.name[0] : "T"}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold lg:text-lg">{formData.name || "Team Name"}</div>
                    <div className="text-xs text-muted-foreground lg:text-sm">Cricket Team</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-2 lg:mt-6 lg:gap-4">
            <Link href="/teams">
              <Button type="button" variant="outline" disabled={submitting} size="sm" className="text-xs lg:text-sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="gap-1.5 text-xs lg:gap-2 lg:text-sm" disabled={submitting} size="sm">
              {submitting ? (
                <Loader2 className="h-3 w-3 animate-spin lg:h-4 lg:w-4" />
              ) : (
                <Save className="h-3 w-3 lg:h-4 lg:w-4" />
              )}
              {submitting ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveLayout>
  )
}
