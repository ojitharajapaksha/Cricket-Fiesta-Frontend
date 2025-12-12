"use client"

import { ResponsiveLayout } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, UtensilsCrossed, Users } from "lucide-react"
import Link from "next/link"

export default function ScannerPage() {
  return (
    <ResponsiveLayout>
      <div className="container mx-auto max-w-4xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">QR Code Scanner</h1>
          <p className="text-xs text-muted-foreground lg:text-base">Universal scanner for attendance and food distribution</p>
        </div>

        {/* Scanner Tabs */}
        <Tabs defaultValue="food" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2">
            <TabsTrigger value="food" className="gap-1.5 px-2 py-1.5 text-xs lg:gap-2 lg:px-4 lg:py-2 lg:text-sm">
              <UtensilsCrossed className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Food Distribution</span>
              <span className="sm:hidden">Food</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-1.5 px-2 py-1.5 text-xs lg:gap-2 lg:px-4 lg:py-2 lg:text-sm">
              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Player Attendance</span>
              <span className="sm:hidden">Attendance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="mt-4 lg:mt-6">
            <Card>
              <CardHeader className="p-3 lg:p-6">
                <CardTitle className="text-base lg:text-xl">Food Distribution Scanner</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Scan participant QR codes for meal collection</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-3 py-8 lg:p-6 lg:py-12">
                <QrCode className="mb-3 h-12 w-12 text-muted-foreground lg:mb-4 lg:h-16 lg:w-16" />
                <p className="mb-4 text-center text-xs text-muted-foreground lg:mb-6 lg:text-base">
                  This scanner is optimized for food distribution
                </p>
                <Link href="/food/scanner">
                  <Button size="sm" className="text-xs lg:text-sm">Open Food Scanner</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="mt-4 lg:mt-6">
            <Card>
              <CardHeader className="p-3 lg:p-6">
                <CardTitle className="text-base lg:text-xl">Player Attendance Scanner</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Mark player attendance via QR code scanning</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-3 py-8 lg:p-6 lg:py-12">
                <QrCode className="mb-3 h-12 w-12 text-muted-foreground lg:mb-4 lg:h-16 lg:w-16" />
                <p className="mb-4 text-center text-xs text-muted-foreground lg:mb-6 lg:text-base">
                  This scanner is optimized for player check-in
                </p>
                <Button size="sm" className="text-xs lg:text-sm" disabled>
                  <span className="hidden sm:inline">Open Attendance Scanner (Coming Soon)</span>
                  <span className="sm:hidden">Coming Soon</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  )
}
