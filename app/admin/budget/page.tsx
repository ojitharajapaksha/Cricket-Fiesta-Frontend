'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Plus, TrendingUp, AlertTriangle, Loader2, Edit, Trash2, Receipt } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  description?: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXCEEDED' | 'CANCELLED';
  expenses: BudgetExpense[];
}

interface BudgetExpense {
  id: string;
  description: string;
  amount: number;
  receipt?: string;
  paidBy: string;
  paidDate: string;
}

interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
}

export default function BudgetManagementPage() {
  return (
    <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
      <BudgetManagementContent />
    </ProtectedRoute>
  );
}

function BudgetManagementContent() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({ totalAllocated: 0, totalSpent: 0, totalRemaining: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const [newBudget, setNewBudget] = useState({
    category: '',
    description: '',
    allocated: ''
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    receipt: '',
    paidBy: '',
    paidDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/budget`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setBudgets(data.data);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/budget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newBudget)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setIsAddDialogOpen(false);
      setNewBudget({ category: '', description: '', allocated: '' });
      fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/budget/${selectedBudget.id}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newExpense)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setIsExpenseDialogOpen(false);
      setSelectedBudget(null);
      setNewExpense({ description: '', amount: '', receipt: '', paidBy: '', paidDate: new Date().toISOString().split('T')[0] });
      fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/budget/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Delete failed');
      fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'EXCEEDED': return 'bg-red-500';
      case 'COMPLETED': return 'bg-blue-500';
      case 'CANCELLED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-muted-foreground mt-2">Manage event budget and track expenses</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Category</DialogTitle>
              <DialogDescription>Create a new budget category for the event</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={newBudget.category} onValueChange={(val) => setNewBudget({ ...newBudget, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                    <SelectItem value="Equipment & Gear">Equipment & Gear</SelectItem>
                    <SelectItem value="Venue & Facilities">Venue & Facilities</SelectItem>
                    <SelectItem value="Prizes & Awards">Prizes & Awards</SelectItem>
                    <SelectItem value="Marketing & Promotion">Marketing & Promotion</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Medical & Safety">Medical & Safety</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBudget.description}
                  onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                  placeholder="Brief description of this budget category..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocated">Allocated Amount (LKR) *</Label>
                <Input
                  id="allocated"
                  type="number"
                  step="0.01"
                  value={newBudget.allocated}
                  onChange={(e) => setNewBudget({ ...newBudget, allocated: e.target.value })}
                  placeholder="100000"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Budget</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAllocated)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((summary.totalSpent / summary.totalAllocated) * 100).toFixed(1)}% of total budget
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalRemaining < 0 ? 'text-red-500' : ''}`}>
              {formatCurrency(summary.totalRemaining)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>{budgets.length} categories with detailed expense tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => {
                const percentage = (budget.spent / budget.allocated) * 100;
                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">
                      {budget.category}
                      {budget.description && (
                        <p className="text-xs text-muted-foreground">{budget.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(budget.allocated)}</TableCell>
                    <TableCell>{formatCurrency(budget.spent)}</TableCell>
                    <TableCell className={budget.remaining < 0 ? 'text-red-500' : ''}>
                      {formatCurrency(budget.remaining)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs">{percentage.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(budget.status)}>
                        {budget.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBudget(budget);
                          setIsExpenseDialogOpen(true);
                        }}
                      >
                        <Receipt className="h-4 w-4 mr-1" />
                        Add Expense
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Add expense to {selectedBudget?.category}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense-description">Description *</Label>
              <Input
                id="expense-description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="e.g., Lunch catering for 200 people"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount (LKR) *</Label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-paidBy">Paid By *</Label>
              <Input
                id="expense-paidBy"
                value={newExpense.paidBy}
                onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                placeholder="Person or organization name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-date">Date Paid *</Label>
              <Input
                id="expense-date"
                type="date"
                value={newExpense.paidDate}
                onChange={(e) => setNewExpense({ ...newExpense, paidDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-receipt">Receipt URL (Optional)</Label>
              <Input
                id="expense-receipt"
                type="url"
                value={newExpense.receipt}
                onChange={(e) => setNewExpense({ ...newExpense, receipt: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Add Expense</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
