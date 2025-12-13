"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, ShieldAlert, Loader2 } from "lucide-react"
import Link from "next/link"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function BulkImportPage() {
  const router = useRouter()
  // Auth check - only Super Admin can bulk import players
  const { loading: authLoading, isSuperAdmin, token } = useAuth('SUPER_ADMIN')

  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
    skipped: number
    errors: string[]
  } | null>(null)

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <ResponsiveLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ResponsiveLayout>
    )
  }

  // Only Super Admin is allowed
  if (!isSuperAdmin) {
    return (
      <ResponsiveLayout>
        <div className="container mx-auto max-w-lg p-4 lg:p-6">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
              <CardDescription>
                Only Super Admins can bulk import players.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/players">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Players
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setImportResult(null)
      setProgress(0)
    }
  }

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) {
            reject(new Error('Failed to read file data'))
            return
          }
          
          let jsonData: any[] = []
          const fileName = file.name?.toLowerCase() || ''

          if (fileName.endsWith('.csv')) {
            // Parse CSV
            const text = data as string
            const lines = text.split('\n').filter(line => line.trim())
            if (lines.length === 0) {
              reject(new Error('File is empty'))
              return
            }
            const headers = lines[0].split(',').map(h => h.trim())
            
            jsonData = lines.slice(1).map((line, index) => {
              const values = line.split(',').map(v => v.trim())
              const obj: any = { rowNumber: index + 2 }
              headers.forEach((header, i) => {
                obj[header] = values[i] || ''
              })
              return obj
            })
          } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            // Parse XLSX
            const workbook = XLSX.read(data, { type: 'binary' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            jsonData = XLSX.utils.sheet_to_json(worksheet)
            jsonData = jsonData.map((row, index) => ({ ...row, rowNumber: index + 2 }))
          } else {
            reject(new Error('Unsupported file format'))
            return
          }

          resolve(jsonData)
        } catch (error: any) {
          reject(new Error(`Parse error: ${error.message}`))
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))

      const fileName = file.name?.toLowerCase() || ''
      if (fileName.endsWith('.csv')) {
        reader.readAsText(file)
      } else {
        reader.readAsBinaryString(file)
      }
    })
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setProgress(10)
    try {
      setProgress(20)
      const rawData = await parseFile(file)
      
      // Helper function to find column value by partial key match
      const findColumnValue = (row: any, ...keywords: string[]): string => {
        const keys = Object.keys(row)
        for (const keyword of keywords) {
          // Try exact match first
          if (row[keyword] !== undefined) return String(row[keyword]).trim()
          // Try case-insensitive partial match
          const matchedKey = keys.find(k => 
            k.toLowerCase().includes(keyword.toLowerCase())
          )
          if (matchedKey && row[matchedKey] !== undefined) {
            return String(row[matchedKey]).trim()
          }
        }
        return ''
      }
      
      // Normalize position to match Prisma enum
      const normalizePosition = (value: string): string => {
        if (!value) return 'BATSMAN'
        const normalized = value.toUpperCase().replace(/-/g, '_').replace(/\s+/g, '_').trim()
        if (normalized.includes('ALL') || normalized.includes('ROUNDER')) return 'ALL_ROUNDER'
        if (normalized.includes('BOWL')) return 'BOWLER'
        if (normalized.includes('WICKET') || normalized.includes('KEEPER')) return 'WICKET_KEEPER'
        if (normalized.includes('BAT')) return 'BATSMAN'
        return 'BATSMAN'
      }
      
      // Normalize experience level to match Prisma enum
      const normalizeExperienceLevel = (value: string): string => {
        if (!value) return 'BEGINNER'
        const normalized = value.toUpperCase().trim()
        if (normalized.includes('PROFESSIONAL') || normalized.includes('PRO')) return 'PROFESSIONAL'
        if (normalized.includes('ADVANCED') || normalized.includes('EXPERT')) return 'ADVANCED'
        if (normalized.includes('INTERMEDIATE') || normalized.includes('MEDIUM')) return 'INTERMEDIATE'
        return 'BEGINNER'
      }
      
      // Normalize gender to match Prisma enum
      const normalizeGender = (value: string): string => {
        if (!value) return 'MALE'
        const normalized = value.toUpperCase().trim()
        if (normalized.includes('FEMALE') || normalized.includes('F') || normalized.includes('WOMAN')) return 'FEMALE'
        if (normalized.includes('OTHER')) return 'OTHER'
        return 'MALE'
      }
      
      // Generate traineeId from email (use part before @)
      const generateTraineeId = (email: string, index: number): string => {
        if (email && email.includes('@')) {
          return email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')
        }
        return `PLAYER${Date.now()}${index}`
      }
      
      // Log first row to debug column names
      if (rawData.length > 0) {
        console.log('Available columns:', Object.keys(rawData[0]))
        console.log('First row data:', rawData[0])
      }
      
      // Map Google Form columns to Player schema
      const mappedPlayers = rawData.map((row: any, index: number) => {
        const email = findColumnValue(row, 'Email Address', 'Email', 'email')
        return {
          fullName: findColumnValue(row, 'Full Name', 'fullName', 'Name'),
          email: email,
          traineeId: generateTraineeId(email, index),
          contactNumber: findColumnValue(row, 'Contact Number', 'Mobile', 'Phone', 'Contact', 'contactNumber'),
          department: findColumnValue(row, 'Department', 'Dept', 'department'),
          position: normalizePosition(findColumnValue(row, 'Playing Position', 'Position', 'Preferred', 'position')),
          experienceLevel: normalizeExperienceLevel(findColumnValue(row, 'Experience Level', 'Experience', 'experienceLevel')),
          emergencyContact: findColumnValue(row, 'Emergency Contact', 'Emergency', 'emergencyContact') || null,
          gender: normalizeGender(findColumnValue(row, 'Gender', 'gender')),
          rowNumber: index + 2,
        }
      })
      
      // Filter out empty rows
      const validPlayers = mappedPlayers.filter(p => 
        p.fullName || p.email
      )
      
      console.log(`Parsed ${rawData.length} rows, ${validPlayers.length} valid players`)
      
      setProgress(30)
      
      // Process in batches for real progress tracking
      const BATCH_SIZE = 10
      const totalBatches = Math.ceil(validPlayers.length / BATCH_SIZE)
      let totalImported = 0
      let totalFailed = 0
      let totalSkipped = 0
      let allErrors: any[] = []
      
      for (let i = 0; i < validPlayers.length; i += BATCH_SIZE) {
        const batch = validPlayers.slice(i, i + BATCH_SIZE)
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1
        
        // Update progress: 30% for parsing, 60% for import (spread across batches), 10% for finalization
        const importProgress = 30 + Math.floor((batchNumber / totalBatches) * 60)
        setProgress(importProgress)
        
        const response = await fetch(`${API_URL}/api/players/bulk-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ players: batch, skipDuplicates: true }),
        })
        
        const result = await response.json()
        
        if (response.ok) {
          totalImported += result.data?.imported || 0
          totalFailed += result.data?.failed || 0
          totalSkipped += result.data?.skipped || 0
          if (result.data?.errors?.length > 0) {
            allErrors = [...allErrors, ...result.data.errors]
          }
        } else {
          totalFailed += batch.length
          allErrors.push({ error: result.message || 'Batch import failed' })
        }
      }
      
      setProgress(100)
      setImportResult({
        success: totalImported,
        failed: totalFailed,
        skipped: totalSkipped,
        errors: allErrors,
      })
      
      if (totalImported > 0) {
        toast.success(`${totalImported} players imported. ${totalSkipped} duplicates skipped.`)
      } else if (totalSkipped > 0) {
        toast.info(`All ${totalSkipped} players already exist. No new imports.`)
      } else {
        toast.error('No players were imported')
      }
    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(error.message || 'Failed to import players')
      setProgress(0)
      setImportResult({
        success: 0,
        failed: 1,
        errors: [error.message || 'Import failed'],
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto max-w-3xl p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <Link href="/players">
            <Button variant="ghost" className="mb-3 gap-1.5 text-xs lg:mb-4 lg:gap-2 lg:text-sm" size="sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Players
            </Button>
          </Link>
          <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">Bulk Import Players</h1>
          <p className="text-xs text-muted-foreground lg:text-base">Upload CSV or Excel file to register multiple players</p>
        </div>

        {/* Download Template */}
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-base lg:text-xl">Step 1: Download Template</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Download CSV template and fill in player information</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <Button variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" size="sm">
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              Download Template
            </Button>
            <div className="mt-3 rounded-lg bg-muted p-2.5 lg:mt-4 lg:p-4">
              <p className="mb-1.5 text-xs font-medium lg:mb-2 lg:text-sm">Expected columns:</p>
              <code className="text-[10px] text-muted-foreground lg:text-xs">
                Timestamp, Email, Full Name, Contact, Department, Position, Experience, Availability, Emergency Contact, Rules Agreement, Gender
              </code>
              <p className="mt-1.5 text-[10px] text-muted-foreground lg:mt-2 lg:text-xs">
                Position: Batsman, Bowler, All-Rounder, Wicket Keeper<br/>
                Experience: Beginner, Intermediate, Advanced, Professional
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload File */}
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-base lg:text-xl">Step 2: Upload File</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Select CSV or XLSX file to import</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 transition-colors hover:border-primary/50 lg:p-12">
                <label htmlFor="file-upload" className="cursor-pointer text-center">
                  <FileSpreadsheet className="mx-auto mb-3 h-8 w-8 text-muted-foreground lg:mb-4 lg:h-12 lg:w-12" />
                  <div className="mb-1.5 text-xs font-medium text-foreground lg:mb-2 lg:text-sm">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </div>
                  <div className="text-[10px] text-muted-foreground lg:text-xs">CSV or XLSX (Max 5MB)</div>
                  <input id="file-upload" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {file && (
                <>
                  {importing && (
                    <div className="space-y-1.5 lg:space-y-2">
                      <div className="flex items-center justify-between text-xs lg:text-sm">
                        <span className="text-muted-foreground">Importing...</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted lg:h-2">
                        <div
                          className="h-full bg-primary transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Button onClick={handleImport} disabled={importing} className="w-full gap-1.5 text-xs lg:gap-2 lg:text-sm" size="sm">
                    <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                    {importing ? "Importing..." : "Import Players"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Import Results */}
        {importResult && (
          <Card>
            <CardHeader className="p-3 lg:p-6">
              <CardTitle className="text-base lg:text-xl">Import Results</CardTitle>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0 lg:pt-0 space-y-3 lg:space-y-4">
              <div className="flex items-center gap-2 lg:gap-3 rounded-lg bg-green-500/10 p-3 lg:p-4 text-green-500">
                <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5" />
                <div>
                  <div className="font-medium text-sm lg:text-base">{importResult.success} players imported successfully</div>
                </div>
              </div>

              {importResult.skipped > 0 && (
                <div className="flex items-center gap-2 lg:gap-3 rounded-lg bg-yellow-500/10 p-3 lg:p-4 text-yellow-600">
                  <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                  <div>
                    <div className="font-medium text-sm lg:text-base">{importResult.skipped} duplicates skipped</div>
                    <div className="text-xs lg:text-sm">These players already exist in the database</div>
                  </div>
                </div>
              )}

              {importResult.failed > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 lg:gap-3 rounded-lg bg-destructive/10 p-3 lg:p-4 text-destructive">
                    <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                    <div>
                      <div className="font-medium text-sm lg:text-base">{importResult.failed} rows failed</div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-3 lg:p-4">
                    <p className="mb-2 text-xs lg:text-sm font-medium">Errors:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {importResult.errors.map((err: any, idx) => (
                        <li key={idx}>
                          • {typeof err === 'string' 
                            ? err 
                            : `Row ${err.rowNumber}: ${err.error}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <Button onClick={() => router.push("/players")} size="sm" className="w-full text-xs lg:text-sm">
                View All Players
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  )
}
