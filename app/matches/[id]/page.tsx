"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Trophy, User } from "lucide-react"
import Link from "next/link"

// Mock match detail data
const mockMatch = {
  id: "1",
  matchNumber: 1,
  matchType: "League",
  homeTeam: "Thunder Strikers",
  awayTeam: "Lightning Warriors",
  status: "Completed",
  scheduledTime: "2024-03-10T09:00:00",
  homeScore: "145/6",
  homeOvers: "20.0",
  awayScore: "142/8",
  awayOvers: "20.0",
  winner: "Thunder Strikers",
  tossWinner: "Thunder Strikers",
  tossDecision: "Bat",
  umpire1: "John Silva",
  umpire2: "Peter Fernando",
  scorer: "Mary Perera",
  manOfTheMatch: "Kasun Perera",
}

const mockPlayerStats = [
  {
    player: "Kasun Perera",
    team: "Thunder Strikers",
    runs: 67,
    balls: 45,
    fours: 8,
    sixes: 2,
    wickets: 0,
  },
  {
    player: "Rajith Silva",
    team: "Thunder Strikers",
    runs: 12,
    balls: 18,
    fours: 1,
    sixes: 0,
    wickets: 3,
  },
]

export default function MatchDetailPage() {
  const [match] = useState(mockMatch)
  const [playerStats] = useState(mockPlayerStats)

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/matches">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Matches
              </Button>
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">Match {match.matchNumber}</h1>
                  <Badge>{match.matchType}</Badge>
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">{match.status}</Badge>
                </div>
                <p className="text-muted-foreground">
                  {new Date(match.scheduledTime).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Scoreboard */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Scoreboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Home Team */}
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold">{match.homeTeam}</span>
                    {match.winner === match.homeTeam && (
                      <Badge className="ml-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Winner</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{match.homeScore}</div>
                    <div className="text-sm text-muted-foreground">{match.homeOvers} overs</div>
                  </div>
                </div>
              </div>

              {/* Away Team */}
              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold">{match.awayTeam}</span>
                    {match.winner === match.awayTeam && (
                      <Badge className="ml-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Winner</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{match.awayScore}</div>
                    <div className="text-sm text-muted-foreground">{match.awayOvers} overs</div>
                  </div>
                </div>
              </div>

              {/* Result */}
              {match.winner && (
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <p className="text-lg font-semibold text-primary">{match.winner} won the match</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Match Info */}
            <Card>
              <CardHeader>
                <CardTitle>Match Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toss Winner</span>
                  <span className="font-medium">{match.tossWinner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Toss Decision</span>
                  <span className="font-medium">{match.tossDecision}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Umpire 1</span>
                  <span className="font-medium">{match.umpire1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Umpire 2</span>
                  <span className="font-medium">{match.umpire2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scorer</span>
                  <span className="font-medium">{match.scorer}</span>
                </div>
                {match.manOfTheMatch && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Man of the Match</p>
                      <p className="font-semibold text-yellow-500">{match.manOfTheMatch}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Player Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Top Performers
                </CardTitle>
                <CardDescription>Key player statistics</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Runs</TableHead>
                      <TableHead>Wickets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerStats.map((stat, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{stat.player}</div>
                            <div className="text-xs text-muted-foreground">{stat.team}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{stat.runs}</div>
                          <div className="text-xs text-muted-foreground">({stat.balls} balls)</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{stat.wickets}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
