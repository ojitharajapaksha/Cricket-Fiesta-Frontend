"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Users, Home, ArrowLeft, UserCircle } from "lucide-react"

interface CommitteeMember {
  id: string
  fullName: string
  role: string | null
  imageUrl: string | null
  department: string
}

export default function OCMembersPage() {
  const [members, setMembers] = useState<CommitteeMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/committee/public`)
        const data = await response.json()
        if (data.status === 'success') {
          setMembers(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch Organizing Committee members:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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
                <Button variant="ghost" size="sm" className="text-xs lg:text-sm gap-1.5 bg-accent">
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
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-xs px-2">
                    <Home className="h-4 w-4" />
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

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-accent to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(22,163,74,0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-3 py-8 lg:px-4 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary lg:mb-6 lg:gap-2 lg:px-4 lg:py-2 lg:text-sm">
              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
              <span>Meet Our Team</span>
            </div>
            <h2 className="mb-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:mb-6 lg:text-5xl">
              Organizing Committee
            </h2>
            <p className="text-balance text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-xl">
              The dedicated team behind Cricket Fiesta 2026. Our committee members work tirelessly to make this event a success.
            </p>
          </div>
        </div>
      </section>

      {/* OC Members Grid */}
      <section className="container mx-auto px-3 py-8 lg:px-4 lg:py-16">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6 text-center">
                  <Skeleton className="mx-auto h-24 w-24 rounded-full" />
                  <Skeleton className="mx-auto mt-4 h-5 w-32" />
                  <Skeleton className="mx-auto mt-2 h-4 w-24" />
                  <Skeleton className="mx-auto mt-3 h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No Organizing Committee Members Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Committee members will appear here once they are approved.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 lg:mb-8 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{members.length}</span> dedicated members making Cricket Fiesta possible
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {members.map((member) => (
                <Card key={member.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="p-6 text-center">
                    <Avatar className="mx-auto h-24 w-24 ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all">
                      <AvatarImage src={member.imageUrl || undefined} alt={member.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                        {getInitials(member.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-4 font-semibold text-foreground text-lg">{member.fullName}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{member.department}</p>
                    {member.role && (
                      <Badge variant="secondary" className="mt-3">
                        {member.role}
                      </Badge>
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
        <div className="container mx-auto px-3 text-center text-xs text-muted-foreground lg:px-4 lg:text-sm flex flex-col items-center gap-1">
          <p>© 2025 SLT Trainees Cricket Fiesta | All rights reserved</p>
          <p>
            Design &amp; Developed by{' '}
            <a
              href="https://ojitharajapaksha.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              Ojitha Rajapaksha
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
