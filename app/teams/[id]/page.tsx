"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
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
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/teams">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Teams
              </Button>
            </Link>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white"
                  style={{ backgroundColor: team.color }}
                >
                  {team.name[0]}
                </div>
                <div>
                  <h1 className="mb-1 text-3xl font-bold text-foreground">{team.name}</h1>
                  <p className="text-muted-foreground">Captain: {team.captain}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Edit className="h-4 w-4" />
                  Edit Team
                </Button>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Player
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{players.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Matches Won</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{team.matchesWon}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Matches Lost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{team.matchesLost}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {team.matchesPlayed > 0 ? Math.round((team.matchesWon / team.matchesPlayed) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Players List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Players
                </CardTitle>
                <CardDescription>Manage team members and positions</CardDescription>
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
                        <TableCell className="font-medium">
                          {player.name}
                          {player.isCaptain && (
                            <Badge className="ml-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">C</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell>{player.experience}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Match History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Match History
                </CardTitle>
                <CardDescription>Recent match results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <div className="mb-1 font-medium">vs {match.opponent}</div>
                      <div className="text-xs text-muted-foreground">{match.score}</div>
                      <div className="text-xs text-muted-foreground">{match.date}</div>
                    </div>
                    <Badge
                      className={
                        match.result === "Won"
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/20"
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
      </main>
    </div>
  )
}
