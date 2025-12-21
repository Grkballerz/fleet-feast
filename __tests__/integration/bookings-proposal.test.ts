/**
 * Integration Tests for POST /api/bookings/:id/proposal
 * Tests vendor proposal sending endpoint
 */

import { UserRole, BookingStatus, NotificationType } from "@prisma/client";
import { POST as proposalHandler } from "@/app/api/bookings/[id]/proposal/route";
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
import { testBookingInquiry } from "../fixtures/bookings";

// Import mocks
import "../mocks/sendgrid";
import "../mocks/nextauth";

const prisma = getTestPrisma();
const baseUrl = "http://localhost:3000";

describe("POST /api/bookings/:id/proposal - Vendor Send Proposal", () => {
  let customer: any;
  let vendorUser: any;
  let vendor: any;
  let inquiry: any;

  const validProposal = {
    proposalAmount: 200000, // $2000.00
    proposalDetails: {
      lineItems: [
        { name: "Tacos", quantity: 50, unitPrice: 2000, total: 100000 },
        { name: "Burritos", quantity: 50, unitPrice: 2000, total: 100000 },
      ],
      inclusions: ["Plates", "Napkins", "Utensils", "Setup/Cleanup"],
      terms: "Payment due 48 hours before event",
    },
    expiresInDays: 7,
  };

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

    // Create test inquiry (booking with INQUIRY status)
    inquiry = await prisma.booking.create({
      data: {
        ...testBookingInquiry,
        customerId: customer.id,
        vendorId: vendorUser.id,
      } as any,
    });
  });

  describe("Authentication & Authorization", () => {
    it("should return 401 when not authenticated", async () => {
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        validProposal
        // No session provided
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      expect(response.status).toBe(401);
    });

    it("should return 403 when user is not the assigned vendor", async () => {
      // Create another vendor
      const otherVendorUser = await prisma.user.create({
        data: {
          id: "other-vendor-user-001",
          email: "other-vendor@test.com",
          role: UserRole.VENDOR,
          passwordHash: "$2a$12$test",
        } as any,
      });

      const session = createMockSession(otherVendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain("Only the assigned vendor");
    });

    it("should allow assigned vendor to send proposal", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      expect(response.status).toBe(200);
    });

    it("should return 403 when customer tries to send proposal", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.message).toContain("Only the assigned vendor");
    });
  });

  describe("Booking Validation", () => {
    it("should return 400 for invalid booking ID format", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/invalid-id/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: "invalid-id" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("Invalid booking ID format");
    });

    it("should return 404 for non-existent booking", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${nonExistentId}/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: nonExistentId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.message).toContain("not found");
    });

    it("should return 400 when booking status is not INQUIRY", async () => {
      // Update booking to PROPOSAL_SENT status
      await prisma.booking.update({
        where: { id: inquiry.id },
        data: { status: BookingStatus.PROPOSAL_SENT },
      });

      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("Booking status must be INQUIRY");
      expect(data.error.message).toContain("PROPOSAL_SENT");
    });
  });

  describe("Proposal Validation", () => {
    it("should reject missing required fields", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          // Missing proposalAmount and proposalDetails
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.fields).toBeDefined();
    });

    it("should reject zero proposal amount", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          proposalAmount: 0,
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.proposalAmount).toBeDefined();
      expect(data.error.fields.proposalAmount[0]).toContain("positive");
    });

    it("should reject negative proposal amount", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          proposalAmount: -100,
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.proposalAmount).toBeDefined();
    });

    it("should reject proposal amount above maximum ($1,000,000)", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          proposalAmount: 100000001, // $1,000,000.01
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.proposalAmount).toBeDefined();
      expect(data.error.fields.proposalAmount[0]).toContain("cannot exceed 1,000,000");
    });

    it("should reject empty line items array", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          proposalDetails: {
            ...validProposal.proposalDetails,
            lineItems: [],
          },
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(JSON.stringify(data.error.fields)).toContain("At least one line item");
    });

    it("should reject line item with negative quantity", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          proposalDetails: {
            ...validProposal.proposalDetails,
            lineItems: [
              { name: "Invalid", quantity: -1, unitPrice: 1000, total: -1000 },
            ],
          },
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      expect(response.status).toBe(400);
    });

    it("should reject empty inclusions array", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          proposalDetails: {
            ...validProposal.proposalDetails,
            inclusions: [],
          },
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(JSON.stringify(data.error.fields)).toContain("At least one inclusion");
    });

    it("should reject expiration less than 1 day", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          expiresInDays: 0,
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.expiresInDays).toBeDefined();
      expect(data.error.fields.expiresInDays[0]).toContain("at least 1 day");
    });

    it("should reject expiration more than 30 days", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          expiresInDays: 31,
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.expiresInDays).toBeDefined();
      expect(data.error.fields.expiresInDays[0]).toContain("cannot exceed 30 days");
    });
  });

  describe("Successful Proposal Submission", () => {
    it("should update booking status to PROPOSAL_SENT", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await expectResponse(response, 200);

      expect(data.status).toBe(BookingStatus.PROPOSAL_SENT);
      expect(data.id).toBe(inquiry.id);
    });

    it("should calculate platform fees correctly (5% customer + 5% vendor)", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          proposalAmount: 200000, // $2000.00
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await expectResponse(response, 200);

      expect(data.proposalAmount).toBe(200000);
      expect(data.platformFeeCustomer).toBe(10000); // 5% of 200000
      expect(data.platformFeeVendor).toBe(10000); // 5% of 200000
      expect(data.totalAmount).toBe(210000); // 200000 + 10000
      expect(data.vendorPayout).toBe(190000); // 200000 - 10000
    });

    it("should save all proposal details to database", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      await expectResponse(response, 200);

      // Verify in database
      const booking = await prisma.booking.findUnique({
        where: { id: inquiry.id },
      });

      expect(booking?.status).toBe(BookingStatus.PROPOSAL_SENT);
      expect(booking?.proposalAmount).toBe(200000);
      expect(booking?.proposalDetails).toEqual(validProposal.proposalDetails);
      expect(booking?.proposalSentAt).toBeTruthy();
      expect(booking?.proposalExpiresAt).toBeTruthy();
      expect(booking?.platformFeeCustomer).toBe(10000);
      expect(booking?.platformFeeVendor).toBe(10000);
      expect(booking?.totalAmount).toBe(210000);
      expect(booking?.vendorPayout).toBe(190000);
    });

    it("should calculate correct expiration date", async () => {
      const beforeSend = new Date();
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        {
          ...validProposal,
          expiresInDays: 7,
        },
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      await expectResponse(response, 200);

      const booking = await prisma.booking.findUnique({
        where: { id: inquiry.id },
      });

      const expiresAt = new Date(booking!.proposalExpiresAt!);
      const expectedExpiry = new Date(beforeSend);
      expectedExpiry.setDate(expectedExpiry.getDate() + 7);

      // Allow 1 minute margin for test execution time
      const timeDiff = Math.abs(expiresAt.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(60000); // Less than 1 minute
    });

    it("should create notification for customer", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      await expectResponse(response, 200);

      // Verify notification was created for customer
      const notification = await prisma.notification.findFirst({
        where: {
          userId: customer.id,
          type: NotificationType.PROPOSAL_SENT,
        },
      });

      expect(notification).toBeTruthy();
      expect(notification?.title).toContain("New Proposal");
      expect(notification?.message).toContain(vendor.businessName);
      expect(notification?.link).toContain(`/customer/bookings/${inquiry.id}`);
      expect(notification?.metadata).toMatchObject({
        bookingId: inquiry.id,
        vendorName: vendor.businessName,
        proposalAmount: "200000",
        totalAmount: "210000",
      });
    });

    it("should use default expiration of 7 days if not provided", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const proposalWithoutExpiry = {
        proposalAmount: validProposal.proposalAmount,
        proposalDetails: validProposal.proposalDetails,
        // expiresInDays omitted
      };

      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        proposalWithoutExpiry,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      await expectResponse(response, 200);

      const booking = await prisma.booking.findUnique({
        where: { id: inquiry.id },
      });

      const expiresAt = new Date(booking!.proposalExpiresAt!);
      const sentAt = new Date(booking!.proposalSentAt!);
      const daysDiff = Math.floor((expiresAt.getTime() - sentAt.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBe(7);
    });

    it("should accept proposal without terms", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const proposalWithoutTerms = {
        ...validProposal,
        proposalDetails: {
          lineItems: validProposal.proposalDetails.lineItems,
          inclusions: validProposal.proposalDetails.inclusions,
          // terms omitted
        },
      };

      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        proposalWithoutTerms,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      await expectResponse(response, 200);

      const booking = await prisma.booking.findUnique({
        where: { id: inquiry.id },
      });

      expect(booking?.proposalDetails).toBeTruthy();
      expect((booking?.proposalDetails as any).terms).toBeUndefined();
    });

    it("should return formatted proposal response", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/bookings/${inquiry.id}/proposal`,
        validProposal,
        session
      );

      const response = await proposalHandler(request, { params: { id: inquiry.id } });
      const data = await expectResponse(response, 200);

      expect(data).toMatchObject({
        id: inquiry.id,
        status: BookingStatus.PROPOSAL_SENT,
        proposalAmount: 200000,
        platformFeeCustomer: 10000,
        platformFeeVendor: 10000,
        totalAmount: 210000,
        vendorPayout: 190000,
      });
      expect(data.proposalExpiresAt).toBeDefined();
    });
  });
});
