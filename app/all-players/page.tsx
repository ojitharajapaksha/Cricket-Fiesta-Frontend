"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, Home, ArrowLeft, Search, UserCircle, Building2 } from "lucide-react"

interface Player {
  id: string
  fullName: string
  department: string
  position: string
  battingStyle: string | null
  bowlingStyle: string | null
  experienceLevel: string
  profileImage: string | null
  projectName: string | null
  team: {
    id: string
    name: string
  } | null
}

const positionLabels: Record<string, string> = {
  BATSMAN: 'Batsman',
  BOWLER: 'Bowler',
  ALL_ROUNDER: 'All-Rounder',
  WICKET_KEEPER: 'Wicket Keeper'
}

const experienceColors: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-blue-100 text-blue-700',
  ADVANCED: 'bg-purple-100 text-purple-700',
  PROFESSIONAL: 'bg-amber-100 text-amber-700'
}

export default function PlayersPublicPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/public`)
        const data = await response.json()
        if (data.status === 'success') {
          setPlayers(data.data)
          setFilteredPlayers(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch players:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  // Filter players based on search and filters
  useEffect(() => {
    let result = players

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.fullName.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query)
      )
    }

    if (teamFilter !== 'all') {
      result = result.filter(p => p.team?.id === teamFilter)
    }

    if (positionFilter !== 'all') {
      result = result.filter(p => p.position === positionFilter)
    }

    setFilteredPlayers(result)
  }, [searchQuery, teamFilter, positionFilter, players])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get unique teams for filter
  const teams = Array.from(new Set(players.filter(p => p.team).map(p => JSON.stringify(p.team))))
    .map(t => JSON.parse(t))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-3 py-3 lg:px-4 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary lg:h-10 lg:w-10">
                <Trophy className="h-4 w-4 text-primary-foreground lg:h-6 lg:w-6" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground lg:text-xl">Cricket Fiesta</h1>
                <p className="text-[10px] text-muted-foreground lg:text-xs">SLT Trainees 2026</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm gap-1.5">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/oc-members">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm gap-1.5">
                  <Users className="h-4 w-4" />
                  OC Members
                </Button>
              </Link>
              <Link href="/all-players">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm gap-1.5 bg-accent">
                  <UserCircle className="h-4 w-4" />
                  Players
                </Button>
              </Link>
            </nav>
            
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Mobile Navigation */}
              <div className="flex md:hidden items-center gap-1">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-xs px-2">
                    <Home className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/oc-members">
                  <Button variant="ghost" size="sm" className="text-xs px-2">
                    <Users className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm">Login</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" className="text-xs lg:text-sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-accent to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(22,163,74,0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-3 py-8 lg:px-4 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary lg:mb-6 lg:gap-2 lg:px-4 lg:py-2 lg:text-sm">
              <UserCircle className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Meet The Players</span>
            </div>
            <h2 className="mb-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:mb-6 lg:text-5xl">
              Cricket Players
            </h2>
            <p className="text-balance text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-xl">
              The talented cricketers participating in Cricket Fiesta 2026. Find your teammates and opponents!
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-3 pt-6 lg:px-4 lg:pt-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team: any) => (
                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="BATSMAN">Batsman</SelectItem>
              <SelectItem value="BOWLER">Bowler</SelectItem>
              <SelectItem value="ALL_ROUNDER">All-Rounder</SelectItem>
              <SelectItem value="WICKET_KEEPER">Wicket Keeper</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Players Grid */}
      <section className="container mx-auto px-3 py-6 lg:px-4 lg:py-12">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6 text-center">
                  <Skeleton className="mx-auto h-20 w-20 rounded-full" />
                  <Skeleton className="mx-auto mt-4 h-5 w-32" />
                  <Skeleton className="mx-auto mt-2 h-4 w-24" />
                  <Skeleton className="mx-auto mt-3 h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <UserCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No Players Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {players.length === 0 
                ? "Players will appear here once they register."
                : "No players match your search criteria."}
            </p>
            {players.length > 0 && (
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => {
                  setSearchQuery('')
                  setTeamFilter('all')
                  setPositionFilter('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 lg:mb-8 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{filteredPlayers.length}</span> 
                {filteredPlayers.length !== players.length && ` of ${players.length}`} players ready to compete
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {filteredPlayers.map((player) => (
                <Card key={player.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="p-5 text-center">
                    <Avatar className="mx-auto h-20 w-20 ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all">
                      <AvatarImage src={player.profileImage || undefined} alt={player.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {getInitials(player.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-3 font-semibold text-foreground">{player.fullName}</h3>
                    <p className="text-xs text-muted-foreground">{player.department}</p>
                    
                    {player.projectName && (
                      <div className="mt-1.5 flex items-center justify-center gap-1 text-xs text-primary/80">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate max-w-[140px]">{player.projectName}</span>
                      </div>
                    )}
                    
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      <Badge variant="outline" className="text-xs">
                        {positionLabels[player.position] || player.position}
                      </Badge>
                      {player.team && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                          {player.team.name}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <Badge className={`text-xs ${experienceColors[player.experienceLevel] || 'bg-gray-100 text-gray-700'}`}>
                        {player.experienceLevel}
                      </Badge>
                    </div>
                    
                    {(player.battingStyle || player.bowlingStyle) && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {player.battingStyle && <span>🏏 {player.battingStyle}</span>}
                        {player.battingStyle && player.bowlingStyle && <span> • </span>}
                        {player.bowlingStyle && <span>🎯 {player.bowlingStyle}</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 lg:py-8">
        <div className="container mx-auto px-3 text-center text-xs text-muted-foreground lg:px-4 lg:text-sm">
          <p>© 2025 SLT Trainees Cricket Fiesta. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
