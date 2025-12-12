"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Loader2, User, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // User Login (Gmail only)
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect to user dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Admin Login (Email + Password)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: adminEmail, 
          password: adminPassword 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-3 lg:p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 text-center lg:mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary lg:mb-4 lg:h-16 lg:w-16 lg:rounded-2xl">
            <Trophy className="h-6 w-6 text-primary-foreground lg:h-8 lg:w-8" />
          </div>
          <h1 className="text-xl font-bold text-foreground lg:text-2xl">Cricket Fiesta</h1>
          <p className="text-xs text-muted-foreground lg:text-sm">Event Management System</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="p-4 pb-2 lg:p-6 lg:pb-4">
            <CardTitle className="text-lg lg:text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 lg:p-6 lg:pt-2">
            {error && (
              <Alert variant="destructive" className="mb-3 lg:mb-4">
                <AlertDescription className="text-xs lg:text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 mb-3 lg:mb-4">
                <TabsTrigger value="user" className="gap-1.5 px-2 py-1.5 text-xs lg:gap-2 lg:px-4 lg:py-2 lg:text-sm">
                  <User className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Trainee / Player</span>
                  <span className="sm:hidden">Trainee</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-1.5 px-2 py-1.5 text-xs lg:gap-2 lg:px-4 lg:py-2 lg:text-sm">
                  <ShieldCheck className="h-3 w-3 lg:h-4 lg:w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* User Login Tab */}
              <TabsContent value="user">
                <form onSubmit={handleUserLogin} className="space-y-3 lg:space-y-4">
                  <div className="space-y-1.5 lg:space-y-2">
                    <Label htmlFor="user-email" className="text-xs lg:text-sm">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="your.email@gmail.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-9 text-sm lg:h-10"
                    />
                    <p className="text-[10px] text-muted-foreground lg:text-xs">
                      Use the Gmail you registered with in the Google Form
                    </p>
                  </div>

                  <Button type="submit" className="w-full text-xs lg:text-sm" disabled={loading} size="sm">
                    {loading ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin lg:mr-2 lg:h-4 lg:w-4" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In as Trainee"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Login Tab */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-3 lg:space-y-4">
                  <div className="space-y-1.5 lg:space-y-2">
                    <Label htmlFor="admin-email" className="text-xs lg:text-sm">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-9 text-sm lg:h-10"
                    />
                  </div>

                  <div className="space-y-1.5 lg:space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password" className="text-xs lg:text-sm">Password</Label>
                    </div>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-9 text-sm lg:h-10"
                    />
                  </div>

                  <Button type="submit" className="w-full text-xs lg:text-sm" disabled={loading} size="sm">
                    {loading ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin lg:mr-2 lg:h-4 lg:w-4" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In as Admin"
                    )}
                  </Button>

                  <div className="text-center text-xs lg:text-sm">
                    <span className="text-muted-foreground">New organizer? </span>
                    <Link href="/signup" className="text-primary hover:underline font-medium">
                      Sign up here
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="mt-4 text-center text-[10px] text-muted-foreground lg:mt-6 lg:text-xs">
          Players: Use your registered Gmail to view match schedules and food status
          <br />
          Organizers: Login with your approved admin account
        </p>
      </div>
    </div>
  )
}
