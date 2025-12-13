"use client"

import { useState } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Trophy, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

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
  // Auth check - redirects to login if not authenticated
  const { loading: authLoading, isAuthenticated, token, isSuperAdmin, isOC } = useAuth('ADMIN_OR_SUPER')
  
  const [match] = useState(mockMatch)
  const [playerStats] = useState(mockPlayerStats)

  // Show loading while checking authentication
  if (authLoading) {
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
        <div className="mb-4 lg:mb-6">
          <Link href="/matches">
            <Button variant="ghost" className="mb-3 gap-1.5 text-xs lg:mb-4 lg:gap-2 lg:text-sm" size="sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Matches
            </Button>
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2 lg:mb-2 lg:gap-3">
                <h1 className="text-xl font-bold text-foreground lg:text-3xl">Match {match.matchNumber}</h1>
                <Badge className="text-[10px] lg:text-xs">{match.matchType}</Badge>
                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-[10px] lg:text-xs">{match.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground lg:text-base">
                {new Date(match.scheduledTime).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Scoreboard */}
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
              <Trophy className="h-4 w-4 lg:h-5 lg:w-5" />
              Scoreboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 pt-0 lg:space-y-4 lg:p-6 lg:pt-0">
            {/* Home Team */}
            <div className="rounded-lg border border-border p-2.5 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-sm font-bold lg:text-lg">{match.homeTeam}</span>
                  {match.winner === match.homeTeam && (
                    <Badge className="ml-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-[10px] lg:ml-2 lg:text-xs">Winner</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold lg:text-3xl">{match.homeScore}</div>
                  <div className="text-[10px] text-muted-foreground lg:text-sm">{match.homeOvers} overs</div>
                </div>
              </div>
            </div>

            {/* Away Team */}
            <div className="rounded-lg border border-border p-2.5 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-sm font-bold lg:text-lg">{match.awayTeam}</span>
                  {match.winner === match.awayTeam && (
                    <Badge className="ml-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-[10px] lg:ml-2 lg:text-xs">Winner</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold lg:text-3xl">{match.awayScore}</div>
                  <div className="text-[10px] text-muted-foreground lg:text-sm">{match.awayOvers} overs</div>
                </div>
              </div>
            </div>

            {/* Result */}
            {match.winner && (
              <div className="rounded-lg bg-primary/10 p-2.5 text-center lg:p-4">
                <p className="text-sm font-semibold text-primary lg:text-lg">{match.winner} won the match</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Match Info */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Match Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0 lg:space-y-3 lg:p-6 lg:pt-0">
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-muted-foreground">Toss Winner</span>
                <span className="font-medium">{match.tossWinner}</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-muted-foreground">Toss Decision</span>
                <span className="font-medium">{match.tossDecision}</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-muted-foreground">Umpire 1</span>
                <span className="font-medium">{match.umpire1}</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-muted-foreground">Umpire 2</span>
                <span className="font-medium">{match.umpire2}</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-muted-foreground">Scorer</span>
                <span className="font-medium">{match.scorer}</span>
              </div>
              {match.manOfTheMatch && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-500/10 p-2 lg:mt-4 lg:p-3">
                  <Trophy className="h-4 w-4 text-yellow-500 lg:h-5 lg:w-5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground lg:text-xs">Man of the Match</p>
                    <p className="text-xs font-semibold text-yellow-500 lg:text-base">{match.manOfTheMatch}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Player Statistics */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                <User className="h-4 w-4 lg:h-5 lg:w-5" />
                Top Performers
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">Key player statistics</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs lg:text-sm">Player</TableHead>
                    <TableHead className="text-xs lg:text-sm">Runs</TableHead>
                    <TableHead className="text-xs lg:text-sm">Wkts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats.map((stat, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="py-2 lg:py-4">
                        <div>
                          <div className="text-xs font-medium lg:text-sm">{stat.player}</div>
                          <div className="text-[10px] text-muted-foreground lg:text-xs">{stat.team}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 lg:py-4">
                        <div className="text-xs font-semibold lg:text-sm">{stat.runs}</div>
                        <div className="text-[10px] text-muted-foreground lg:text-xs">({stat.balls})</div>
                      </TableCell>
                      <TableCell className="py-2 text-xs font-semibold lg:py-4 lg:text-sm">
                        {stat.wickets}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
