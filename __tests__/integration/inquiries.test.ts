/**
 * Integration Tests for POST /api/inquiries
 * Tests customer inquiry submission endpoint
 */

import { UserRole, BookingStatus, VendorStatus, NotificationType } from "@prisma/client";
import { POST as inquiriesHandler } from "@/app/api/inquiries/route";
import { getTestPrisma, clearDatabase } from "../setup/database";
import {
  createPostRequest,
  createMockSession,
  expectResponse,
} from "../setup/server";
import {
  testCustomer,
  testVendorUser,
  testAdmin,
} from "../fixtures/users";
import { testVendor } from "../fixtures/vendors";

// Import mocks
import "../mocks/sendgrid";
import "../mocks/nextauth";

const prisma = getTestPrisma();
const baseUrl = "http://localhost:3000";

describe("POST /api/inquiries - Submit Customer Inquiry", () => {
  let customer: any;
  let vendorUser: any;
  let vendor: any;

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
        status: VendorStatus.APPROVED,
      } as any,
    });
  });

  describe("Authentication & Authorization", () => {
    it("should return 401 when not authenticated", async () => {
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        }
        // No session provided
      );

      const response = await inquiriesHandler(request);
      expect(response.status).toBe(401);
    });

    it("should return 403 when user is not a customer", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR, vendorUser.email);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
      expect(data.error.message).toContain("Only customers");
    });

    it("should allow customer to submit inquiry", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER, customer.email);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      expect(response.status).toBe(201);
    });
  });

  describe("Vendor Validation", () => {
    it("should return 404 for invalid vendor ID format", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: "invalid-uuid",
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      expect(response.status).toBe(400);
    });

    it("should return 404 for non-existent vendor", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const nonExistentVendorId = "123e4567-e89b-12d3-a456-426614174999";
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: nonExistentVendorId,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.message).toContain("Vendor");
    });

    it("should return 400 for non-approved vendor", async () => {
      // Create pending vendor
      const pendingVendor = await prisma.vendor.create({
        data: {
          ...testVendor,
          id: "pending-vendor-123",
          userId: vendorUser.id,
          status: VendorStatus.PENDING,
        } as any,
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: pendingVendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("not currently accepting bookings");
    });
  });

  describe("Request Validation", () => {
    it("should reject missing required fields", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          // Missing eventDate, eventTime, eventType, location, guestCount
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.fields).toBeDefined();
    });

    it("should reject past event date", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2020-01-01",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.eventDate).toBeDefined();
      expect(data.error.fields.eventDate[0]).toContain("future");
    });

    it("should reject invalid event date format", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "12/25/2025", // Wrong format
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.eventDate).toBeDefined();
      expect(data.error.fields.eventDate[0]).toContain("YYYY-MM-DD");
    });

    it("should reject guest count below minimum (1)", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 0,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.guestCount).toBeDefined();
      expect(data.error.fields.guestCount[0]).toContain("at least 1");
    });

    it("should reject guest count above maximum (10,000)", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 10001,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.guestCount).toBeDefined();
      expect(data.error.fields.guestCount[0]).toContain("cannot exceed 10,000");
    });

    it("should reject invalid event type", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "INVALID_TYPE",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.eventType).toBeDefined();
    });

    it("should reject location shorter than 5 characters", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "ABC", // Too short
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.fields?.location).toBeDefined();
      expect(data.error.fields.location[0]).toContain("at least 5 characters");
    });
  });

  describe("Successful Inquiry Creation", () => {
    it("should create inquiry with INQUIRY status", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street, City, State 12345",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.id).toBeDefined();
      expect(data.status).toBe(BookingStatus.INQUIRY);
      expect(data.createdAt).toBeDefined();
      expect(data.message).toContain("successfully");
    });

    it("should create inquiry with correct data in database", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const inquiryData = {
        vendorId: vendor.id,
        eventDate: "2025-12-25",
        eventTime: "18:00",
        eventType: "WEDDING",
        location: "123 Main Street, City, State 12345",
        guestCount: 100,
        specialRequests: "Need vegetarian options",
      };

      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        inquiryData,
        session
      );

      const response = await inquiriesHandler(request);
      const data = await expectResponse(response, 201);

      // Verify in database
      const booking = await prisma.booking.findUnique({
        where: { id: data.id },
      });

      expect(booking).toBeTruthy();
      expect(booking?.status).toBe(BookingStatus.INQUIRY);
      expect(booking?.customerId).toBe(customer.id);
      expect(booking?.vendorId).toBe(vendorUser.id); // Uses vendor's userId
      expect(booking?.guestCount).toBe(100);
      expect(booking?.eventTime).toBe("18:00");
      expect(booking?.eventType).toBe("WEDDING");
      expect(booking?.location).toBe(inquiryData.location);
      expect(booking?.specialRequests).toBe("Need vegetarian options");
      expect(booking?.totalAmount).toBe(0); // Initially 0
      expect(booking?.platformFee).toBe(0);
      expect(booking?.vendorPayout).toBe(0);
    });

    it("should accept inquiry with optional special requests", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
          specialRequests: "Gluten-free options required",
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await expectResponse(response, 201);

      const booking = await prisma.booking.findUnique({
        where: { id: data.id },
      });

      expect(booking?.specialRequests).toBe("Gluten-free options required");
    });

    it("should accept inquiry without special requests", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
          // No specialRequests field
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await expectResponse(response, 201);

      const booking = await prisma.booking.findUnique({
        where: { id: data.id },
      });

      expect(booking?.specialRequests).toBeNull();
    });

    it("should create notification for vendor", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: "2025-12-25",
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      const data = await expectResponse(response, 201);

      // Verify notification was created for vendor
      const notification = await prisma.notification.findFirst({
        where: {
          userId: vendorUser.id,
          type: NotificationType.INQUIRY_RECEIVED,
        },
      });

      expect(notification).toBeTruthy();
      expect(notification?.title).toContain("New Inquiry");
      expect(notification?.message).toContain("WEDDING");
      expect(notification?.message).toContain("2025-12-25");
      expect(notification?.link).toContain(`/vendor/bookings/${data.id}`);
      expect(notification?.metadata).toMatchObject({
        bookingId: data.id,
        eventType: "WEDDING",
        eventDate: "2025-12-25",
        guestCount: 100,
      });
    });

    it("should accept today as valid event date", async () => {
      const today = new Date().toISOString().split("T")[0];
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/inquiries`,
        {
          vendorId: vendor.id,
          eventDate: today,
          eventTime: "18:00",
          eventType: "WEDDING",
          location: "123 Main Street",
          guestCount: 100,
        },
        session
      );

      const response = await inquiriesHandler(request);
      expect(response.status).toBe(201);
    });

    it("should accept all valid event types", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const eventTypes = ["WEDDING", "CORPORATE", "BIRTHDAY", "FESTIVAL", "OTHER"];

      for (const eventType of eventTypes) {
        const request = createPostRequest(
          `${baseUrl}/api/inquiries`,
          {
            vendorId: vendor.id,
            eventDate: "2025-12-25",
            eventTime: "18:00",
            eventType,
            location: "123 Main Street",
            guestCount: 100,
          },
          session
        );

        const response = await inquiriesHandler(request);
        expect(response.status).toBe(201);
      }
    });
  });
});
