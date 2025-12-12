"use client"

import { useState, useEffect } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
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
    <ResponsiveLayout>
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">Awards & Recognition</h1>
            <p className="text-xs text-muted-foreground lg:text-base">Manage tournament awards and certificates</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" size="sm">
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Certificates</span>
              <span className="sm:hidden">Cert</span>
            </Button>
            <Button className="gap-1.5 text-xs lg:gap-2 lg:text-sm" size="sm">
              <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Add Award</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Awards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:gap-6">
          {awards.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-8 lg:py-12">
                <Trophy className="mb-4 h-8 w-8 text-muted-foreground lg:h-12 lg:w-12" />
                <p className="text-center text-sm text-muted-foreground lg:text-base">No awards found. Add awards to recognize outstanding performances.</p>
              </CardContent>
            </Card>
          ) : (
            awards.map((award) => (
              <Card key={award.id} className="group transition-all hover:border-primary">
                <CardHeader className="p-3 lg:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500 lg:h-12 lg:w-12">
                        <Trophy className="h-4 w-4 lg:h-6 lg:w-6" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-sm lg:text-xl">{award.category}</CardTitle>
                        <CardDescription className="text-xs lg:text-sm">{award.stats || "Outstanding performance"}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
                  {award.winner && award.announced ? (
                    <div className="rounded-lg border border-border bg-accent p-2.5 lg:p-4">
                      <div className="mb-1 flex items-center gap-1.5 lg:gap-2">
                        <Award className="h-3 w-3 text-primary lg:h-4 lg:w-4" />
                        <span className="text-[10px] font-medium text-muted-foreground lg:text-sm">Winner</span>
                      </div>
                      <p className="text-sm font-bold lg:text-lg">{award.winner.fullName}</p>
                      {award.teamName && (
                        <Badge variant="outline" className="mt-1.5 text-[10px] lg:mt-2 lg:text-xs">
                          {award.teamName}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-muted/50 p-2.5 text-center lg:p-4">
                      <p className="text-xs text-muted-foreground lg:text-sm">Winner to be announced</p>
                  </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ResponsiveLayout>
  )
}
