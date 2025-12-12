"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, UtensilsCrossed, Users } from "lucide-react"
import Link from "next/link"

export default function ScannerPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-foreground">QR Code Scanner</h1>
            <p className="text-muted-foreground">Universal scanner for attendance and food distribution</p>
          </div>

          {/* Scanner Tabs */}
          <Tabs defaultValue="food" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="food" className="gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Food Distribution
              </TabsTrigger>
              <TabsTrigger value="attendance" className="gap-2">
                <Users className="h-4 w-4" />
                Player Attendance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="food" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Food Distribution Scanner</CardTitle>
                  <CardDescription>Scan participant QR codes for meal collection</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <QrCode className="mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="mb-6 text-center text-muted-foreground">
                    This scanner is optimized for food distribution
                  </p>
                  <Link href="/food/scanner">
                    <Button size="lg">Open Food Scanner</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Player Attendance Scanner</CardTitle>
                  <CardDescription>Mark player attendance via QR code scanning</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <QrCode className="mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="mb-6 text-center text-muted-foreground">
                    This scanner is optimized for player check-in
                  </p>
                  <Button size="lg" disabled>
                    Open Attendance Scanner (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
