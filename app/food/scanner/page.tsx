"use client"

import { useState, useEffect, useRef } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, CheckCircle2, XCircle, Loader2, Clock, UtensilsCrossed, Camera, CameraOff, RefreshCw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface UserData {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  firstName?: string;
  lastName?: string;
}

interface FoodRegistration {
  id: string;
  traineeId: string;
  fullName: string;
  email: string;
  department: string;
  foodPreference: string;
  foodCollected: boolean;
  foodCollectedAt: string | null;
  qrCode: string;
}

export default function ScannerPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [playerFoodStatus, setPlayerFoodStatus] = useState<FoodRegistration | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [searching, setSearching] = useState(false)
  const [manualId, setManualId] = useState("")
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<{
    success: boolean
    id?: string
    name: string
    traineeId: string
    preference: string
    message: string
    alreadyCollected?: boolean
  } | null>(null)

  const html5QrCodeRef = useRef<any>(null)
  const scannerContainerId = "qr-reader"

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      
      if (userData.role === 'USER') {
        fetchPlayerFoodStatus(userData.email)
      } else {
        setLoadingStatus(false)
      }
    } else {
      setLoadingStatus(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const fetchPlayerFoodStatus = async (email: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/food/registrations?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        const registrations = data.data || []
        const myRegistration = registrations.find((r: FoodRegistration) => 
          r.email?.toLowerCase() === email.toLowerCase()
        )
        setPlayerFoodStatus(myRegistration || null)
      }
    } catch (error) {
      console.error("Error fetching food status:", error)
    } finally {
      setLoadingStatus(false)
    }
  }

  // Player Food Status View
  if (user?.role === 'USER') {
    if (loadingStatus) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    return (
      <ResponsiveLayout>
        <div className="container mx-auto max-w-2xl px-3 py-4 lg:p-6">
          <div className="mb-4 lg:mb-6">
            <h1 className="mb-1 text-lg font-bold text-foreground lg:mb-2 lg:text-3xl">Food Status</h1>
            <p className="text-xs text-muted-foreground lg:text-base">Check your meal registration and collection status</p>
          </div>

          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                <UtensilsCrossed className="h-4 w-4 lg:h-5 lg:w-5" />
                Your Meal Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
              {playerFoodStatus ? (
                <div className="space-y-3 lg:space-y-4">
                  <div className={`flex items-center gap-3 rounded-lg p-3 lg:gap-4 lg:p-4 ${
                    playerFoodStatus.foodCollected 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-orange-500/10 border border-orange-500/20'
                  }`}>
                    {playerFoodStatus.foodCollected ? (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 lg:h-14 lg:w-14">
                          <CheckCircle2 className="h-5 w-5 text-green-500 lg:h-8 lg:w-8" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-600 lg:text-xl">Meal Collected ✓</p>
                          <p className="text-[10px] text-muted-foreground lg:text-sm">
                            {new Date(playerFoodStatus.foodCollectedAt!).toLocaleString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 lg:h-14 lg:w-14">
                          <Clock className="h-5 w-5 text-orange-500 lg:h-8 lg:w-8" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-orange-600 lg:text-xl">Pending Collection</p>
                          <p className="text-[10px] text-muted-foreground lg:text-sm">Show QR code at food counter</p>
                        </div>
                      </>
                    )}
                  </div>

                  {!playerFoodStatus.foodCollected && playerFoodStatus.qrCode && (
                    <div className="flex flex-col items-center rounded-lg border bg-white p-4 lg:p-6">
                      <p className="mb-3 text-xs font-semibold text-gray-700 lg:mb-4 lg:text-base">Your Food QR Code</p>
                      <div className="rounded-lg border-4 border-primary/20 bg-white p-2">
                        <img src={playerFoodStatus.qrCode} alt="Food QR Code" className="h-36 w-36 lg:h-64 lg:w-64" />
                      </div>
                      <p className="mt-3 text-center text-[10px] text-gray-500 lg:mt-4 lg:text-sm">
                        Show this QR code to the organizer
                      </p>
                      <p className="mt-1 text-xs font-medium text-primary">{playerFoodStatus.traineeId}</p>
                    </div>
                  )}

                  <div className="rounded-lg border bg-card p-3 lg:p-4">
                    <h3 className="mb-2 text-xs font-semibold text-foreground lg:mb-3 lg:text-base">Details</h3>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground lg:text-xs">Name</p>
                        <p className="text-xs font-medium lg:text-base">{playerFoodStatus.fullName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground lg:text-xs">Trainee ID</p>
                        <p className="text-xs font-medium lg:text-base">{playerFoodStatus.traineeId}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground lg:text-xs">Department</p>
                        <p className="text-xs font-medium lg:text-base">{playerFoodStatus.department}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground lg:text-xs">Preference</p>
                        <p className="text-xs font-medium lg:text-base">
                          {playerFoodStatus.foodPreference === 'VEGETARIAN' ? 'Veg' : 'Non-Veg'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center lg:py-8">
                  <XCircle className="mb-2 h-10 w-10 text-muted-foreground lg:mb-3 lg:h-12 lg:w-12" />
                  <p className="text-sm font-medium text-foreground lg:text-base">No Food Registration Found</p>
                  <p className="text-xs text-muted-foreground lg:text-sm">Contact an organizer if this is an error</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    )
  }

  // Admin Scanner Functions
  const startCamera = async () => {
    setCameraError(null)
    setScanning(true)
    setScanResult(null)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      // Create scanner instance
      html5QrCodeRef.current = new Html5Qrcode(scannerContainerId)

      const qrCodeSuccessCallback = (decodedText: string) => {
        // Stop scanning after successful read
        stopCamera()
        handleQRDetected(decodedText)
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      // Try back camera first, fall back to any camera
      try {
        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          () => {} // Ignore errors during scanning
        )
      } catch {
        // Try front camera
        await html5QrCodeRef.current.start(
          { facingMode: "user" },
          config,
          qrCodeSuccessCallback,
          () => {}
        )
      }

      setCameraActive(true)
      toast.success('Camera started - point at QR code')
    } catch (error: any) {
      console.error('Camera error:', error)
      setCameraError(error.message || 'Failed to start camera')
      setScanning(false)
      setCameraActive(false)
      
      if (error.message?.includes('Permission')) {
        toast.error('Camera permission denied. Please allow camera access.')
      } else {
        toast.error('Failed to start camera: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState()
        if (state === 2) { // SCANNING state
          await html5QrCodeRef.current.stop()
        }
        html5QrCodeRef.current.clear()
      } catch (e) {
        console.error('Error stopping scanner:', e)
      }
      html5QrCodeRef.current = null
    }
    setCameraActive(false)
    setScanning(false)
  }

  const handleQRDetected = async (data: string) => {
    let traineeId = data.trim()
    
    // Try to parse if JSON
    try {
      const parsed = JSON.parse(data)
      traineeId = parsed.traineeId || parsed.id || data
    } catch {
      // Not JSON, use as-is
    }

    toast.info(`QR detected: ${traineeId}`)
    await searchTrainee(traineeId)
  }

  const searchTrainee = async (traineeId: string) => {
    setSearching(true)
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/food/registrations?traineeId=${encodeURIComponent(traineeId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to search")

      const data = await response.json()
      const registrations = data.data || []
      const registration = registrations.find((r: any) =>
        r.traineeId.toLowerCase() === traineeId.toLowerCase()
      )

      if (!registration) {
        setScanResult({
          success: false,
          name: "",
          traineeId: traineeId,
          preference: "",
          message: "No registration found with this ID",
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
          message: `Already collected at ${new Date(registration.foodCollectedAt).toLocaleTimeString()}`,
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
        message: "Found! Click confirm to mark as collected.",
        alreadyCollected: false,
      })
    } catch (error: any) {
      console.error("Search error:", error)
      toast.error("Search failed")
      setScanResult({
        success: false,
        name: "",
        traineeId: traineeId,
        preference: "",
        message: error.message || "Search failed",
      })
    } finally {
      setSearching(false)
    }
  }

  const handleManualSearch = async () => {
    if (!manualId.trim()) {
      toast.error("Please enter a Trainee ID")
      return
    }
    setScanResult(null)
    await searchTrainee(manualId.trim())
  }

  const handleConfirm = async () => {
    if (!scanResult?.id) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/food/registrations/${scanResult.id}/collect`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

  const handleStartScan = () => {
    if (cameraActive) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  // Admin Scanner View
  return (
    <ResponsiveLayout>
      <div className="container mx-auto max-w-lg px-3 py-4 lg:max-w-3xl lg:p-6">
        {/* Header */}
        <div className="mb-3 lg:mb-6">
          <Link href="/food">
            <Button variant="ghost" className="mb-2 h-8 gap-1 px-2 text-xs lg:mb-4 lg:h-10 lg:gap-2 lg:px-4 lg:text-sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground lg:text-3xl">QR Scanner</h1>
          <p className="text-xs text-muted-foreground lg:text-base">Scan QR codes for meal distribution</p>
        </div>

        {/* Scanner Card */}
        <Card className="mb-3 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-sm lg:text-xl">Scan QR Code</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Point camera at participant's QR code</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <div className="space-y-3">
              {/* Camera View */}
              <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-border bg-black">
                {/* Scanner container - html5-qrcode will render here */}
                <div 
                  id={scannerContainerId} 
                  className={`w-full ${cameraActive ? 'min-h-[280px] lg:min-h-[400px]' : 'hidden'}`}
                  style={{ position: 'relative' }}
                />
                
                {/* Placeholder when camera is off */}
                {!cameraActive && !cameraError && !scanning && (
                  <div className="flex min-h-[200px] flex-col items-center justify-center p-4 lg:min-h-[300px]">
                    <Camera className="mb-2 h-10 w-10 text-gray-400 lg:mb-4 lg:h-16 lg:w-16" />
                    <p className="text-xs font-medium text-white lg:text-sm">Ready to scan</p>
                    <p className="text-[10px] text-gray-400 lg:text-xs">Click button below to start</p>
                  </div>
                )}

                {/* Loading state */}
                {scanning && !cameraActive && !cameraError && (
                  <div className="flex min-h-[200px] flex-col items-center justify-center p-4 lg:min-h-[300px]">
                    <Loader2 className="mb-2 h-10 w-10 animate-spin text-primary lg:mb-4 lg:h-16 lg:w-16" />
                    <p className="text-xs font-medium text-white lg:text-sm">Starting camera...</p>
                    <p className="text-[10px] text-gray-400 lg:text-xs">Allow camera access if prompted</p>
                  </div>
                )}

                {/* Camera Error */}
                {cameraError && (
                  <div className="flex min-h-[200px] flex-col items-center justify-center p-4 lg:min-h-[300px]">
                    <CameraOff className="mb-2 h-10 w-10 text-destructive lg:mb-4 lg:h-16 lg:w-16" />
                    <p className="text-xs font-medium text-white lg:text-sm">Camera Error</p>
                    <p className="mb-3 max-w-xs text-center text-[10px] text-gray-400 lg:text-xs">{cameraError}</p>
                    <Button variant="outline" size="sm" className="h-7 text-xs lg:h-9 lg:text-sm" onClick={() => { setCameraError(null); startCamera() }}>
                      <RefreshCw className="mr-1 h-3 w-3 lg:mr-2 lg:h-4 lg:w-4" />
                      Retry
                    </Button>
                  </div>
                )}
              </div>

              {/* Camera Button */}
              <Button 
                onClick={handleStartScan} 
                disabled={searching} 
                variant={cameraActive ? "destructive" : "default"}
                className="h-10 w-full gap-2 text-sm lg:h-12 lg:text-base"
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="h-4 w-4 lg:h-5 lg:w-5" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 lg:h-5 lg:w-5" />
                    Start Scanning
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Search */}
        <Card className="mb-3 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-sm lg:text-xl">Manual Search</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Search by Trainee ID</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Trainee ID..."
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                className="h-10 text-sm lg:h-12 lg:text-base"
              />
              <Button onClick={handleManualSearch} disabled={searching} className="h-10 gap-1 px-3 lg:h-12 lg:gap-2 lg:px-4">
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin lg:h-5 lg:w-5" />
                ) : (
                  <Search className="h-4 w-4 lg:h-5 lg:w-5" />
                )}
                <span className="hidden sm:inline">{searching ? "..." : "Search"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scan Result */}
        {scanResult && (
          <Card className="mb-3 lg:mb-6">
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-sm lg:text-xl">
                {scanResult.success ? (
                  <CheckCircle2 className={`h-4 w-4 lg:h-5 lg:w-5 ${scanResult.alreadyCollected ? 'text-yellow-500' : 'text-green-500'}`} />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive lg:h-5 lg:w-5" />
                )}
                Scan Result
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
              {scanResult.success ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 lg:gap-3 lg:p-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground lg:text-xs">Name</p>
                      <p className="text-sm font-medium lg:text-lg">{scanResult.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground lg:text-xs">Trainee ID</p>
                      <p className="text-sm font-medium lg:text-lg">{scanResult.traineeId}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted-foreground lg:text-xs">Preference</p>
                      <p className="text-sm font-medium lg:text-lg">{scanResult.preference}</p>
                    </div>
                  </div>

                  <div className={`rounded-lg p-3 text-xs lg:p-4 lg:text-sm ${
                    scanResult.alreadyCollected ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'
                  }`}>
                    {scanResult.message}
                  </div>

                  <div className="flex gap-2">
                    {!scanResult.alreadyCollected && (
                      <Button onClick={handleConfirm} className="h-10 flex-1 text-sm lg:h-12 lg:text-base">
                        ✓ Confirm Collection
                      </Button>
                    )}
                    <Button 
                      onClick={() => setScanResult(null)} 
                      variant="outline" 
                      className={`h-10 text-sm lg:h-12 lg:text-base ${scanResult.alreadyCollected ? 'w-full' : 'flex-1'}`}
                    >
                      {scanResult.alreadyCollected ? "Scan Next" : "Cancel"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive lg:p-4 lg:text-sm">
                    <p className="font-medium">Not Found</p>
                    <p>ID: {scanResult.traineeId}</p>
                    <p>{scanResult.message}</p>
                  </div>
                  <Button onClick={() => setScanResult(null)} variant="outline" className="h-10 w-full text-sm lg:h-12 lg:text-base">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-sm lg:text-xl">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <ol className="list-decimal space-y-1 pl-4 text-xs text-muted-foreground lg:space-y-2 lg:text-sm">
              <li>Click "Start Scanning" button</li>
              <li>Point camera at participant's QR code</li>
              <li>QR code will be detected automatically</li>
              <li>Verify details and click "Confirm Collection"</li>
              <li>Use manual search if QR code is damaged</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}
