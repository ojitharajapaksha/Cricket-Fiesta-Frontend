"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LiveScoringPage() {
  const [homeScore, setHomeScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 })
  const [awayScore, setAwayScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 })
  const [currentInning, setCurrentInning] = useState<"home" | "away">("home")

  const updateScore = (team: "home" | "away", runs: number) => {
    const setter = team === "home" ? setHomeScore : setAwayScore
    const current = team === "home" ? homeScore : awayScore

    setter((prev) => {
      const newBalls = prev.balls + 1
      const newOvers = prev.overs + (newBalls === 6 ? 1 : 0)
      const finalBalls = newBalls === 6 ? 0 : newBalls

      return {
        runs: prev.runs + runs,
        wickets: prev.wickets,
        overs: newOvers,
        balls: finalBalls,
      }
    })
  }

  const addWicket = (team: "home" | "away") => {
    const setter = team === "home" ? setHomeScore : setAwayScore
    setter((prev) => ({
      ...prev,
      wickets: Math.min(prev.wickets + 1, 10),
    }))
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/matches">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Matches
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">Live Scoring</h1>
                <p className="text-muted-foreground">Match 2: Thunder Strikers vs Lightning Warriors</p>
              </div>
              <Badge className="animate-pulse bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">Live</Badge>
            </div>
          </div>

          {/* Current Scoreboard */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Home Team */}
              <div className="rounded-lg border-2 border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">Thunder Strikers</span>
                    {currentInning === "home" && <Badge>Batting</Badge>}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {homeScore.runs}/{homeScore.wickets}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {homeScore.overs}.{homeScore.balls} overs
                    </div>
                  </div>
                </div>
              </div>

              {/* Away Team */}
              <div className="rounded-lg border-2 border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">Lightning Warriors</span>
                    {currentInning === "away" && <Badge>Batting</Badge>}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {awayScore.runs}/{awayScore.wickets}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {awayScore.overs}.{awayScore.balls} overs
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Scoring</CardTitle>
              <CardDescription>Record runs for the current batting team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Run Buttons */}
              <div>
                <p className="mb-3 text-sm font-medium">Runs Scored</p>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                  {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                    <Button
                      key={runs}
                      onClick={() => updateScore(currentInning, runs)}
                      size="lg"
                      variant={runs === 4 || runs === 6 ? "default" : "outline"}
                      className="text-lg font-bold"
                    >
                      {runs}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Wicket Button */}
              <div>
                <p className="mb-3 text-sm font-medium">Wicket</p>
                <Button onClick={() => addWicket(currentInning)} variant="destructive" size="lg" className="w-full">
                  Wicket Fallen
                </Button>
              </div>

              {/* Innings Toggle */}
              <div>
                <p className="mb-3 text-sm font-medium">Current Batting Team</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setCurrentInning("home")}
                    variant={currentInning === "home" ? "default" : "outline"}
                  >
                    Thunder Strikers
                  </Button>
                  <Button
                    onClick={() => setCurrentInning("away")}
                    variant={currentInning === "away" ? "default" : "outline"}
                  >
                    Lightning Warriors
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">Save Progress</Button>
            <Button>End Match</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
