"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import * as XLSX from "xlsx"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function BulkImportPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
    skipped: number
    errors: string[]
  } | null>(null)

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
      
      const token = localStorage.getItem('token')
      
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
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/players">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Players
              </Button>
            </Link>
            <h1 className="mb-2 text-3xl font-bold text-foreground">Bulk Import Players</h1>
            <p className="text-muted-foreground">Upload a CSV or Excel (XLSX) file to register multiple players at once</p>
          </div>

          {/* Download Template */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Step 1: Download Template</CardTitle>
              <CardDescription>Download the CSV template and fill in player information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Download CSV Template
              </Button>
              <div className="mt-4 rounded-lg bg-muted p-4">
                <p className="mb-2 text-sm font-medium">Expected columns (from Google Form):</p>
                <code className="text-xs text-muted-foreground">
                  Timestamp, Email Address, Full Name, Contact Number, Department, Preferred Playing Position, Experience Level, Availability, Emergency Contact Number, Rules Agreement, Gender
                </code>
                <p className="mt-2 text-xs text-muted-foreground">
                  Position values: Batsman, Bowler, All-Rounder, Wicket Keeper<br/>
                  Experience: Beginner, Intermediate, Advanced, Professional<br/>
                  Gender: Male, Female, Other
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload File */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Step 2: Upload CSV or Excel File</CardTitle>
              <CardDescription>Select the filled CSV or XLSX file to import players</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-12 transition-colors hover:border-primary/50">
                  <label htmlFor="file-upload" className="cursor-pointer text-center">
                    <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <div className="mb-2 text-sm font-medium text-foreground">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </div>
                    <div className="text-xs text-muted-foreground">CSV or XLSX file (Max 5MB)</div>
                    <input id="file-upload" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                {file && (
                  <>
                    {importing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Importing players...</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Button onClick={handleImport} disabled={importing} className="w-full gap-2">
                      <Upload className="h-4 w-4" />
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
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-green-500/10 p-4 text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{importResult.success} players imported successfully</div>
                  </div>
                </div>

                {importResult.skipped > 0 && (
                  <div className="flex items-center gap-3 rounded-lg bg-yellow-500/10 p-4 text-yellow-600">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{importResult.skipped} duplicates skipped</div>
                      <div className="text-sm">These players already exist in the database</div>
                    </div>
                  </div>
                )}

                {importResult.failed > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{importResult.failed} rows failed</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="mb-2 text-sm font-medium">Errors:</p>
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

                <Button onClick={() => router.push("/players")} className="w-full">
                  View All Players
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
