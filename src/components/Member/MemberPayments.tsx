import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addPayment, getPaymentsByUser, Payment } from "@/lib/firestore";
import { Loader2, CreditCard, Calendar } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { formatCurrency } from "@/lib/currency";

const MemberPayments = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [paymentType, setPaymentType] = useState("membership");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchPayments();
    }
  }, [currentUser]);

  const fetchPayments = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userPayments = await getPaymentsByUser(currentUser.uid);
      setPayments(userPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!amount || !method || !currentUser || !userProfile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);

      const paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: currentUser.uid,
        userName: userProfile.displayName || 'Unknown User',
        amount: paymentAmount,
        type: paymentType as 'membership' | 'personal-training' | 'class' | 'equipment',
        status: 'completed', // In a real app, this would be 'pending' until payment is processed
        paymentMethod: method,
        description: description || `${paymentType} payment`,
        paidDate: Timestamp.now()
      };

      await addPayment(paymentData);
      await fetchPayments(); // Refresh the list

      // Reset form
      setAmount("");
      setMethod("");
      setPaymentType("membership");
      setDescription("");

      toast({
        title: "Success",
        description: `Payment of ${formatCurrency(paymentAmount)} has been processed successfully!`,
      });

    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <span className="h-8 w-8 text-green-500 font-bold text-lg">₨</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{payments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Make Payment Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-500" />
            Make a Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Amount (Rs.)</label>
              <Input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Payment Method</label>
              <Select onValueChange={(value) => setMethod(value)} value={method}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="credit-card" className="text-white hover:bg-gray-600">Credit Card</SelectItem>
                  <SelectItem value="debit-card" className="text-white hover:bg-gray-600">Debit Card</SelectItem>
                  <SelectItem value="bank-transfer" className="text-white hover:bg-gray-600">Bank Transfer</SelectItem>
                  <SelectItem value="cash" className="text-white hover:bg-gray-600">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Payment Type</label>
              <Select onValueChange={(value) => setPaymentType(value)} value={paymentType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="membership" className="text-white hover:bg-gray-600">Membership Fee</SelectItem>
                  <SelectItem value="personal-training" className="text-white hover:bg-gray-600">Personal Training</SelectItem>
                  <SelectItem value="class" className="text-white hover:bg-gray-600">Class Fee</SelectItem>
                  <SelectItem value="equipment" className="text-white hover:bg-gray-600">Equipment Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Description (Optional)</label>
              <Input
                placeholder="Payment description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Payment History Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No payments yet.</p>
              <p className="text-sm text-gray-500">Your payment history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">Method</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="text-white">
                        {payment.paidDate ? 
                          new Date(payment.paidDate.seconds * 1000).toLocaleDateString() : 
                          new Date(payment.createdAt.seconds * 1000).toLocaleDateString()
                        }
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className={`capitalize ${getPaymentTypeColor(payment.type)}`}>
                        {payment.type.replace('-', ' ')}
                      </TableCell>
                      <TableCell className="text-gray-300 capitalize">
                        {payment.paymentMethod.replace('-', ' ')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {payment.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberPayments;