"use client"

import { ResponsiveLayout } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Construction } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-xl font-bold text-foreground lg:text-3xl flex items-center gap-2">
            <Settings className="h-6 w-6 lg:h-8 lg:w-8" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground lg:text-base">
            Manage your account and application settings
          </p>
        </div>

        {/* Coming Soon */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Construction className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl lg:text-2xl">Coming Soon</CardTitle>
            <CardDescription className="text-sm lg:text-base">
              Settings page is under development. Check back later for:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Profile settings and preferences
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Notification preferences
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Theme customization
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Account management
              </li>
            </ul>
            <div className="text-center">
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}
