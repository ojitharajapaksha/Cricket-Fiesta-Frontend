"use client"

import { useState, useEffect, useRef } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, CheckCircle2, XCircle, Loader2, Clock, UtensilsCrossed, Camera, CameraOff, RefreshCw, Scan } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface UserData {
  id: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
}

interface FoodRegistration {
  id: string
  traineeId: string
  fullName: string
  email: string
  department: string
  foodPreference: string
  foodCollected: boolean
  foodCollectedAt: string | null
  qrCode: string
}

interface ScanResult {
  success: boolean
  id?: string
  name: string
  traineeId: string
  preference: string
  message: string
  alreadyCollected?: boolean
}

// Player Food Status Component
function PlayerFoodStatus({ email }: { email: string }) {
  const [status, setStatus] = useState<FoodRegistration | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_URL}/api/food/registrations?email=${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const reg = (data.data || []).find((r: FoodRegistration) => 
            r.email?.toLowerCase() === email.toLowerCase()
          )
          setStatus(reg || null)
        }
      } catch (e) {
        console.error("Error:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [email])

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto max-w-2xl px-3 py-4 lg:p-6">
        <h1 className="mb-4 text-lg font-bold lg:text-3xl">Food Status</h1>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base"><UtensilsCrossed className="h-5 w-5" />Your Meal Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {status ? (
              <div className="space-y-4">
                <div className={`flex items-center gap-3 rounded-lg p-4 ${status.foodCollected ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                  {status.foodCollected ? (
                    <><CheckCircle2 className="h-8 w-8 text-green-500" /><div><p className="font-semibold text-green-600">Meal Collected ✓</p><p className="text-xs text-muted-foreground">{new Date(status.foodCollectedAt!).toLocaleString()}</p></div></>
                  ) : (
                    <><Clock className="h-8 w-8 text-orange-500" /><div><p className="font-semibold text-orange-600">Pending Collection</p><p className="text-xs text-muted-foreground">Show QR code at food counter</p></div></>
                  )}
                </div>
                {!status.foodCollected && status.qrCode && (
                  <div className="flex flex-col items-center rounded-lg border bg-white p-4">
                    <img src={status.qrCode} alt="QR" className="h-48 w-48" />
                    <p className="mt-2 text-sm font-medium text-primary">{status.traineeId}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center"><XCircle className="mx-auto h-12 w-12 text-muted-foreground" /><p className="mt-2">No registration found</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}

// Admin QR Scanner Component  
function AdminScanner() {
  const [scanning, setScanning] = useState(false)
  const [searching, setSearching] = useState(false)
  const [manualId, setManualId] = useState("")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  
  const html5QrRef = useRef<any>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const stopScanning = () => {
    // Stop html5-qrcode if active
    if (html5QrRef.current) {
      try {
        html5QrRef.current.stop().catch(() => {})
        html5QrRef.current.clear()
      } catch (e) {
        console.log("Cleanup error (ignored):", e)
      }
      html5QrRef.current = null
    }
    
    setScanning(false)
  }

  const startScanning = async () => {
    setCameraError(null)
    setScanResult(null)
    setScanning(true)

    try {
      // Use html5-qrcode library for scanning
      const { Html5Qrcode } = await import('html5-qrcode')
      
      // Create scanner with verbose logging for debugging
      html5QrRef.current = new Html5Qrcode("qr-scanner-container", { 
        verbose: true,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      })
      
      // Use facingMode for better mobile support instead of camera ID
      const config = {
        fps: 15,
        qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
          // Use 70% of the smaller dimension for scan box
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
          const qrboxSize = Math.floor(minEdge * 0.7)
          return { width: qrboxSize, height: qrboxSize }
        },
        aspectRatio: 1.0,
        disableFlip: false,
        formatsToSupport: [0] // 0 = QR_CODE format
      }
      
      // Try back camera first, then front camera
      try {
        await html5QrRef.current.start(
          { facingMode: "environment" }, // Back camera
          config,
          async (decodedText: string) => {
            console.log("QR Decoded:", decodedText)
            toast.success("QR Code scanned!")
            stopScanning()
            await processQRCode(decodedText)
          },
          (errorMessage: string) => {
            // Silently ignore - these are just "no QR found" messages
          }
        )
      } catch (backCamError) {
        console.log("Back camera failed, trying front camera:", backCamError)
        // Try front camera if back fails
        await html5QrRef.current.start(
          { facingMode: "user" }, // Front camera
          config,
          async (decodedText: string) => {
            console.log("QR Decoded:", decodedText)
            toast.success("QR Code scanned!")
            stopScanning()
            await processQRCode(decodedText)
          },
          (errorMessage: string) => {
            // Silently ignore
          }
        )
      }
      
      toast.success("Camera ready! Point at QR code")
      
    } catch (error: any) {
      console.error("Camera error:", error)
      setScanning(false)
      
      let errorMsg = "Failed to start camera"
      if (error.name === 'NotAllowedError' || error.message?.includes('Permission')) {
        errorMsg = "Camera permission denied. Please allow camera access in your browser settings."
      } else if (error.name === 'NotFoundError' || error.message?.includes('No camera')) {
        errorMsg = "No camera found on this device"
      } else if (error.message) {
        errorMsg = error.message
      }
      
      setCameraError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const processQRCode = async (data: string) => {
    let traineeId = data.trim()
    
    // Try to parse JSON
    try {
      const parsed = JSON.parse(data)
      traineeId = parsed.traineeId || parsed.id || data
    } catch {}

    await searchTrainee(traineeId)
  }

  const searchTrainee = async (traineeId: string) => {
    setSearching(true)
    setScanResult(null)
    
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/food/registrations?traineeId=${encodeURIComponent(traineeId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Search failed")

      const data = await res.json()
      const reg = (data.data || []).find((r: any) =>
        r.traineeId.toLowerCase() === traineeId.toLowerCase()
      )

      if (!reg) {
        setScanResult({ success: false, name: "", traineeId, preference: "", message: "No registration found" })
        toast.error("No registration found for: " + traineeId)
        return
      }

      if (reg.foodCollected) {
        setScanResult({
          success: true, id: reg.id, name: reg.fullName, traineeId: reg.traineeId,
          preference: reg.foodPreference === "VEGETARIAN" ? "Veg" : "Non-Veg",
          message: `Already collected at ${new Date(reg.foodCollectedAt).toLocaleTimeString()}`,
          alreadyCollected: true,
        })
        toast.warning("Food already collected!")
        return
      }

      setScanResult({
        success: true, id: reg.id, name: reg.fullName, traineeId: reg.traineeId,
        preference: reg.foodPreference === "VEGETARIAN" ? "Veg" : "Non-Veg",
        message: "Ready to collect",
        alreadyCollected: false,
      })
      toast.success("Found: " + reg.fullName)
      
    } catch (error: any) {
      setScanResult({ success: false, name: "", traineeId, preference: "", message: error.message || "Search failed" })
      toast.error("Search failed")
    } finally {
      setSearching(false)
    }
  }

  const handleConfirm = async () => {
    if (!scanResult?.id) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/food/registrations/${scanResult.id}/collect`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })

      if (!res.ok) throw new Error("Failed to update")

      toast.success("✅ Food marked as collected!")
      setScanResult({ ...scanResult, message: "Collection confirmed!", alreadyCollected: true })
      setManualId("")
    } catch (error: any) {
      toast.error(error.message || "Failed")
    }
  }

  const handleManualSearch = () => {
    if (!manualId.trim()) {
      toast.error("Enter a Trainee ID")
      return
    }
    searchTrainee(manualId.trim())
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto max-w-lg px-3 py-4 lg:max-w-2xl lg:p-6">
        {/* Header */}
        <div className="mb-4">
          <Link href="/food">
            <Button variant="ghost" size="sm" className="mb-2 gap-1 text-xs">
              <ArrowLeft className="h-3 w-3" /> Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold lg:text-3xl">QR Scanner</h1>
          <p className="text-sm text-muted-foreground">Scan QR codes for meal distribution</p>
        </div>

        {/* Scanner */}
        <Card className="mb-4">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scan className="h-5 w-5" /> QR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {/* Scanner Container */}
            <div className="relative mb-4 overflow-hidden rounded-lg bg-black" style={{ minHeight: '400px' }}>
              {/* Html5 QR Scanner renders here - MUST have explicit dimensions */}
              <div 
                id="qr-scanner-container" 
                className={scanning ? 'block' : 'hidden'} 
                style={{ width: '100%', minHeight: '380px' }} 
              />
              
              {/* Idle State */}
              {!scanning && !cameraError && (
                <div className="flex h-[400px] flex-col items-center justify-center text-white">
                  <Camera className="mb-3 h-16 w-16 opacity-50" />
                  <p className="text-base font-medium">Ready to Scan</p>
                  <p className="mt-1 text-sm text-gray-400">Tap button below to start camera</p>
                </div>
              )}
              
              {/* Error State */}
              {cameraError && (
                <div className="flex h-[400px] flex-col items-center justify-center p-4 text-center text-white">
                  <CameraOff className="mb-3 h-12 w-12 text-red-400" />
                  <p className="mb-2 text-sm font-medium">Camera Error</p>
                  <p className="mb-3 text-xs text-gray-400">{cameraError}</p>
                  <Button size="sm" variant="outline" onClick={() => { setCameraError(null); startScanning(); }}>
                    <RefreshCw className="mr-1 h-3 w-3" /> Retry
                  </Button>
                </div>
              )}
            </div>

            {/* Scan Button */}
            <Button
              onClick={scanning ? stopScanning : startScanning}
              disabled={searching}
              variant={scanning ? "destructive" : "default"}
              className="h-12 w-full gap-2 text-base"
            >
              {scanning ? (
                <><CameraOff className="h-5 w-5" /> Stop Camera</>
              ) : (
                <><Camera className="h-5 w-5" /> Start Scanning</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Search */}
        <Card className="mb-4">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Manual Search</CardTitle>
            <CardDescription className="text-xs">Enter Trainee ID if QR code doesn't work</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Trainee ID (e.g., TRN001)"
                value={manualId}
                onChange={(e) => setManualId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                className="h-12 text-base uppercase"
              />
              <Button onClick={handleManualSearch} disabled={searching} className="h-12 px-4">
                {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {scanResult && (
          <Card className={`mb-4 border-2 ${scanResult.success ? (scanResult.alreadyCollected ? 'border-yellow-500' : 'border-green-500') : 'border-red-500'}`}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                {scanResult.success ? (
                  <CheckCircle2 className={`h-5 w-5 ${scanResult.alreadyCollected ? 'text-yellow-500' : 'text-green-500'}`} />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {scanResult.success ? (scanResult.alreadyCollected ? "Already Collected" : "Found") : "Not Found"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {scanResult.success ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-muted p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Name:</span><p className="font-semibold">{scanResult.name}</p></div>
                      <div><span className="text-muted-foreground">ID:</span><p className="font-semibold">{scanResult.traineeId}</p></div>
                      <div className="col-span-2"><span className="text-muted-foreground">Preference:</span><p className="font-semibold">{scanResult.preference}</p></div>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-3 text-sm ${scanResult.alreadyCollected ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {scanResult.message}
                  </div>

                  <div className="flex gap-2">
                    {!scanResult.alreadyCollected && (
                      <Button onClick={handleConfirm} className="h-12 flex-1 bg-green-600 text-base hover:bg-green-700">
                        ✓ Confirm Collection
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => { setScanResult(null); setManualId(""); }} className={`h-12 text-base ${scanResult.alreadyCollected ? 'w-full' : 'flex-1'}`}>
                      {scanResult.alreadyCollected ? "Scan Next" : "Cancel"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-600">ID: {scanResult.traineeId}</p>
                  <p className="text-sm">{scanResult.message}</p>
                  <Button variant="outline" onClick={() => setScanResult(null)} className="h-12 w-full">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Tips</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Hold phone steady, 6-12 inches from QR code</li>
              <li>• Ensure good lighting</li>
              <li>• Allow camera permission when prompted</li>
              <li>• Use manual search if QR scan fails</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}

// Main Component
export default function ScannerPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (user?.role === 'USER') {
    return <PlayerFoodStatus email={user.email} />
  }

  return <AdminScanner />
}
