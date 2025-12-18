import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, FileText, Trash2, Plus, Search, CreditCard, TrendingUp, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllPayments, addPayment, updatePayment, Payment } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import { formatCurrency } from "@/lib/currency";

const AdminPayments = () => {
  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [newPayment, setNewPayment] = useState({
    userName: "",
    amount: "",
    type: "membership" as "membership" | "personal-training" | "class" | "equipment",
    paymentMethod: "credit-card",
    description: "",
    status: "pending" as "pending" | "completed" | "failed" | "refunded"
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const paymentData = await getAllPayments();
      setPayments(paymentData);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.userName || !newPayment.amount || !currentUser) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setAdding(true);

      const paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: 'admin-created',
        userName: newPayment.userName,
        amount: amount,
        type: newPayment.type,
        status: newPayment.status,
        paymentMethod: newPayment.paymentMethod,
        description: newPayment.description || `${newPayment.type} payment`,
        paidDate: newPayment.status === 'completed' ? Timestamp.now() : undefined
      };

      await addPayment(paymentData);
      await fetchPayments();

      // Reset form
      setNewPayment({
        userName: "",
        amount: "",
        type: "membership",
        paymentMethod: "credit-card",
        description: "",
        status: "pending"
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Payment record added successfully!",
      });

    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Error",
        description: "Failed to add payment record",
        variant: "destructive"
      });
    } finally {
      setAdding(false);
    }
  };

  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: "pending" | "completed" | "failed" | "refunded") => {
    try {
      setUpdating(true);
      
      const updates: Partial<Payment> = {
        status: newStatus,
        ...(newStatus === 'completed' && { paidDate: Timestamp.now() })
      };

      await updatePayment(paymentId, updates);
      await fetchPayments();

      toast({
        title: "Success",
        description: `Payment status updated to ${newStatus}`,
      });

    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEditPayment = async () => {
    if (!selectedPayment) return;

    try {
      setUpdating(true);
      
      await updatePayment(selectedPayment.id!, {
        userName: selectedPayment.userName,
        amount: selectedPayment.amount,
        type: selectedPayment.type,
        paymentMethod: selectedPayment.paymentMethod,
        description: selectedPayment.description,
        status: selectedPayment.status,
        ...(selectedPayment.status === 'completed' && !selectedPayment.paidDate && { paidDate: Timestamp.now() })
      });

      await fetchPayments();
      setIsEditDialogOpen(false);
      setSelectedPayment(null);

      toast({
        title: "Success",
        description: "Payment updated successfully!",
      });

    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleInvoice = (payment: Payment) => {
    toast({
      title: "Invoice Generated",
      description: `Invoice for payment ${payment.id} would be downloaded`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-500 text-white">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'membership':
        return 'text-blue-400';
      case 'personal-training':
        return 'text-green-400';
      case 'class':
        return 'text-purple-400';
      case 'equipment':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paymentStats = {
    total: payments.reduce((sum, p) => sum + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    count: payments.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(paymentStats.total)}</p>
              </div>
              <span className="h-8 w-8 text-green-500 font-bold text-lg">₨</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(paymentStats.completed)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(paymentStats.pending)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{paymentStats.count}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Management */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl text-white">Payment Management</CardTitle>
            
            <div className="flex items-center gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Add Payment Record</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userName">Member Name</Label>
                      <Input
                        id="userName"
                        value={newPayment.userName}
                        onChange={(e) => setNewPayment({...newPayment, userName: e.target.value})}
                        className="bg-gray-700 border-gray-600"
                        placeholder="Enter member name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                      <Label htmlFor="amount">Amount (Rs.)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                        className="bg-gray-700 border-gray-600"
                        placeholder="0.00"
                        min="0"
                        step="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Payment Type</Label>
                        <Select value={newPayment.type} onValueChange={(value: "membership" | "personal-training" | "class" | "equipment") => setNewPayment({...newPayment, type: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="membership" className="text-white hover:bg-gray-600">Membership</SelectItem>
                            <SelectItem value="personal-training" className="text-white hover:bg-gray-600">Personal Training</SelectItem>
                            <SelectItem value="class" className="text-white hover:bg-gray-600">Class Fee</SelectItem>
                            <SelectItem value="equipment" className="text-white hover:bg-gray-600">Equipment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select value={newPayment.paymentMethod} onValueChange={(value) => setNewPayment({...newPayment, paymentMethod: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="credit-card" className="text-white hover:bg-gray-600">Credit Card</SelectItem>
                            <SelectItem value="debit-card" className="text-white hover:bg-gray-600">Debit Card</SelectItem>
                            <SelectItem value="cash" className="text-white hover:bg-gray-600">Cash</SelectItem>
                            <SelectItem value="bank-transfer" className="text-white hover:bg-gray-600">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={newPayment.status} onValueChange={(value: "pending" | "completed" | "failed" | "refunded") => setNewPayment({...newPayment, status: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="pending" className="text-white hover:bg-gray-600">Pending</SelectItem>
                            <SelectItem value="completed" className="text-white hover:bg-gray-600">Completed</SelectItem>
                            <SelectItem value="failed" className="text-white hover:bg-gray-600">Failed</SelectItem>
                            <SelectItem value="refunded" className="text-white hover:bg-gray-600">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newPayment.description}
                        onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                        className="bg-gray-700 border-gray-600"
                        placeholder="Payment description"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleAddPayment} disabled={adding} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        {adding ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Payment
                          </>
                        )}
                      </Button>
                      <Button onClick={() => setIsAddDialogOpen(false)} variant="outline" className="flex-1 border-gray-600">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white hover:bg-gray-600">All Status</SelectItem>
                <SelectItem value="completed" className="text-white hover:bg-gray-600">Completed</SelectItem>
                <SelectItem value="pending" className="text-white hover:bg-gray-600">Pending</SelectItem>
                <SelectItem value="failed" className="text-white hover:bg-gray-600">Failed</SelectItem>
                <SelectItem value="refunded" className="text-white hover:bg-gray-600">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchPayments} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Member</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Method</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="text-white">
                        {payment.paidDate ? 
                          new Date(payment.paidDate.seconds * 1000).toLocaleDateString() : 
                          new Date(payment.createdAt.seconds * 1000).toLocaleDateString()
                        }
                      </TableCell>
                      <TableCell className="text-white font-medium">{payment.userName}</TableCell>
                      <TableCell className="text-white font-semibold">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className={`capitalize ${getPaymentTypeColor(payment.type)}`}>
                        {payment.type.replace('-', ' ')}
                      </TableCell>
                      <TableCell className="text-gray-300 capitalize">
                        {payment.paymentMethod.replace('-', ' ')}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={payment.status}
                          onValueChange={(value: "pending" | "completed" | "failed" | "refunded") => 
                            handleUpdatePaymentStatus(payment.id!, value)
                          }
                          disabled={updating}
                        >
                          <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="pending" className="text-white hover:bg-gray-600">Pending</SelectItem>
                            <SelectItem value="completed" className="text-white hover:bg-gray-600">Completed</SelectItem>
                            <SelectItem value="failed" className="text-white hover:bg-gray-600">Failed</SelectItem>
                            <SelectItem value="refunded" className="text-white hover:bg-gray-600">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                          onClick={() => handleInvoice(payment)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                      {searchTerm || statusFilter !== "all" ? 'No payments found matching your criteria.' : 'No payments found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-userName">Member Name</Label>
                <Input
                  id="edit-userName"
                  value={selectedPayment.userName}
                  onChange={(e) => setSelectedPayment({...selectedPayment, userName: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-amount">Amount (Rs.)</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={selectedPayment.amount}
                    onChange={(e) => setSelectedPayment({...selectedPayment, amount: parseFloat(e.target.value) || 0})}
                    className="bg-gray-700 border-gray-600"
                    min="0"
                    step="1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Payment Type</Label>
                  <Select value={selectedPayment.type} onValueChange={(value: "membership" | "personal-training" | "class" | "equipment") => setSelectedPayment({...selectedPayment, type: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="membership" className="text-white hover:bg-gray-600">Membership</SelectItem>
                      <SelectItem value="personal-training" className="text-white hover:bg-gray-600">Personal Training</SelectItem>
                      <SelectItem value="class" className="text-white hover:bg-gray-600">Class Fee</SelectItem>
                      <SelectItem value="equipment" className="text-white hover:bg-gray-600">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-paymentMethod">Payment Method</Label>
                  <Select value={selectedPayment.paymentMethod} onValueChange={(value) => setSelectedPayment({...selectedPayment, paymentMethod: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="credit-card" className="text-white hover:bg-gray-600">Credit Card</SelectItem>
                      <SelectItem value="debit-card" className="text-white hover:bg-gray-600">Debit Card</SelectItem>
                      <SelectItem value="cash" className="text-white hover:bg-gray-600">Cash</SelectItem>
                      <SelectItem value="bank-transfer" className="text-white hover:bg-gray-600">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={selectedPayment.status} onValueChange={(value: "pending" | "completed" | "failed" | "refunded") => setSelectedPayment({...selectedPayment, status: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="pending" className="text-white hover:bg-gray-600">Pending</SelectItem>
                      <SelectItem value="completed" className="text-white hover:bg-gray-600">Completed</SelectItem>
                      <SelectItem value="failed" className="text-white hover:bg-gray-600">Failed</SelectItem>
                      <SelectItem value="refunded" className="text-white hover:bg-gray-600">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={selectedPayment.description}
                  onChange={(e) => setSelectedPayment({...selectedPayment, description: e.target.value})}
                  className="bg-gray-700 border-gray-600"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleEditPayment} disabled={updating} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update Payment
                    </>
                  )}
                </Button>
                <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayments;