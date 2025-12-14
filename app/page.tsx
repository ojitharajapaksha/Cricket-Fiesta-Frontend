import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, UtensilsCrossed, CalendarDays, Award, BarChart3, Home, UserCircle } from "lucide-react"
import { StatsSection } from "@/components/stats-section"
import { AnimatedHero } from "@/components/animated-hero"
import { AnnouncementPopup } from "@/components/announcement-popup"

// Event starts on January 10th, 2026 at 9:00 AM Sri Lanka Time (UTC+5:30)
const EVENT_DATE = new Date("2026-01-10T09:00:00+05:30")

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Popup */}
      <AnnouncementPopup />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-3 py-3 lg:px-4 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <Image
                src="/logo.png"
                alt="Cricket Fiesta Logo"
                width={40}
                height={40}
                className="h-8 w-8 lg:h-10 lg:w-10 object-contain"
              />
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
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm gap-1.5">
                  <UserCircle className="h-4 w-4" />
                  Players
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
                <Link href="/all-players">
                  <Button variant="ghost" size="sm" className="text-xs px-2">
                    <UserCircle className="h-4 w-4" />
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

      {/* Animated Hero Section */}
      <AnimatedHero eventDate={EVENT_DATE} />

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
