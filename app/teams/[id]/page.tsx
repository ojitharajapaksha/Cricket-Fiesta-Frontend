"use client"

import { useState } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, UserPlus, Trophy, Users } from "lucide-react"
import Link from "next/link"

// Mock team detail data
const mockTeam = {
  id: "1",
  name: "Thunder Strikers",
  color: "#3b82f6",
  captain: "Kasun Perera",
  matchesPlayed: 3,
  matchesWon: 2,
  matchesLost: 1,
}

const mockPlayers = [
  {
    id: "1",
    name: "Kasun Perera",
    position: "Batsman",
    experience: "Advanced",
    isCaptain: true,
  },
  {
    id: "2",
    name: "Rajith Silva",
    position: "Bowler",
    experience: "Intermediate",
    isCaptain: false,
  },
  {
    id: "3",
    name: "Sanath Kumar",
    position: "All-Rounder",
    experience: "Advanced",
    isCaptain: false,
  },
]

const mockMatches = [
  {
    id: "1",
    opponent: "Lightning Warriors",
    result: "Won",
    score: "145/6 vs 142/8",
    date: "2024-03-10",
  },
  {
    id: "2",
    opponent: "Phoenix Blazers",
    result: "Won",
    score: "168/5 vs 165/9",
    date: "2024-03-12",
  },
  {
    id: "3",
    opponent: "Storm Chasers",
    result: "Lost",
    score: "132/10 vs 135/7",
    date: "2024-03-14",
  },
]

export default function TeamDetailPage() {
  const [team] = useState(mockTeam)
  const [players] = useState(mockPlayers)
  const [matches] = useState(mockMatches)

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <Link href="/teams">
            <Button variant="ghost" size="sm" className="mb-2 lg:mb-4 gap-1 lg:gap-2 text-xs lg:text-sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Teams
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 lg:gap-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <div
                className="flex h-12 w-12 lg:h-16 lg:w-16 items-center justify-center rounded-xl text-lg lg:text-2xl font-bold text-white"
                style={{ backgroundColor: team.color }}
              >
                {team.name[0]}
              </div>
              <div>
                <h1 className="mb-1 text-xl lg:text-3xl font-bold text-foreground">{team.name}</h1>
                <p className="text-xs lg:text-base text-muted-foreground">Captain: {team.captain}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1 lg:gap-2 bg-transparent text-xs lg:text-sm">
                <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                Edit Team
              </Button>
              <Button size="sm" className="gap-1 lg:gap-2 text-xs lg:text-sm">
                <UserPlus className="h-3 w-3 lg:h-4 lg:w-4" />
                Add Player
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 lg:mb-6 grid grid-cols-2 gap-2 lg:gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="p-3 lg:p-6 pb-1 lg:pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Total Players</CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0">
              <div className="text-lg lg:text-2xl font-bold">{players.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 lg:p-6 pb-1 lg:pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Matches Won</CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0">
              <div className="text-lg lg:text-2xl font-bold text-green-500">{team.matchesWon}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 lg:p-6 pb-1 lg:pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Matches Lost</CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0">
              <div className="text-lg lg:text-2xl font-bold text-destructive">{team.matchesLost}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 lg:p-6 pb-1 lg:pb-3">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0">
              <div className="text-lg lg:text-2xl font-bold">
                {team.matchesPlayed > 0 ? Math.round((team.matchesWon / team.matchesPlayed) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
          {/* Players List */}
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                <Users className="h-4 w-4 lg:h-5 lg:w-5" />
                Team Players
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">Manage team members and positions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Experience</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium text-xs lg:text-sm">
                          {player.name}
                          {player.isCaptain && (
                            <Badge className="ml-1 lg:ml-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs">C</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{player.position}</Badge>
                        </TableCell>
                        <TableCell className="text-xs lg:text-sm">{player.experience}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Match History */}
            <Card>
              <CardHeader className="p-3 lg:p-6">
                <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                  <Trophy className="h-4 w-4 lg:h-5 lg:w-5" />
                  Match History
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm">Recent match results</CardDescription>
              </CardHeader>
              <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-2 lg:space-y-3">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between rounded-lg border border-border p-3 lg:p-4">
                    <div>
                      <div className="mb-1 font-medium text-sm lg:text-base">vs {match.opponent}</div>
                      <div className="text-xs text-muted-foreground">{match.score}</div>
                      <div className="text-xs text-muted-foreground">{match.date}</div>
                    </div>
                    <Badge
                      className={
                        match.result === "Won"
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs"
                      }
                    >
                      {match.result}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
    </ResponsiveLayout>
  )
}
