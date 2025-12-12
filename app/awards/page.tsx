"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Award, Plus, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Award {
  id: string
  category: string
  winnerId?: string
  winner?: {
    fullName: string
  }
  teamName?: string
  stats?: string
  announced: boolean
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAwards()
  }, [])

  const fetchAwards = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/awards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.status === "success") {
        setAwards(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch awards:", error)
      toast.error("Failed to load awards")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Awards & Recognition</h1>
              <p className="text-muted-foreground">Manage tournament awards and certificates</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Generate Certificates
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Award
              </Button>
            </div>
          </div>

          {/* Awards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {awards.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">No awards found. Add awards to recognize outstanding performances.</p>
                </CardContent>
              </Card>
            ) : (
              awards.map((award) => (
                <Card key={award.id} className="group transition-all hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{award.category}</CardTitle>
                          <CardDescription>{award.stats || "Outstanding performance award"}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {award.winner && award.announced ? (
                      <div className="rounded-lg border border-border bg-accent p-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-muted-foreground">Winner</span>
                        </div>
                        <p className="text-lg font-bold">{award.winner.fullName}</p>
                        {award.teamName && (
                          <Badge variant="outline" className="mt-2">
                            {award.teamName}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4 text-center">
                        <p className="text-sm text-muted-foreground">Winner to be announced</p>
                    </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
