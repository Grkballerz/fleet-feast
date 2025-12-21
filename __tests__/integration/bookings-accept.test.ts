/**
 * Integration Tests for POST /api/bookings/:id/accept
 * Tests customer proposal acceptance endpoint
 */

import { UserRole, BookingStatus } from "@prisma/client";
import { POST as acceptHandler } from "@/app/api/bookings/[id]/accept/route";
import { getTestPrisma, clearDatabase } from "../setup/database";
import {
  createPostRequest,
  createMockSession,
  expectResponse,
} from "../setup/server";
import {
  testCustomer,
  testVendorUser,
} from "../fixtures/users";
import { testVendor } from "../fixtures/vendors";
import { testBookingProposalSent } from "../fixtures/bookings";

// Import mocks
import "../mocks/sendgrid";
import "../mocks/nextauth";

const prisma = getTestPrisma();
const baseUrl = "http://localhost:3000";

describe("POST /api/bookings/:id/accept - Customer Accept Proposal", () => {
  let customer: any;
  let vendorUser: any;
  let vendor: any;
  let proposalBooking: any;

  beforeEach(async () => {
    await clearDatabase();

    // Create test customer
    customer = await prisma.user.create({
      data: {
        ...testCustomer,
        passwordHash: "$2a$12$test",
      } as any,
    });

    // Create test vendor user and vendor
    vendorUser = await prisma.user.create({
      data: {
        ...testVendorUser,
        passwordHash: "$2a$12$test",
      } as any,
    });

    vendor = await prisma.vendor.create({
      data: {
        ...testVendor,
        userId: vendorUser.id,
      } as any,
    });

    // Create booking with PROPOSAL_SENT status
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days in future

    proposalBooking = await prisma.booking.create({
      data: {
        ...testBookingProposalSent,
        customerId: customer.id,
        vendorId: vendorUser.id,
        proposalExpiresAt: futureDate,
      } as any,
    });
  });

  describe("Authentication & Authorization", () => {
    it("should return 401 when not authenticated", async () => {
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true }
        // No session provided
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      expect(response.status).toBe(401);
    });

    it("should return 403 when user is not the customer", async () => {
      // Try to accept as vendor
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain("permission");
    });

    it("should return 403 when customer is not the owner", async () => {
      // Create another customer
      const otherCustomer = await prisma.user.create({
        data: {
          id: "other-customer-001",
          email: "other-customer@test.com",
          role: UserRole.CUSTOMER,
          passwordHash: "$2a$12$test",
        } as any,
      });

      const session = createMockSession(otherCustomer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain("permission");
    });

    it("should allow customer owner to accept proposal", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      expect(response.status).toBe(200);
    });
  });

  describe("Booking Validation", () => {
    it("should return 400 for invalid booking ID format", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/invalid-id/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: "invalid-id" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("Invalid booking ID format");
    });

    it("should return 404 for non-existent booking", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${nonExistentId}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: nonExistentId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.message).toContain("not found");
    });

    it("should return 400 when booking status is not PROPOSAL_SENT", async () => {
      // Update booking to different status
      await prisma.booking.update({
        where: { id: proposalBooking.id },
        data: { status: BookingStatus.INQUIRY },
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("PROPOSAL_SENT");
    });

    it("should return 400 when proposal has expired", async () => {
      // Set expiration to past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday

      await prisma.booking.update({
        where: { id: proposalBooking.id },
        data: { proposalExpiresAt: pastDate },
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("expired");
    });

    it("should update booking to EXPIRED status when expired", async () => {
      // Set expiration to past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await prisma.booking.update({
        where: { id: proposalBooking.id },
        data: { proposalExpiresAt: pastDate },
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      await acceptHandler(request, { params: { id: proposalBooking.id } });

      // Verify booking status updated to EXPIRED
      const booking = await prisma.booking.findUnique({
        where: { id: proposalBooking.id },
      });

      expect(booking?.status).toBe(BookingStatus.EXPIRED);
    });

    it("should reject already accepted proposal", async () => {
      // First acceptance
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request1 = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      await acceptHandler(request1, { params: { id: proposalBooking.id } });

      // Try to accept again
      const request2 = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request2, { params: { id: proposalBooking.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("PROPOSAL_SENT");
    });
  });

  describe("Request Validation", () => {
    it("should accept empty request body", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        {}, // Empty body
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      expect(response.status).toBe(200);
    });

    it("should accept request with acceptTerms: true", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      expect(response.status).toBe(200);
    });

    it("should reject when acceptTerms is false", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: false },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("Successful Acceptance", () => {
    it("should update booking status to ACCEPTED", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      const data = await expectResponse(response, 200);

      expect(data.success).toBe(true);
      expect(data.data.status).toBe(BookingStatus.ACCEPTED);
      expect(data.data.id).toBe(proposalBooking.id);
    });

    it("should save acceptance data to database", async () => {
      const beforeAccept = new Date();
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      await expectResponse(response, 200);

      // Verify in database
      const booking = await prisma.booking.findUnique({
        where: { id: proposalBooking.id },
      });

      expect(booking?.status).toBe(BookingStatus.ACCEPTED);
      expect(booking?.acceptedAt).toBeTruthy();
      expect(booking?.acceptedAt!.getTime()).toBeGreaterThanOrEqual(beforeAccept.getTime());
    });

    it("should preserve proposal amounts and fees", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      await expectResponse(response, 200);

      const booking = await prisma.booking.findUnique({
        where: { id: proposalBooking.id },
      });

      expect(booking?.proposalAmount).toBe(testBookingProposalSent.proposalAmount);
      expect(booking?.platformFeeCustomer).toBe(testBookingProposalSent.platformFeeCustomer);
      expect(booking?.platformFeeVendor).toBe(testBookingProposalSent.platformFeeVendor);
      expect(booking?.totalAmount).toBe(testBookingProposalSent.totalAmount);
      expect(booking?.vendorPayout).toBe(testBookingProposalSent.vendorPayout);
    });

    it("should return payment URL in response", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      const data = await expectResponse(response, 200);

      expect(data.data.paymentUrl).toBeDefined();
      expect(typeof data.data.paymentUrl).toBe("string");
    });

    it("should include total amount in response", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      const data = await expectResponse(response, 200);

      expect(data.data.totalAmount).toBe(testBookingProposalSent.totalAmount);
    });

    it("should create notification for vendor", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      await expectResponse(response, 200);

      // Verify notification was created for vendor
      const notification = await prisma.notification.findFirst({
        where: {
          userId: vendorUser.id,
          type: "PROPOSAL_ACCEPTED" as any,
        },
      });

      expect(notification).toBeTruthy();
      expect(notification?.title).toContain("accepted");
      expect(notification?.link).toContain(`/vendor/bookings/${proposalBooking.id}`);
    });

    it("should accept proposal on the day it expires", async () => {
      // Set expiration to end of today
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      await prisma.booking.update({
        where: { id: proposalBooking.id },
        data: { proposalExpiresAt: today },
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${proposalBooking.id}/accept`,
        { acceptTerms: true },
        session
      );

      const response = await acceptHandler(request, { params: { id: proposalBooking.id } });
      expect(response.status).toBe(200);
    });
  });
});
