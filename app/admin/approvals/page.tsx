'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Loader2, History, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  traineeId: string;
  approvalStatus: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

interface ApprovalHistoryItem {
  id: string;
  action: string;
  reason?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    traineeId: string;
  };
  performer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminApprovalsPage() {
  return (
    <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
      <AdminApprovalsContent />
    </ProtectedRoute>
  );
}

function AdminApprovalsContent() {
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([]);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const [history, setHistory] = useState<ApprovalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  // Dialog state for restriction
  const [restrictDialog, setRestrictDialog] = useState<{ open: boolean; admin: Admin | null }>({
    open: false,
    admin: null,
  });
  const [restrictReason, setRestrictReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Fetch all data in parallel
      const [pendingRes, allRes, historyRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/approval-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [pendingData, allData, historyData] = await Promise.all([
        pendingRes.json(),
        allRes.json(),
        historyRes.json(),
      ]);

      if (pendingRes.ok) setPendingAdmins(pendingData.data.admins);
      if (allRes.ok) setAllAdmins(allData.data.admins);
      if (historyRes.ok) setHistory(historyData.data.history);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    setProcessing(id);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/${id}/approval`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, reason }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Approval failed');
      }

      // Refresh all data
      await fetchData();
      setRestrictDialog({ open: false, admin: null });
      setRestrictReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to process approval');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Approvals</h1>
        <p className="text-muted-foreground mt-2">
          Manage organizing committee member access and view approval history
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingAdmins.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            All Admins ({allAdmins.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                {pendingAdmins.length} organizing committee member{pendingAdmins.length !== 1 ? 's' : ''} awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAdmins.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending approvals at this time</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trainee ID</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.firstName} {admin.lastName}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{admin.traineeId}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(admin.createdAt)}</TableCell>
                        <TableCell>{getStatusBadge(admin.approvalStatus)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproval(admin.id, 'APPROVED')}
                            disabled={processing === admin.id}
                          >
                            {processing === admin.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproval(admin.id, 'REJECTED')}
                            disabled={processing === admin.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Admins Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Admin Accounts</CardTitle>
              <CardDescription>
                Manage all organizing committee member accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allAdmins.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No admin accounts found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trainee ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Action</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.firstName} {admin.lastName}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{admin.traineeId}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(admin.approvalStatus)}</TableCell>
                        <TableCell>
                          {admin.approvedAt ? formatDate(admin.approvedAt) : '-'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {admin.approvalStatus === 'APPROVED' ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRestrictDialog({ open: true, admin })}
                              disabled={processing === admin.id}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Restrict
                            </Button>
                          ) : admin.approvalStatus === 'REJECTED' ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproval(admin.id, 'APPROVED')}
                              disabled={processing === admin.id}
                            >
                              {processing === admin.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Re-approve
                                </>
                              )}
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproval(admin.id, 'APPROVED')}
                                disabled={processing === admin.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleApproval(admin.id, 'REJECTED')}
                                disabled={processing === admin.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>
                Complete history of all approval actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No approval history yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.user.firstName} {item.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.action)}</TableCell>
                        <TableCell>
                          {item.performer.firstName} {item.performer.lastName}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.reason || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Restrict Dialog */}
      <Dialog open={restrictDialog.open} onOpenChange={(open) => setRestrictDialog({ open, admin: open ? restrictDialog.admin : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restrict Admin Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to restrict access for{' '}
              <strong>{restrictDialog.admin?.firstName} {restrictDialog.admin?.lastName}</strong>?
              They will no longer be able to access admin features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                placeholder="Enter reason for restriction..."
                value={restrictReason}
                onChange={(e) => setRestrictReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestrictDialog({ open: false, admin: null });
                setRestrictReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (restrictDialog.admin) {
                  handleApproval(restrictDialog.admin.id, 'REJECTED', restrictReason);
                }
              }}
              disabled={processing === restrictDialog.admin?.id}
            >
              {processing === restrictDialog.admin?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserX className="h-4 w-4 mr-2" />
              )}
              Restrict Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
