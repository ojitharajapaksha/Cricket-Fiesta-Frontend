"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Loader2, User, ShieldCheck, Clock, CheckCircle2 } from "lucide-react"
import { auth, googleProvider, signInWithPopup, signOut } from "@/lib/firebase"
import { usePublicRoute } from "@/hooks/use-auth"

type LoginStatus = 'idle' | 'loading' | 'pending' | 'success' | 'error';

export default function LoginPage() {
  const router = useRouter()
  // Check if already logged in - redirect to dashboard if so
  const { loading: authLoading, isAuthenticated } = usePublicRoute()
  
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Google Sign-In states
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle')
  const [pendingEmail, setPendingEmail] = useState("")
  const [pendingName, setPendingName] = useState("")

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")
    setSuccess("")
    setLoginStatus('loading')

    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Get the ID token
      const idToken = await user.getIdToken()

      // Send to backend for verification
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();

      // Check if login requires approval (first-time login)
      if (response.status === 202 && data.data?.requiresApproval) {
        setPendingEmail(data.data.email)
        setPendingName(data.data.name)
        setLoginStatus('pending')
        // Sign out from Firebase since they're not approved yet
        await signOut(auth)
        return
      }

      if (!response.ok) {
        // Sign out from Firebase on error
        await signOut(auth)
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user (persistent login)
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setLoginStatus('success')
      setSuccess('Login successful! Redirecting...')

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 500)
    } catch (err: any) {
      console.error('Google Sign-In error:', err)
      setLoginStatus('error')
      
      // Handle Firebase errors
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.')
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up blocked. Please enable pop-ups for this site.')
      } else {
        setError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  // Reset to initial state
  const handleTryAgain = async () => {
    try {
      await signOut(auth)
    } catch (e) {
      // Ignore sign out errors
    }
    setLoginStatus('idle')
    setError("")
    setSuccess("")
    setPendingEmail("")
    setPendingName("")
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
          <div className="mx-auto mb-3 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Cricket Fiesta Logo"
              width={96}
              height={96}
              className="h-20 w-20 lg:h-24 lg:w-24 object-contain"
            />
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

            {success && (
              <Alert className="mb-3 lg:mb-4 border-green-500 bg-green-50 text-green-700">
                <AlertDescription className="text-xs lg:text-sm">{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 mb-3 lg:mb-4">
                <TabsTrigger value="user" className="gap-1.5 px-2 py-1.5 text-xs lg:gap-2 lg:px-4 lg:py-2 lg:text-sm" disabled={loginStatus === 'pending'}>
                  <User className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Trainee / Player</span>
                  <span className="sm:hidden">Trainee</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-1.5 px-2 py-1.5 text-xs lg:gap-2 lg:px-4 lg:py-2 lg:text-sm" disabled={loginStatus === 'pending'}>
                  <ShieldCheck className="h-3 w-3 lg:h-4 lg:w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* User Login Tab - Google Sign-In */}
              <TabsContent value="user">
                {loginStatus === 'pending' ? (
                  // Pending Approval State
                  <div className="space-y-4 lg:space-y-5 text-center py-4">
                    <div className="flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 lg:h-20 lg:w-20">
                        <Clock className="h-8 w-8 text-orange-500 lg:h-10 lg:w-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground lg:text-xl">Pending Approval</h3>
                      <p className="text-xs text-muted-foreground lg:text-sm">
                        Your first-time login request has been submitted.
                      </p>
                      <p className="text-xs text-muted-foreground lg:text-sm">
                        Please wait for a Super Admin to approve your access.
                      </p>
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-3 lg:p-4">
                      <p className="text-xs text-muted-foreground lg:text-sm mb-1">Login request for:</p>
                      <p className="font-medium text-sm">{pendingName}</p>
                      <p className="text-xs text-muted-foreground">{pendingEmail}</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-muted-foreground lg:text-xs">
                        Try signing in again after your request is approved.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleTryAgain}
                        className="text-xs"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Google Sign-In Button
                  <div className="space-y-4 lg:space-y-5">
                    <div className="text-center space-y-2 py-2">
                      <p className="text-xs text-muted-foreground lg:text-sm">
                        Sign in with the Google account you used to register
                      </p>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-11 lg:h-12 text-sm lg:text-base font-medium" 
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          For Players, OC Members & Trainees
                        </span>
                      </div>
                    </div>

                    <p className="text-center text-[10px] text-muted-foreground lg:text-xs">
                      Use the same Google account you used to fill out the registration form.
                      First-time login requires admin approval.
                    </p>
                  </div>
                )}
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
          Players, OC Members & Trainees: Sign in with your Google account
          <br />
          Super Admin: Login with your admin credentials
        </p>
      </div>
    </div>
  )
}
