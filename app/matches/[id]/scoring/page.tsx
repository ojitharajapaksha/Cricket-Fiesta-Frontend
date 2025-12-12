"use client"

import { useState } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
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
    <ResponsiveLayout>
      <div className="container mx-auto max-w-4xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <Link href="/matches">
            <Button variant="ghost" size="sm" className="mb-2 lg:mb-4 gap-1 lg:gap-2 text-xs lg:text-sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Matches
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="mb-1 lg:mb-2 text-xl lg:text-3xl font-bold text-foreground">Live Scoring</h1>
              <p className="text-xs lg:text-base text-muted-foreground">Match 2: Thunder Strikers vs Lightning Warriors</p>
            </div>
            <Badge className="w-fit animate-pulse bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 text-xs lg:text-sm">Live</Badge>
          </div>
        </div>

        {/* Current Scoreboard */}
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-base lg:text-xl">Current Score</CardTitle>
          </CardHeader>
          <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-3 lg:space-y-4">
            {/* Home Team */}
            <div className="rounded-lg border-2 border-border p-3 lg:p-4">
              <div className="mb-1 lg:mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 lg:gap-3">
                  <span className="text-sm lg:text-lg font-bold">Thunder Strikers</span>
                  {currentInning === "home" && <Badge className="text-xs">Batting</Badge>}
                </div>
                <div className="text-right">
                  <div className="text-xl lg:text-3xl font-bold">
                    {homeScore.runs}/{homeScore.wickets}
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground">
                    {homeScore.overs}.{homeScore.balls} overs
                  </div>
                </div>
              </div>
            </div>

            {/* Away Team */}
            <div className="rounded-lg border-2 border-border p-3 lg:p-4">
              <div className="mb-1 lg:mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 lg:gap-3">
                  <span className="text-sm lg:text-lg font-bold">Lightning Warriors</span>
                  {currentInning === "away" && <Badge className="text-xs">Batting</Badge>}
                </div>
                <div className="text-right">
                  <div className="text-xl lg:text-3xl font-bold">
                    {awayScore.runs}/{awayScore.wickets}
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground">
                    {awayScore.overs}.{awayScore.balls} overs
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Controls */}
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-base lg:text-xl">Quick Scoring</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Record runs for the current batting team</CardDescription>
          </CardHeader>
          <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-3 lg:space-y-4">
            {/* Run Buttons */}
            <div>
              <p className="mb-2 lg:mb-3 text-xs lg:text-sm font-medium">Runs Scored</p>
              <div className="grid grid-cols-4 gap-2 lg:gap-3 sm:grid-cols-7">
                {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
                  <Button
                    key={runs}
                    onClick={() => updateScore(currentInning, runs)}
                    size="sm"
                    variant={runs === 4 || runs === 6 ? "default" : "outline"}
                    className="text-sm lg:text-lg font-bold h-10 lg:h-12"
                  >
                    {runs}
                  </Button>
                ))}
              </div>
            </div>

            {/* Wicket Button */}
            <div>
              <p className="mb-2 lg:mb-3 text-xs lg:text-sm font-medium">Wicket</p>
              <Button onClick={() => addWicket(currentInning)} variant="destructive" size="sm" className="w-full text-xs lg:text-sm h-10 lg:h-12">
                Wicket Fallen
              </Button>
            </div>

            {/* Innings Toggle */}
            <div>
              <p className="mb-2 lg:mb-3 text-xs lg:text-sm font-medium">Current Batting Team</p>
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                <Button
                  onClick={() => setCurrentInning("home")}
                  variant={currentInning === "home" ? "default" : "outline"}
                  size="sm"
                  className="text-xs lg:text-sm"
                >
                  Thunder Strikers
                </Button>
                <Button
                  onClick={() => setCurrentInning("away")}
                  variant={currentInning === "away" ? "default" : "outline"}
                  size="sm"
                  className="text-xs lg:text-sm"
                >
                  Lightning Warriors
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2 lg:gap-4">
          <Button variant="outline" size="sm" className="text-xs lg:text-sm">Save Progress</Button>
          <Button size="sm" className="text-xs lg:text-sm">End Match</Button>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
