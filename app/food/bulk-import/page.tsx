"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import * as XLSX from "xlsx"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function FoodBulkImportPage() {
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
      setProgress(30)
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
      
      // Log first row to debug column names
      if (rawData.length > 0) {
        console.log('Available columns:', Object.keys(rawData[0]))
        console.log('First row data:', rawData[0])
      }
      
      // Helper function to normalize food preference to match Prisma enum
      const normalizeFoodPreference = (value: string): string => {
        if (!value) return 'VEGETARIAN'
        const normalized = value.toUpperCase().replace(/-/g, '_').replace(/\s+/g, '_').trim()
        // Map common variations to valid enum values
        if (normalized.includes('NON') || normalized.includes('MEAT') || normalized.includes('CHICKEN') || normalized.includes('FISH')) {
          return 'NON_VEGETARIAN'
        }
        if (normalized.includes('VEG')) {
          return 'VEGETARIAN'
        }
        return 'VEGETARIAN' // Default fallback
      }
      
      // Map Google Form columns to FoodRegistration schema using flexible matching
      const mappedRegistrations = rawData.map((row: any, index: number) => ({
        // Required fields from Google Form - using flexible column matching
        fullName: findColumnValue(row, 'Full Name', 'fullName', 'Name'),
        email: findColumnValue(row, 'Email Address', 'Email', 'email'),
        traineeId: findColumnValue(row, 'Trainee ID', 'traineeId', 'TraineeID', 'ID'),
        contactNumber: findColumnValue(row, 'Mobile Number', 'Mobile', 'Phone', 'Contact', 'contactNumber'),
        department: findColumnValue(row, 'Department', 'Dept', 'department'),
        foodPreference: normalizeFoodPreference(findColumnValue(row, 'Food Preference', 'Food', 'foodPreference')),
        
        // Original row data for error tracking
        rowNumber: index + 2, // +2 because row 1 is headers and index is 0-based
      }))
      
      // Filter out empty rows (rows where all key fields are empty)
      const validRegistrations = mappedRegistrations.filter(r => 
        r.fullName || r.traineeId || r.email
      )
      
      console.log(`Parsed ${rawData.length} rows, ${validRegistrations.length} valid registrations`)
      
      setProgress(20)
      
      const token = localStorage.getItem('token')
      
      // Process in batches for real progress tracking
      const BATCH_SIZE = 10
      const totalBatches = Math.ceil(validRegistrations.length / BATCH_SIZE)
      let totalImported = 0
      let totalFailed = 0
      let totalSkipped = 0
      let allErrors: any[] = []
      
      for (let i = 0; i < validRegistrations.length; i += BATCH_SIZE) {
        const batch = validRegistrations.slice(i, i + BATCH_SIZE)
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1
        
        // Update progress: 20% for parsing, 70% for import (spread across batches), 10% for finalization
        const importProgress = 20 + Math.floor((batchNumber / totalBatches) * 70)
        setProgress(importProgress)
        
        const response = await fetch(`${API_URL}/api/food/bulk-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ registrations: batch, skipDuplicates: true }),
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
          // If batch fails, count all as failed
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
        toast.success(`${totalImported} new registrations imported. ${totalSkipped} duplicates skipped.`)
      } else if (totalSkipped > 0) {
        toast.info(`All ${totalSkipped} entries already exist. No new imports.`)
      } else {
        toast.error('No registrations were imported')
      }
    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(error.message || 'Failed to import food registrations')
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
          <Link href="/food">
            <Button variant="ghost" className="mb-3 gap-1.5 text-xs lg:mb-4 lg:gap-2 lg:text-sm" size="sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Food
            </Button>
          </Link>
          <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">Bulk Import</h1>
          <p className="text-xs text-muted-foreground lg:text-base">Upload CSV or Excel file to register multiple participants</p>
        </div>

        {/* Download Template */}
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-base lg:text-xl">Step 1: Download Template</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Download the CSV template and fill in registration information</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <Button variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" size="sm">
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              Download Template
            </Button>
            <div className="mt-3 rounded-lg bg-muted p-2.5 lg:mt-4 lg:p-4">
              <p className="mb-1.5 text-xs font-medium lg:mb-2 lg:text-sm">Required columns:</p>
              <code className="text-[10px] text-muted-foreground lg:text-xs">
                Timestamp, Email, Full Name, Trainee ID, Mobile, Department, Food Preference
              </code>
              <p className="mt-1.5 text-[10px] text-muted-foreground lg:mt-2 lg:text-xs">Food Preference: VEGETARIAN, NON_VEGETARIAN, VEGAN</p>
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
                    {importing ? "Importing..." : "Import"}
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
                  <div className="font-medium text-sm lg:text-base">{importResult.success} registrations imported successfully</div>
                  <div className="text-xs lg:text-sm">QR codes generated automatically</div>
                </div>
              </div>

              {importResult.skipped > 0 && (
                <div className="flex items-center gap-2 lg:gap-3 rounded-lg bg-yellow-500/10 p-3 lg:p-4 text-yellow-600">
                  <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                  <div>
                    <div className="font-medium text-sm lg:text-base">{importResult.skipped} duplicates skipped</div>
                    <div className="text-xs lg:text-sm">These entries already exist in the database</div>
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

              <Button onClick={() => router.push("/food")} size="sm" className="w-full text-xs lg:text-sm">
                View All Registrations
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  )
}
