"use client"

import { useState, useEffect, useRef } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ScanLine, Search, CheckCircle2, XCircle, Loader2, Clock, UtensilsCrossed, Camera, CameraOff } from "lucide-react"
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      
      // If user is a player, fetch their food status
      if (userData.role === 'USER') {
        fetchPlayerFoodStatus(userData.email)
      } else {
        setLoadingStatus(false)
      }
    } else {
      setLoadingStatus(false)
    }
  }, [])

  const fetchPlayerFoodStatus = async (email: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/api/food/registrations?email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const registrations = data.data || []
        // Find registration matching user's email
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
        <div className="container mx-auto max-w-2xl p-4 lg:p-6">
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">Food Status</h1>
            <p className="text-xs text-muted-foreground lg:text-base">Check your meal registration and collection status</p>
          </div>

          {/* Food Status Card */}
          <Card className="mb-4 lg:mb-6">
            <CardHeader className="p-4 lg:p-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-xl">
                <UtensilsCrossed className="h-5 w-5" />
                Your Meal Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
              {playerFoodStatus ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`flex items-center gap-4 rounded-lg p-4 ${
                    playerFoodStatus.foodCollected 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-orange-500/10 border border-orange-500/20'
                  }`}>
                    {playerFoodStatus.foodCollected ? (
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-green-600 lg:text-xl">Meal Collected ✓</p>
                          <p className="text-xs text-muted-foreground lg:text-sm">
                            Collected on {new Date(playerFoodStatus.foodCollectedAt!).toLocaleDateString()} at {new Date(playerFoodStatus.foodCollectedAt!).toLocaleTimeString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/20">
                          <Clock className="h-8 w-8 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-orange-600 lg:text-xl">Pending Collection</p>
                          <p className="text-xs text-muted-foreground lg:text-sm">
                            Show the QR code below at the food counter
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* QR Code Display */}
                  {!playerFoodStatus.foodCollected && playerFoodStatus.qrCode && (
                    <div className="flex flex-col items-center rounded-lg border bg-white p-6">
                      <p className="mb-4 text-sm font-semibold text-gray-700 lg:text-base">Your Food QR Code</p>
                      <div className="rounded-lg border-4 border-primary/20 p-2 bg-white">
                        <img 
                          src={playerFoodStatus.qrCode} 
                          alt="Food QR Code" 
                          className="h-48 w-48 lg:h-64 lg:w-64"
                        />
                      </div>
                      <p className="mt-4 text-center text-xs text-gray-500 lg:text-sm">
                        Show this QR code to the organizer at the food counter
                      </p>
                      <p className="mt-1 text-center text-xs font-medium text-primary">
                        {playerFoodStatus.traineeId}
                      </p>
                    </div>
                  )}

                  {/* Registration Details */}
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold text-foreground lg:text-base">Registration Details</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm font-medium lg:text-base">{playerFoodStatus.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trainee ID</p>
                        <p className="text-sm font-medium lg:text-base">{playerFoodStatus.traineeId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="text-sm font-medium lg:text-base">{playerFoodStatus.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Food Preference</p>
                        <p className="text-sm font-medium lg:text-base">
                          {playerFoodStatus.foodPreference === 'VEGETARIAN' ? 'Vegetarian' : 'Non-Vegetarian'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <XCircle className="mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground lg:text-base">No Food Registration Found</p>
                  <p className="text-xs text-muted-foreground lg:text-sm">
                    Contact an organizer if you believe this is an error
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    )
  }

  // Admin Scanner View (with real camera)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<any>(null)

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    setCameraError(null)
    setScanning(true)
    
    try {
      // Dynamically import QrScanner
      const QrScanner = (await import('qr-scanner')).default
      
      if (!videoRef.current) {
        throw new Error('Video element not found')
      }

      // Create scanner instance
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result: any) => {
          // QR code detected
          handleQRDetected(result.data)
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      )

      await scannerRef.current.start()
      setCameraActive(true)
      toast.success('Camera started')
    } catch (error: any) {
      console.error('Camera error:', error)
      setCameraError(error.message || 'Failed to access camera')
      setScanning(false)
      setCameraActive(false)
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access.')
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.')
      } else {
        toast.error('Failed to start camera: ' + error.message)
      }
    }
  }

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
      scannerRef.current.destroy()
      scannerRef.current = null
    }
    setCameraActive(false)
    setScanning(false)
  }

  const handleQRDetected = async (data: string) => {
    // Stop camera after detection
    stopCamera()
    
    // The QR code contains the trainee ID
    // Parse the QR data - it might be JSON or just the ID
    let traineeId = data
    try {
      const parsed = JSON.parse(data)
      traineeId = parsed.traineeId || parsed.id || data
    } catch {
      // Not JSON, use as-is
      traineeId = data
    }
    
    toast.info(`QR Code detected: ${traineeId}`)
    
    // Search for the registration
    setSearching(true)
    try {
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${API_URL}/api/food/registrations?traineeId=${encodeURIComponent(traineeId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!response.ok) throw new Error("Failed to search")
      
      const responseData = await response.json()
      const registrations = responseData.data || []
      
      // Find exact match
      const registration = registrations.find((r: any) => 
        r.traineeId.toLowerCase() === traineeId.toLowerCase()
      )
      
      if (!registration) {
        setScanResult({
          success: false,
          name: "",
          traineeId: traineeId,
          preference: "",
          message: "No registration found with this QR code",
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
      console.error("QR Search error:", error)
      toast.error("Failed to process QR code")
      setScanResult({
        success: false,
        name: "",
        traineeId: traineeId,
        preference: "",
        message: error.message || "Failed to process QR code",
      })
    } finally {
      setSearching(false)
    }
  }

  const handleStartScan = () => {
    if (cameraActive) {
      stopCamera()
    } else {
      startCamera()
    }
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
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-black">
                {/* Video element for camera */}
                <video 
                  ref={videoRef}
                  className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />
                
                {/* Placeholder when camera is off */}
                {!cameraActive && !cameraError && (
                  <div className="text-center">
                    <Camera className="mx-auto mb-3 h-12 w-12 text-muted-foreground lg:mb-4 lg:h-16 lg:w-16" />
                    <p className="mb-1.5 text-xs font-medium text-white lg:mb-2 lg:text-sm">Ready to scan</p>
                    <p className="text-[10px] text-gray-400 lg:text-xs">Click the button below to start camera</p>
                  </div>
                )}

                {/* Camera Error */}
                {cameraError && (
                  <div className="text-center p-4">
                    <CameraOff className="mx-auto mb-3 h-12 w-12 text-destructive lg:mb-4 lg:h-16 lg:w-16" />
                    <p className="mb-1.5 text-xs font-medium text-white lg:mb-2 lg:text-sm">Camera Error</p>
                    <p className="text-[10px] text-gray-400 lg:text-xs max-w-xs">{cameraError}</p>
                  </div>
                )}

                {/* Scanning indicator */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-4 border-primary/50 animate-pulse rounded-lg" />
                    <div className="absolute top-2 left-2 bg-red-500 w-3 h-3 rounded-full animate-pulse" />
                    <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                      Point at QR code
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleStartScan} 
                disabled={searching} 
                variant={cameraActive ? "destructive" : "default"}
                className="w-full gap-1.5 text-xs lg:gap-2 lg:text-sm" 
                size="sm"
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="h-3 w-3 lg:h-4 lg:w-4" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3 lg:h-4 lg:w-4" />
                    Start Camera
                  </>
                )}
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
