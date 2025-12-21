"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

/**
 * Payment Page - Placeholder
 *
 * The payment system is being upgraded to support multiple payment providers.
 * This page will be re-implemented once the new payment infrastructure is ready.
 */
export default function PaymentPage() {
  const router = useRouter();

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Payment System Upgrading</h1>
          <p className="text-text-secondary">
            We are currently upgrading our payment infrastructure to provide better service.
          </p>
        </div>

        {/* Info Card */}
        <Card className="neo-card-glass neo-shadow rounded-neo">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="heading-3">Temporary Unavailable</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Alert variant="warning">
                Our payment system is currently being upgraded to support multiple payment
                providers and improve security. This will allow us to offer more payment
                options and better service in the future.
              </Alert>

              <div className="text-sm text-text-secondary space-y-2">
                <p>
                  <strong>What this means for you:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Payment processing is temporarily unavailable</li>
                  <li>Your booking request has been saved</li>
                  <li>You will be notified when payment becomes available</li>
                  <li>No action is required from you at this time</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-text-secondary mb-4">
                  We apologize for any inconvenience. The payment system will be restored
                  shortly with enhanced features and better security.
                </p>

                <Button
                  variant="primary"
                  onClick={() => router.push("/customer/bookings")}
                  className="w-full"
                >
                  View My Bookings
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
