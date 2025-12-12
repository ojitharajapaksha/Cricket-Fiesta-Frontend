"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ScanLine, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [searching, setSearching] = useState(false)
  const [manualId, setManualId] = useState("")
  const [scanResult, setScanResult] = useState<{
    success: boolean
    id?: string
    name: string
    traineeId: string
    preference: string
    message: string
    alreadyCollected?: boolean
  } | null>(null)

  const handleStartScan = () => {
    setScanning(true)
    console.log("[v0] Starting QR scanner...")
    // TODO: Implement QR code scanner using html5-qrcode library

    // Simulated scan result
    setTimeout(() => {
      setScanResult({
        success: true,
        name: "Kasun Perera",
        traineeId: "TRN001",
        preference: "Non-Vegetarian",
        message: "Meal collected successfully!",
      })
      setScanning(false)
    }, 2000)
  }

  const handleManualSearch = async () => {
    if (!manualId.trim()) {
      toast.error("Please enter a Trainee ID")
      return
    }
    
    setSearching(true)
    setScanResult(null)
    
    try {
      const token = localStorage.getItem("token")
      
      // First, search for the registration
      const response = await fetch(`${API_URL}/api/food/registrations?traineeId=${encodeURIComponent(manualId.trim())}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!response.ok) throw new Error("Failed to search")
      
      const data = await response.json()
      const registrations = data.data || []
      
      // Find exact match
      const registration = registrations.find((r: any) => 
        r.traineeId.toLowerCase() === manualId.trim().toLowerCase()
      )
      
      if (!registration) {
        setScanResult({
          success: false,
          name: "",
          traineeId: manualId,
          preference: "",
          message: "No registration found with this Trainee ID",
        })
        return
      }
      
      if (registration.foodCollected) {
        setScanResult({
          success: true,
          id: registration.id,
          name: registration.fullName,
          traineeId: registration.traineeId,
          preference: registration.foodPreference === "VEGETARIAN" ? "Vegetarian" : "Non-Vegetarian",
          message: `Food already collected at ${new Date(registration.foodCollectedAt).toLocaleTimeString()}`,
          alreadyCollected: true,
        })
        return
      }
      
      setScanResult({
        success: true,
        id: registration.id,
        name: registration.fullName,
        traineeId: registration.traineeId,
        preference: registration.foodPreference === "VEGETARIAN" ? "Vegetarian" : "Non-Vegetarian",
        message: "Participant found. Click confirm to mark as collected.",
        alreadyCollected: false,
      })
    } catch (error: any) {
      console.error("Search error:", error)
      toast.error("Failed to search")
      setScanResult({
        success: false,
        name: "",
        traineeId: manualId,
        preference: "",
        message: error.message || "Search failed",
      })
    } finally {
      setSearching(false)
    }
  }

  const handleConfirm = async () => {
    if (!scanResult?.id) return
    
    try {
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${API_URL}/api/food/registrations/${scanResult.id}/collect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to mark as collected")
      }
      
      toast.success("Food marked as collected!")
      setScanResult({
        ...scanResult,
        message: "Meal marked as collected!",
        alreadyCollected: true,
      })
      setManualId("")
    } catch (error: any) {
      console.error("Confirm error:", error)
      toast.error(error.message || "Failed to mark as collected")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/food">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Food Distribution
              </Button>
            </Link>
            <h1 className="mb-2 text-3xl font-bold text-foreground">QR Code Scanner</h1>
            <p className="text-muted-foreground">Scan participant QR codes for meal distribution</p>
          </div>

          {/* Scanner Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>Point your camera at the participant's QR code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Camera View */}
                <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
                  {scanning ? (
                    <div className="text-center">
                      <ScanLine className="mx-auto mb-4 h-16 w-16 animate-pulse text-primary" />
                      <p className="text-sm text-muted-foreground">Scanning...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ScanLine className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                      <p className="mb-2 text-sm font-medium text-foreground">Ready to scan</p>
                      <p className="text-xs text-muted-foreground">Camera will activate when you start scanning</p>
                    </div>
                  )}
                </div>

                <Button onClick={handleStartScan} disabled={scanning} className="w-full gap-2">
                  <ScanLine className="h-4 w-4" />
                  {scanning ? "Scanning..." : "Start Scanning"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Manual Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Manual Search</CardTitle>
              <CardDescription>Search by Trainee ID if QR code is not available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Trainee ID (e.g., TRN001)"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                />
                <Button onClick={handleManualSearch} disabled={searching} className="gap-2">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scan Result */}
          {scanResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {scanResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  {scanResult.success ? "Participant Found" : "Error"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanResult.success && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{scanResult.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trainee ID</p>
                        <p className="font-medium">{scanResult.traineeId}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Food Preference</p>
                        <p className="font-medium">{scanResult.preference}</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-green-500/10 p-4 text-green-500">
                      <p className="text-sm font-medium">{scanResult.message}</p>
                    </div>

                    <div className="flex gap-2">
                      {!scanResult.alreadyCollected && (
                        <Button onClick={handleConfirm} className="flex-1">
                          Confirm Collection
                        </Button>
                      )}
                      <Button onClick={() => setScanResult(null)} variant="outline" className={`${scanResult.alreadyCollected ? 'w-full' : 'flex-1'} bg-transparent`}>
                        {scanResult.alreadyCollected ? "Search Another" : "Cancel"}
                      </Button>
                    </div>
                  </div>
                )}

                {!scanResult.success && (
                  <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
                    <p className="text-sm font-medium">{scanResult.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1. Ask participant to show their QR code</li>
                <li>2. Click "Start Scanning" and point camera at QR code</li>
                <li>3. Verify participant details on screen</li>
                <li>4. Click "Confirm Collection" to mark meal as distributed</li>
                <li>5. For lost QR codes, use manual search with Trainee ID</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
