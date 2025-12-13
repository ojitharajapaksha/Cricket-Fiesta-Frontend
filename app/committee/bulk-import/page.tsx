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

export default function CommitteeBulkImportPage() {
  const router = useRouter()
  // Auth check - only Super Admin can bulk import
  const { loading: authLoading, isSuperAdmin, token } = useAuth('SUPER_ADMIN')

  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
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
                Only Super Admins can bulk import committee members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/committee">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Committee
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
      const data = await parseFile(file)
      setProgress(50)
      
      setProgress(70)
      const response = await fetch(`${API_URL}/api/committee/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ members: data }),
      })

      setProgress(90)
      const result = await response.json()
      
      if (response.ok) {
        setProgress(100)
        setImportResult({
          success: result.data?.imported || data.length,
          failed: result.data?.failed || 0,
          errors: result.data?.errors || [],
        })
        toast.success(`${result.data?.imported || data.length} members imported successfully`)
      } else {
        throw new Error(result.message || 'Import failed')
      }
    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(error.message || 'Failed to import committee members')
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
          <Link href="/committee">
            <Button variant="ghost" className="mb-3 gap-1.5 text-xs lg:mb-4 lg:gap-2 lg:text-sm" size="sm">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              Back to Committee
            </Button>
          </Link>
          <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">Bulk Import Committee</h1>
          <p className="text-xs text-muted-foreground lg:text-base">Upload CSV or Excel file to register multiple volunteers</p>
        </div>

        {/* Download Template */}
        <Card className="mb-4 lg:mb-6">
          <CardHeader className="p-3 lg:p-6">
            <CardTitle className="text-base lg:text-xl">Step 1: Download Template</CardTitle>
            <CardDescription className="text-xs lg:text-sm">Download CSV template and fill in volunteer info</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
            <Button variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" size="sm">
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              Download Template
            </Button>
            <div className="mt-3 rounded-lg bg-muted p-2.5 lg:mt-4 lg:p-4">
              <p className="mb-1.5 text-xs font-medium lg:mb-2 lg:text-sm">Template columns:</p>
              <code className="text-[10px] text-muted-foreground lg:text-xs">
                Full Name, Department, WhatsApp, Email, Team, Experience, Emergency Contact, Availability
              </code>
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
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Importing members...</span>
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
                      {importing ? "Importing..." : "Import Members"}
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
                  <div className="font-medium text-sm lg:text-base">{importResult.success} members imported successfully</div>
                </div>
              </div>

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
                      {importResult.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <Button onClick={() => router.push("/committee")} size="sm" className="w-full text-xs lg:text-sm">
                View All Members
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  )
}
