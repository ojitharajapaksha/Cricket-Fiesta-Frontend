import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, UtensilsCrossed, CalendarDays, Award, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Cricket Fiesta</h1>
                <p className="text-xs text-muted-foreground">SLT Trainees 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-accent to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(22,163,74,0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <CalendarDays className="h-4 w-4" />
              <span>Event Day: March 15, 2024</span>
            </div>
            <h2 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Welcome to the SLT Trainees Cricket Fiesta
            </h2>
            <p className="mb-8 text-balance text-xl leading-relaxed text-muted-foreground">
              Comprehensive event management system for 200+ participants. Handle registrations, food distribution,
              match scheduling, and live scoring all in one place.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  <Users className="h-5 w-5" />
                  Register Now
                </Button>
              </Link>
              <Link href="/live-scores">
                <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                  <Trophy className="h-5 w-5" />
                  Live Scores
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h3 className="mb-3 text-3xl font-bold text-foreground">Event Management Features</h3>
          <p className="text-balance text-lg text-muted-foreground">
            Everything you need to run a successful cricket tournament
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Player Management */}
          <Card className="group hover:border-primary">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Player Management</CardTitle>
              <CardDescription>
                Register players, assign teams, track attendance with QR codes, and manage player statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/players">
                <Button variant="link" className="p-0">
                  View Players →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Food Distribution */}
          <Card className="group hover:border-primary">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <CardTitle>Food Distribution</CardTitle>
              <CardDescription>
                QR code-based meal distribution system for 200+ participants with real-time tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/food">
                <Button variant="link" className="p-0">
                  Manage Food →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Match Management */}
          <Card className="group hover:border-primary">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Trophy className="h-6 w-6" />
              </div>
              <CardTitle>Match Management</CardTitle>
              <CardDescription>
                Schedule matches, live scoring, ball-by-ball commentary, and tournament fixtures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/matches">
                <Button variant="link" className="p-0">
                  View Matches →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Committee Management */}
          <Card className="group hover:border-primary">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Organizing Committee</CardTitle>
              <CardDescription>
                Manage volunteers, assign roles, track availability, and coordinate event tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/committee">
                <Button variant="link" className="p-0">
                  View Committee →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <Card className="group hover:border-primary">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Real-time statistics, attendance tracking, food distribution progress, and match results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="link" className="p-0">
                  View Dashboard →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Awards & Recognition */}
          <Card className="group hover:border-primary">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Award className="h-6 w-6" />
              </div>
              <CardTitle>Awards & Recognition</CardTitle>
              <CardDescription>
                Track winners, generate certificates, and manage award categories for the tournament
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/awards">
                <Button variant="link" className="p-0">
                  View Awards →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-accent py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">200+</div>
              <div className="text-sm text-muted-foreground">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">16</div>
              <div className="text-sm text-muted-foreground">Cricket Teams</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">24</div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">10</div>
              <div className="text-sm text-muted-foreground">Committee Teams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 SLT Trainees Cricket Fiesta. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
