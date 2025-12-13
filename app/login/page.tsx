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
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { Trophy, Loader2, User, ShieldCheck, ArrowLeft, Mail, KeyRound, Clock, CheckCircle2 } from "lucide-react"

type LoginStep = 'email' | 'otp' | 'pending';

export default function LoginPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // OTP states
  const [loginStep, setLoginStep] = useState<LoginStep>('email')
  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      router.push('/dashboard')
    }
  }, [router])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (loginStep === 'otp') {
      setCanResend(true)
    }
  }, [countdown, loginStep])

  // Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setLoginStep('otp')
      setCountdown(60) // 60 seconds before resend
      setCanResend(false)
      setSuccess('OTP sent to your email!')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP
  const handleVerifyOTP = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp })
      });

      const data = await response.json();

      // Check if login requires approval (first-time login)
      if (response.status === 202 && data.data?.requiresApproval) {
        setLoginStep('pending')
        setSuccess('')
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // Store token and user (persistent login)
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setOtp("")
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return
    
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setCountdown(60)
      setCanResend(false)
      setOtp("")
      setSuccess('New OTP sent to your email!')
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  }

  // Go back to email step
  const handleBackToEmail = () => {
    setLoginStep('email')
    setOtp("")
    setError("")
    setSuccess("")
    setCountdown(0)
    setCanResend(false)
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

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && loginStep === 'otp') {
      handleVerifyOTP()
    }
  }, [otp])

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

            {success && (
              <Alert className="mb-3 lg:mb-4 border-green-500 bg-green-50 text-green-700">
                <AlertDescription className="text-xs lg:text-sm">{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 mb-3 lg:mb-4">
                <TabsTrigger value="user" className="gap-1.5 px-2 py-1.5 text-xs lg:gap-2 lg:px-4 lg:py-2 lg:text-sm" disabled={loginStep === 'otp' || loginStep === 'pending'}>
                  <User className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Trainee / Player</span>
                  <span className="sm:hidden">Trainee</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-1.5 px-2 py-1.5 text-xs lg:gap-2 lg:px-4 lg:py-2 lg:text-sm" disabled={loginStep === 'otp' || loginStep === 'pending'}>
                  <ShieldCheck className="h-3 w-3 lg:h-4 lg:w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* User Login Tab */}
              <TabsContent value="user">
                {loginStep === 'email' ? (
                  // Step 1: Enter Email
                  <form onSubmit={handleRequestOTP} className="space-y-3 lg:space-y-4">
                    <div className="space-y-1.5 lg:space-y-2">
                      <Label htmlFor="user-email" className="text-xs lg:text-sm flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        Email Address
                      </Label>
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
                        Use the email you registered with in the Google Form
                      </p>
                    </div>

                    <Button type="submit" className="w-full text-xs lg:text-sm" disabled={loading} size="sm">
                      {loading ? (
                        <>
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin lg:mr-2 lg:h-4 lg:w-4" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-1.5 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </form>
                ) : loginStep === 'pending' ? (
                  // Step 3: Pending Approval
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
                      <p className="font-medium text-sm">{userEmail}</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-muted-foreground lg:text-xs">
                        You will receive an email once your request is approved.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBackToEmail}
                        className="text-xs"
                      >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Try another email
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Step 2: Enter OTP
                  <form onSubmit={handleVerifyOTP} className="space-y-4 lg:space-y-5">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <KeyRound className="h-4 w-4" />
                        <span>Enter the OTP sent to</span>
                      </div>
                      <p className="font-medium text-sm">{userEmail}</p>
                    </div>

                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        disabled={loading}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <div className="text-center space-y-3">
                      <Button type="submit" className="w-full text-xs lg:text-sm" disabled={loading || otp.length !== 6} size="sm">
                        {loading ? (
                          <>
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin lg:mr-2 lg:h-4 lg:w-4" />
                            Verifying...
                          </>
                        ) : (
                          "Verify & Sign In"
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-xs">
                        {countdown > 0 ? (
                          <span className="text-muted-foreground">
                            Resend OTP in {countdown}s
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={handleResendOTP}
                            disabled={loading || !canResend}
                            className="h-auto p-0 text-xs"
                          >
                            Resend OTP
                          </Button>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToEmail}
                        className="text-xs text-muted-foreground"
                      >
                        <ArrowLeft className="mr-1 h-3 w-3" />
                        Change email
                      </Button>
                    </div>
                  </form>
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
          Players & OC Members: Enter your registered email to receive an OTP
          <br />
          Organizers: Login with your approved admin account
        </p>
      </div>
    </div>
  )
}
