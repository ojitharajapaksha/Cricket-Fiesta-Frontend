"use client"

import { useState } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
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
    <ResponsiveLayout>
      <div className="container mx-auto max-w-3xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <Link href="/food">
            <Button variant="ghost" className="mb-3 gap-1.5 text-xs lg:mb-4 lg:gap-2 lg:text-sm" size="sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Food
            </Button>
          </Link>
          <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">QR Code Scanner</h1>
          <p className="text-xs text-muted-foreground lg:text-base">Scan participant QR codes for meal distribution</p>
        </div>

        {/* Scanner Card */}
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-base lg:text-xl">Scan QR Code</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Point your camera at the participant's QR code</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <div className="space-y-3 lg:space-y-4">
              {/* Camera View */}
              <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
                {scanning ? (
                  <div className="text-center">
                    <ScanLine className="mx-auto mb-3 h-12 w-12 animate-pulse text-primary lg:mb-4 lg:h-16 lg:w-16" />
                    <p className="text-xs text-muted-foreground lg:text-sm">Scanning...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <ScanLine className="mx-auto mb-3 h-12 w-12 text-muted-foreground lg:mb-4 lg:h-16 lg:w-16" />
                    <p className="mb-1.5 text-xs font-medium text-foreground lg:mb-2 lg:text-sm">Ready to scan</p>
                    <p className="text-[10px] text-muted-foreground lg:text-xs">Camera will activate when you start scanning</p>
                  </div>
                )}
              </div>

              <Button onClick={handleStartScan} disabled={scanning} className="w-full gap-1.5 text-xs lg:gap-2 lg:text-sm" size="sm">
                <ScanLine className="h-3 w-3 lg:h-4 lg:w-4" />
                {scanning ? "Scanning..." : "Start Scanning"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Search */}
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-base lg:text-xl">Manual Search</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Search by Trainee ID if QR code is not available</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Trainee ID..."
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                className="h-8 text-xs lg:h-10 lg:text-sm"
              />
              <Button onClick={handleManualSearch} disabled={searching} className="gap-1.5 text-xs lg:gap-2 lg:text-sm" size="sm">
                {searching ? <Loader2 className="h-3 w-3 animate-spin lg:h-4 lg:w-4" /> : <Search className="h-3 w-3 lg:h-4 lg:w-4" />}
                <span className="hidden sm:inline">{searching ? "Searching..." : "Search"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scan Result */}
        {scanResult && (
          <Card className="mb-4 lg:mb-6">
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                {scanResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 lg:h-5 lg:w-5" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive lg:h-5 lg:w-5" />
                )}
                {scanResult.success ? "Participant Found" : "Error"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3 pt-0 lg:space-y-4 lg:p-6 lg:pt-0">
              {scanResult.success && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-2.5 lg:gap-4 lg:p-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground lg:text-xs">Name</p>
                      <p className="text-xs font-medium lg:text-base">{scanResult.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground lg:text-xs">Trainee ID</p>
                      <p className="text-xs font-medium lg:text-base">{scanResult.traineeId}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted-foreground lg:text-xs">Food Preference</p>
                      <p className="text-xs font-medium lg:text-base">{scanResult.preference}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-green-500/10 p-2.5 text-green-500 lg:p-4">
                    <p className="text-xs font-medium lg:text-sm">{scanResult.message}</p>
                  </div>

                  <div className="flex gap-2">
                    {!scanResult.alreadyCollected && (
                      <Button onClick={handleConfirm} className="flex-1 text-xs lg:text-sm" size="sm">
                        Confirm
                      </Button>
                    )}
                    <Button onClick={() => setScanResult(null)} variant="outline" size="sm" className={`${scanResult.alreadyCollected ? 'w-full' : 'flex-1'} bg-transparent text-xs lg:text-sm`}>
                      {scanResult.alreadyCollected ? "Search Another" : "Cancel"}
                    </Button>
                  </div>
                </div>
              )}

              {!scanResult.success && (
                <div className="rounded-lg bg-destructive/10 p-2.5 text-destructive lg:p-4">
                  <p className="text-xs font-medium lg:text-sm">{scanResult.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-base lg:text-xl">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <ul className="space-y-1.5 text-xs text-muted-foreground lg:space-y-2 lg:text-sm">
              <li>1. Ask participant to show their QR code</li>
              <li>2. Click "Start Scanning" and point camera at QR code</li>
              <li>3. Verify participant details on screen</li>
              <li>4. Click "Confirm" to mark meal as distributed</li>
              <li>5. For lost QR codes, use manual search</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}
