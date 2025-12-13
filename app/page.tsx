import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, UtensilsCrossed, CalendarDays, Award, BarChart3, Home } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"
import { StatsSection } from "@/components/stats-section"

// Event starts on January 10th, 2026 at 9:00 AM Sri Lanka Time (UTC+5:30)
const EVENT_DATE = new Date("2026-01-10T09:00:00+05:30")

export default function HomePage() {
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
                <p className="text-[10px] text-muted-foreground lg:text-xs">SLT Trainees 2024</p>
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
            </nav>
            
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Mobile Navigation */}
              <div className="flex md:hidden items-center gap-1">
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
        <div className="container relative mx-auto px-3 py-12 lg:px-4 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary lg:mb-6 lg:gap-2 lg:px-4 lg:py-2 lg:text-sm">
              <CalendarDays className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Event Day: January 10, 2026 • 9:00 AM</span>
            </div>
            <h2 className="mb-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:mb-6 lg:text-5xl xl:text-6xl">
              Welcome to the SLT Trainees Cricket Fiesta
            </h2>
            <p className="mb-6 text-balance text-sm leading-relaxed text-muted-foreground sm:text-base lg:mb-8 lg:text-xl">
              Comprehensive event management system for 200+ participants. Handle registrations, food distribution,
              match scheduling, and live scoring all in one place.
            </p>
            
            {/* Countdown Timer */}
            <div className="mb-6 lg:mb-8">
              <CountdownTimer targetDate={EVENT_DATE} eventName="Cricket Fiesta 2026" />
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-4">
              <a href="https://linktr.ee/CricketFiestaRegistrationLinks" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-1.5 text-xs lg:gap-2 lg:text-sm">
                  <Users className="h-4 w-4 lg:h-5 lg:w-5" />
                  Register Now
                </Button>
              </a>
              <Link href="/login">
                <Button size="sm" variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm">
                  <Trophy className="h-4 w-4 lg:h-5 lg:w-5" />
                  Live Scores
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-3 py-8 lg:px-4 lg:py-16">
        <div className="mb-8 text-center lg:mb-12">
          <h3 className="mb-2 text-xl font-bold text-foreground lg:mb-3 lg:text-3xl">Event Management Features</h3>
          <p className="text-balance text-sm text-muted-foreground lg:text-lg">
            Everything you need to run a successful cricket tournament
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {/* Player Management */}
          <Card className="group hover:border-primary">
            <CardHeader className="p-4 lg:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary lg:mb-4 lg:h-12 lg:w-12">
                <Users className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <CardTitle className="text-base lg:text-xl">Player Management</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Register players, assign teams, track attendance with QR codes, and manage player statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              <Link href="/players">
                <Button variant="link" className="p-0 text-xs lg:text-sm">
                  View Players →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Food Distribution */}
          <Card className="group hover:border-primary">
            <CardHeader className="p-4 lg:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary lg:mb-4 lg:h-12 lg:w-12">
                <UtensilsCrossed className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <CardTitle className="text-base lg:text-xl">Food Distribution</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                QR code-based meal distribution system for 200+ participants with real-time tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              <Link href="/food">
                <Button variant="link" className="p-0 text-xs lg:text-sm">
                  Manage Food →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Match Management */}
          <Card className="group hover:border-primary">
            <CardHeader className="p-4 lg:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary lg:mb-4 lg:h-12 lg:w-12">
                <Trophy className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <CardTitle className="text-base lg:text-xl">Match Management</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Schedule matches, live scoring, ball-by-ball commentary, and tournament fixtures
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              <Link href="/matches">
                <Button variant="link" className="p-0 text-xs lg:text-sm">
                  View Matches →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Committee Management */}
          <Card className="group hover:border-primary">
            <CardHeader className="p-4 lg:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary lg:mb-4 lg:h-12 lg:w-12">
                <Users className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <CardTitle className="text-base lg:text-xl">Organizing Committee</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Manage volunteers, assign roles, track availability, and coordinate event tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              <Link href="/committee">
                <Button variant="link" className="p-0 text-xs lg:text-sm">
                  View Committee →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <Card className="group hover:border-primary">
            <CardHeader className="p-4 lg:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary lg:mb-4 lg:h-12 lg:w-12">
                <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <CardTitle className="text-base lg:text-xl">Analytics Dashboard</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Real-time statistics, attendance tracking, food distribution progress, and match results
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              <Link href="/dashboard">
                <Button variant="link" className="p-0 text-xs lg:text-sm">
                  View Dashboard →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Awards & Recognition */}
          <Card className="group hover:border-primary">
            <CardHeader className="p-4 lg:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary lg:mb-4 lg:h-12 lg:w-12">
                <Award className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
              <CardTitle className="text-base lg:text-xl">Awards & Recognition</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Track winners, generate certificates, and manage award categories for the tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              <Link href="/awards">
                <Button variant="link" className="p-0 text-xs lg:text-sm">
                  View Awards →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section - Real-time data from database */}
      <StatsSection />

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 lg:py-8">
        <div className="container mx-auto px-3 text-center text-xs text-muted-foreground lg:px-4 lg:text-sm">
          <p>© 2025 SLT Trainees Cricket Fiesta. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
