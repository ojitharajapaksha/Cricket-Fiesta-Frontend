"use client"

import { useState, useEffect } from "react"
import { ResponsiveLayout } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Download, Upload, MoreVertical, QrCode, Edit, Trash2, ScanLine, Loader2, Mail, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
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
  projectName: string | null;
}

export default function FoodPage() {
  // Auth check - redirects to login if not authenticated
  const { loading: authLoading, isAuthenticated, isSuperAdmin, token } = useAuth('ADMIN_OR_SUPER')
  
  const [searchQuery, setSearchQuery] = useState("")
  const [registrations, setRegistrations] = useState<FoodRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false)
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchRegistrations()
    }
  }, [isAuthenticated, token])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const fetchRegistrations = async () => {
    try {
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
    <ResponsiveLayout>
      <div className="container mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-1 text-xl font-bold text-foreground lg:mb-2 lg:text-3xl">Food Distribution</h1>
            <p className="text-xs text-muted-foreground lg:text-base">Manage meal registrations and QR-based distribution</p>
          </div>
          <div className="flex flex-wrap gap-1.5 lg:gap-2">
            {isSuperAdmin && (
              <Button 
                variant="outline" 
                className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm"
                size="sm"
                onClick={() => setShowBulkEmailDialog(true)}
                disabled={sendingBulkEmail}
              >
                {sendingBulkEmail ? (
                  <Loader2 className="h-3 w-3 animate-spin lg:h-4 lg:w-4" />
                ) : (
                  <Mail className="h-3 w-3 lg:h-4 lg:w-4" />
                )}
                <span className="hidden sm:inline">{selectedIds.length > 0 ? `Email (${selectedIds.length})` : "Send Emails"}</span>
                <span className="sm:hidden"><Mail className="h-3 w-3" /></span>
              </Button>
            )}
            <Link href="/food/scanner">
              <Button variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" size="sm">
                <ScanLine className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Scanner</span>
              </Button>
            </Link>
            {isSuperAdmin && (
              <Link href="/food/bulk-import">
                <Button variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" size="sm">
                  <Upload className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
              </Link>
            )}
            <Button variant="outline" className="gap-1.5 bg-transparent text-xs lg:gap-2 lg:text-sm" size="sm">
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            {isSuperAdmin && (
              <Link href="/food/new">
                <Button className="gap-1.5 text-xs lg:gap-2 lg:text-sm" size="sm">
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 grid grid-cols-2 gap-2 lg:mb-6 lg:grid-cols-4 lg:gap-4">
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">{totalRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Collected</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-green-500 lg:text-2xl">{collectedCount}</div>
              <p className="text-[10px] text-muted-foreground lg:text-xs">
                {totalRegistrations > 0 ? Math.round((collectedCount / totalRegistrations) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold text-orange-500 lg:text-2xl">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1 lg:pb-3">
              <CardTitle className="text-[10px] font-medium text-muted-foreground lg:text-sm">Veg/Non-Veg</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold lg:text-2xl">
                {vegCount}/{nonVegCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-4 lg:mb-6">
          <CardContent className="p-3 lg:pt-6">
            <div className="flex flex-col gap-2 sm:flex-row lg:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground lg:h-4 lg:w-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs lg:h-10 lg:pl-9 lg:text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs lg:h-10 lg:text-sm">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Table */}
        <Card className="hidden lg:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {isSuperAdmin && (
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableHead>
                  )}
                  <TableHead>Name</TableHead>
                  <TableHead>Trainee ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Preference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 8 : 7} className="text-center text-muted-foreground">
                      No registrations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      {isSuperAdmin && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(reg.id)}
                            onChange={() => toggleSelect(reg.id)}
                            disabled={!reg.email}
                            className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{reg.fullName}</TableCell>
                      <TableCell>
                        <code className="text-xs">{reg.traineeId}</code>
                      </TableCell>
                      <TableCell>
                        {reg.projectName ? (
                          <span className="text-sm">{reg.projectName}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
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
                            {isSuperAdmin && reg.email && (
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

        {/* Mobile Card View */}
        <div className="space-y-3 lg:hidden">
          {filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No registrations found
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((reg) => (
              <Card key={reg.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {isSuperAdmin && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(reg.id)}
                            onChange={() => toggleSelect(reg.id)}
                            disabled={!reg.email}
                            className="h-3.5 w-3.5 rounded border-gray-300 disabled:opacity-50"
                          />
                        )}
                        <span className="truncate text-sm font-medium">{reg.fullName}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        <code>{reg.traineeId}</code> • {reg.department}
                      </div>
                      {reg.projectName && (
                        <div className="mt-0.5 text-xs text-primary">📁 {reg.projectName}</div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className="mr-2 h-3.5 w-3.5" />
                          View QR
                        </DropdownMenuItem>
                        {isSuperAdmin && reg.email && (
                          <DropdownMenuItem onClick={() => handleSendEmail(reg.id)} disabled={sendingEmail === reg.id}>
                            {sendingEmail === reg.id ? (
                              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-3.5 w-3.5" />
                            )}
                            Send Email
                          </DropdownMenuItem>
                        )}
                        {!reg.foodCollected && (
                          <DropdownMenuItem onClick={() => handleMarkCollected(reg.id)}>
                            <ScanLine className="mr-2 h-3.5 w-3.5" />
                            Mark Collected
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant={reg.foodPreference === "VEGETARIAN" ? "secondary" : "outline"} className="text-[10px]">
                      {reg.foodPreference === "VEGETARIAN" ? "Veg" : "Non-Veg"}
                    </Badge>
                    {reg.foodCollected ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-[10px]">Collected</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                    )}
                    {!reg.email && (
                      <Badge variant="outline" className="text-[10px] text-orange-500">No Email</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Bulk Email Confirmation Dialog */}
      <AlertDialog open={showBulkEmailDialog} onOpenChange={setShowBulkEmailDialog}>
        <AlertDialogContent className="max-w-[90vw] lg:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base lg:text-lg">Send QR Code Emails</AlertDialogTitle>
            <AlertDialogDescription className="text-xs lg:text-sm">
              {selectedIds.length > 0 ? (
                <>
                  You are about to send QR code emails to <strong>{selectedIds.length}</strong> selected registrations.
                </>
              ) : (
                <>
                  You are about to send QR code emails to <strong>all registrations</strong> that have email addresses.
                </>
              )}
              <br /><br />
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="text-xs lg:text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendBulkEmails} className="text-xs lg:text-sm">
              <Mail className="mr-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
              Send Emails
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveLayout>
  )
}
