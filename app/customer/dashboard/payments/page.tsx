"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { PaymentStatus } from "@/types";

interface PaymentRecord {
  id: string;
  bookingId: string;
  vendorName: string;
  eventDate: Date;
  amount: number;
  platformFee: number;
  totalAmount: number;
  status: PaymentStatus;
  paymentMethod: string;
  last4: string;
  transactionDate: Date;
  receiptUrl?: string;
  refundAmount?: number;
  refundDate?: Date;
}

// Mock data - replace with real API calls
const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay_1",
    bookingId: "1",
    vendorName: "Taco Fiesta",
    eventDate: new Date("2025-12-15T14:00:00"),
    amount: 450,
    platformFee: 67.5,
    totalAmount: 517.5,
    status: PaymentStatus.CAPTURED,
    paymentMethod: "Visa",
    last4: "4242",
    transactionDate: new Date("2025-12-01T10:30:00"),
    receiptUrl: "/receipts/pay_1.pdf",
  },
  {
    id: "pay_2",
    bookingId: "2",
    vendorName: "Pizza Paradise",
    eventDate: new Date("2025-12-20T18:00:00"),
    amount: 320,
    platformFee: 48,
    totalAmount: 368,
    status: PaymentStatus.AUTHORIZED,
    paymentMethod: "Mastercard",
    last4: "5555",
    transactionDate: new Date("2025-11-28T14:15:00"),
    receiptUrl: "/receipts/pay_2.pdf",
  },
  {
    id: "pay_3",
    bookingId: "3",
    vendorName: "BBQ Bros",
    eventDate: new Date("2025-11-28T12:00:00"),
    amount: 1200,
    platformFee: 180,
    totalAmount: 1380,
    status: PaymentStatus.RELEASED,
    paymentMethod: "Visa",
    last4: "1234",
    transactionDate: new Date("2025-11-15T09:00:00"),
    receiptUrl: "/receipts/pay_3.pdf",
  },
  {
    id: "pay_4",
    bookingId: "4",
    vendorName: "Sweet Treats",
    eventDate: new Date("2025-11-01T15:00:00"),
    amount: 280,
    platformFee: 42,
    totalAmount: 322,
    status: PaymentStatus.REFUNDED,
    paymentMethod: "Amex",
    last4: "9999",
    transactionDate: new Date("2025-10-20T11:30:00"),
    receiptUrl: "/receipts/pay_4.pdf",
    refundAmount: 322,
    refundDate: new Date("2025-10-28T10:00:00"),
  },
  {
    id: "pay_5",
    bookingId: "5",
    vendorName: "Green Garden",
    eventDate: new Date("2025-10-15T12:00:00"),
    amount: 380,
    platformFee: 57,
    totalAmount: 437,
    status: PaymentStatus.RELEASED,
    paymentMethod: "Visa",
    last4: "7890",
    transactionDate: new Date("2025-10-05T16:45:00"),
    receiptUrl: "/receipts/pay_5.pdf",
  },
];

/**
 * Payments Page
 *
 * Display payment history with status, receipts, and refund information
 */
export default function PaymentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [filterStatus, setFilterStatus] = React.useState<PaymentStatus | "ALL">("ALL");

  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setPayments(MOCK_PAYMENTS);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    // TODO: Implement actual receipt download
    console.log("Download receipt for", payment.id);
    // In production, this would trigger a download or open PDF in new tab
    // window.open(payment.receiptUrl, '_blank');
  };

  const handleViewBooking = (bookingId: string) => {
    router.push(`/customer/bookings/${bookingId}`);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.CAPTURED:
      case PaymentStatus.RELEASED:
        return <Badge variant="success">{status}</Badge>;
      case PaymentStatus.AUTHORIZED:
      case PaymentStatus.PENDING:
        return <Badge variant="warning">{status}</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge variant="neutral">{status}</Badge>;
      case PaymentStatus.FAILED:
        return <Badge variant="error">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.CAPTURED:
      case PaymentStatus.RELEASED:
        return <CheckCircle className="w-5 h-5 text-success" />;
      case PaymentStatus.AUTHORIZED:
      case PaymentStatus.PENDING:
        return <Clock className="w-5 h-5 text-warning" />;
      case PaymentStatus.REFUNDED:
        return <CheckCircle className="w-5 h-5 text-text-secondary" />;
      case PaymentStatus.FAILED:
        return <XCircle className="w-5 h-5 text-error" />;
      default:
        return <Clock className="w-5 h-5 text-text-tertiary" />;
    }
  };

  const filteredPayments =
    filterStatus === "ALL"
      ? payments
      : payments.filter((p) => p.status === filterStatus);

  const totalSpent = payments
    .filter((p) => p.status !== PaymentStatus.REFUNDED && p.status !== PaymentStatus.FAILED)
    .reduce((sum, p) => sum + p.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error loading payment history">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Payment History</h1>
          <p className="text-text-secondary mt-1">
            View all your transactions and download receipts
          </p>
        </div>
        <Card className="p-4 sm:w-auto">
          <p className="text-text-secondary text-sm mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-text-primary">
            ${totalSpent.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === "ALL" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("ALL")}
          >
            All ({payments.length})
          </Button>
          <Button
            variant={filterStatus === PaymentStatus.CAPTURED ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(PaymentStatus.CAPTURED)}
          >
            Completed (
            {payments.filter((p) => p.status === PaymentStatus.CAPTURED).length})
          </Button>
          <Button
            variant={filterStatus === PaymentStatus.AUTHORIZED ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(PaymentStatus.AUTHORIZED)}
          >
            Pending (
            {payments.filter((p) => p.status === PaymentStatus.AUTHORIZED).length})
          </Button>
          <Button
            variant={filterStatus === PaymentStatus.REFUNDED ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(PaymentStatus.REFUNDED)}
          >
            Refunded (
            {payments.filter((p) => p.status === PaymentStatus.REFUNDED).length})
          </Button>
        </div>
      </Card>

      {/* Payment List */}
      {filteredPayments.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No payments found
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            {filterStatus === "ALL"
              ? "Your payment history will appear here after you make your first booking."
              : `No ${filterStatus.toLowerCase()} payments found.`}
          </p>
          {filterStatus !== "ALL" ? (
            <Button variant="outline" onClick={() => setFilterStatus("ALL")}>
              View All Payments
            </Button>
          ) : (
            <Button onClick={() => router.push("/search")}>
              Browse Food Trucks
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(payment.status)}
                </div>

                {/* Payment Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-text-primary text-lg">
                        {payment.vendorName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-text-primary">
                        ${payment.totalAmount.toFixed(2)}
                      </p>
                      {payment.status === PaymentStatus.REFUNDED && payment.refundAmount && (
                        <p className="text-sm text-success">
                          Refunded: ${payment.refundAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-text-secondary mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Event: {format(payment.eventDate, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Paid: {format(payment.transactionDate, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {payment.paymentMethod} •••• {payment.last4}
                      </span>
                    </div>
                    {payment.refundDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Refunded: {format(payment.refundDate, "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-3 bg-surface-secondary rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-text-secondary">Booking Amount:</span>
                      <span className="text-right text-text-primary">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <span className="text-text-secondary">Platform Fee (15%):</span>
                      <span className="text-right text-text-primary">
                        ${payment.platformFee.toFixed(2)}
                      </span>
                      <div className="col-span-2 border-t border-border pt-2 mt-1">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>${payment.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-2 lg:w-48">
                  {payment.receiptUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:w-full"
                      onClick={() => handleDownloadReceipt(payment)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Receipt
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 lg:w-full"
                    onClick={() => handleViewBooking(payment.bookingId)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Booking
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Alert */}
      {payments.length > 0 && (
        <Alert variant="info" title="Payment Information">
          All payments are securely processed through Stripe. Receipts are available
          for download after payment is processed. Funds are held in escrow until 3
          days after your event.
        </Alert>
      )}
    </div>
  );
}
