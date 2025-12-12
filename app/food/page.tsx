"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, Upload, MoreVertical, QrCode, Edit, Trash2, ScanLine, Loader2, Mail, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FoodRegistration {
  id: string;
  traineeId: string;
  fullName: string;
  email: string | null;
  contactNumber: string;
  department: string;
  foodPreference: string;
  foodCollected: boolean;
  foodCollectedAt: string | null;
}

export default function FoodPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [registrations, setRegistrations] = useState<FoodRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false)
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/food/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch registrations");

      const data = await response.json();
      setRegistrations(data.data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load food registrations");
    } finally {
      setLoading(false);
    }
  }

  const handleMarkCollected = async (registrationId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/food/registrations/${registrationId}/collect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to mark as collected");

      toast.success("Food marked as collected");
      fetchRegistrations(); // Refresh data
    } catch (error: any) {
      console.error("Error marking collected:", error);
      toast.error(error.message || "Failed to mark as collected");
    }
  }

  // Send QR email to individual registration
  const handleSendEmail = async (registrationId: string) => {
    setSendingEmail(registrationId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/food/registrations/${registrationId}/send-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send email");
      }

      const data = await response.json();
      toast.success(data.message || "QR code sent successfully!");
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error(error.message || "Failed to send email");
    } finally {
      setSendingEmail(null);
    }
  }

  // Send QR emails to all or selected registrations
  const handleSendBulkEmails = async () => {
    setSendingBulkEmail(true);
    setShowBulkEmailDialog(false);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/food/send-emails-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationIds: selectedIds.length > 0 ? selectedIds : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send emails");
      }

      const data = await response.json();
      toast.success(`${data.message}`);
      
      if (data.data.failed > 0) {
        toast.warning(`${data.data.failed} emails failed to send`);
      }
      
      setSelectedIds([]);
      setSelectAll(false);
    } catch (error: any) {
      console.error("Error sending bulk emails:", error);
      toast.error(error.message || "Failed to send bulk emails");
    } finally {
      setSendingBulkEmail(false);
    }
  }

  // Toggle selection for bulk actions
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRegistrations.filter(r => r.email).map(r => r.id));
    }
    setSelectAll(!selectAll);
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.traineeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalRegistrations = registrations.length
  const collectedCount = registrations.filter((r) => r.foodCollected).length
  const pendingCount = totalRegistrations - collectedCount
  const vegCount = registrations.filter((r) => r.foodPreference === "VEGETARIAN").length
  const nonVegCount = registrations.filter((r) => r.foodPreference === "NON_VEGETARIAN").length

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Food Distribution</h1>
              <p className="text-muted-foreground">Manage meal registrations and QR-based distribution</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="gap-2 bg-transparent"
                onClick={() => setShowBulkEmailDialog(true)}
                disabled={sendingBulkEmail}
              >
                {sendingBulkEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {selectedIds.length > 0 ? `Send Email (${selectedIds.length})` : "Send All Emails"}
              </Button>
              <Link href="/food/scanner">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ScanLine className="h-4 w-4" />
                  QR Scanner
                </Button>
              </Link>
              <Link href="/food/bulk-import">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Bulk Import
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Link href="/food/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Registration
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRegistrations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{collectedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {totalRegistrations > 0 ? Math.round((collectedCount / totalRegistrations) * 100) : 0}% completion
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Veg / Non-Veg</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vegCount} / {nonVegCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, trainee ID, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Registrations Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Trainee ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Preference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No registrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(reg.id)}
                            onChange={() => toggleSelect(reg.id)}
                            disabled={!reg.email}
                            className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{reg.fullName}</TableCell>
                        <TableCell>
                          <code className="text-xs">{reg.traineeId}</code>
                        </TableCell>
                        <TableCell>
                          {reg.email ? (
                            <span className="text-xs text-muted-foreground">{reg.email}</span>
                          ) : (
                            <Badge variant="outline" className="text-xs text-orange-500">No Email</Badge>
                          )}
                        </TableCell>
                        <TableCell>{reg.department}</TableCell>
                        <TableCell>
                          <Badge variant={reg.foodPreference === "VEGETARIAN" ? "secondary" : "outline"}>
                            {reg.foodPreference === "VEGETARIAN" ? "Vegetarian" : "Non-Vegetarian"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {reg.foodCollected ? (
                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Collected</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <QrCode className="mr-2 h-4 w-4" />
                                View QR Code
                              </DropdownMenuItem>
                              {reg.email && (
                                <DropdownMenuItem 
                                  onClick={() => handleSendEmail(reg.id)}
                                  disabled={sendingEmail === reg.id}
                                >
                                  {sendingEmail === reg.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                  )}
                                  Send QR via Email
                                </DropdownMenuItem>
                              )}
                              {!reg.foodCollected && (
                                <DropdownMenuItem onClick={() => handleMarkCollected(reg.id)}>
                                  <ScanLine className="mr-2 h-4 w-4" />
                                  Mark as Collected
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bulk Email Confirmation Dialog */}
      <AlertDialog open={showBulkEmailDialog} onOpenChange={setShowBulkEmailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send QR Code Emails</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.length > 0 ? (
                <>
                  You are about to send QR code emails to <strong>{selectedIds.length}</strong> selected registrations.
                </>
              ) : (
                <>
                  You are about to send QR code emails to <strong>all registrations</strong> that have email addresses.
                  This may take a while depending on the number of registrations.
                </>
              )}
              <br /><br />
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendBulkEmails}>
              <Mail className="mr-2 h-4 w-4" />
              Send Emails
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
