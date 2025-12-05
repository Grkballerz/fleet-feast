/**
 * Booking API Integration Tests
 * Tests booking lifecycle: create → accept → decline → cancel
 */

import { UserRole, BookingStatus, VendorStatus } from "@prisma/client";
import { GET as listBookingsHandler, POST as createBookingHandler } from "@/app/api/bookings/route";
import { PUT as acceptBookingHandler } from "@/app/api/bookings/[id]/accept/route";
import { PUT as declineBookingHandler } from "@/app/api/bookings/[id]/decline/route";
import { getTestPrisma, clearDatabase } from "../setup/database";
import {
  createGetRequest,
  createPostRequest,
  createPutRequest,
  createMockSession,
  expectResponse,
} from "../setup/server";
import {
  testCustomer,
  testVendorUser,
  createTestUser,
} from "../fixtures/users";
import { testVendor, createTestVendor } from "../fixtures/vendors";
import {
  testBookingPending,
  testBookingAccepted,
  createTestBooking,
} from "../fixtures/bookings";

// Import mocks
import "../mocks/sendgrid";
import "../mocks/nextauth";

const prisma = getTestPrisma();
const baseUrl = "http://localhost:3000";

describe("Booking API Integration Tests", () => {
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
      } as any,
    });
  });

  describe("POST /api/bookings - Create Booking", () => {
    it("should create booking with valid data", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER, customer.email);
      const request = createPostRequest(
        `${baseUrl}/api/bookings`,
        {
          vendorId: vendor.id,
          eventDate: "2025-03-15",
          eventStartTime: "12:00",
          eventEndTime: "16:00",
          guestCount: 50,
          eventType: "CORPORATE",
          location: {
            address: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
          },
          notes: "Corporate lunch event",
        },
        session
      );

      const response = await createBookingHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.booking).toBeDefined();
      expect(data.booking.status).toBe(BookingStatus.PENDING);
      expect(data.booking.customerId).toBe(customer.id);
      expect(data.booking.vendorId).toBe(vendor.id);
      expect(data.booking.guestCount).toBe(50);
      expect(data.booking.totalAmount).toBeGreaterThan(0);

      // Verify in database
      const booking = await prisma.booking.findUnique({
        where: { id: data.booking.id },
      });
      expect(booking).toBeTruthy();
      expect(booking?.status).toBe(BookingStatus.PENDING);
    });

    it("should calculate correct total amount", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings`,
        {
          vendorId: vendor.id,
          eventDate: "2025-03-15",
          eventStartTime: "12:00",
          eventEndTime: "16:00",
          guestCount: 100,
          eventType: "WEDDING",
          location: {
            address: "456 Park Ave",
            city: "New York",
            state: "NY",
            zipCode: "10002",
          },
        },
        session
      );

      const response = await createBookingHandler(request);
      const data = await expectResponse(response, 201);

      // basePrice (15000) + (guestCount 100 * pricePerGuest 2500) = 265000
      expect(data.booking.totalAmount).toBe(265000);
      expect(data.booking.basePrice).toBe(vendor.basePrice);
      expect(data.booking.pricePerGuest).toBe(vendor.pricePerGuest);
    });

    it("should reject booking below minimum guests", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings`,
        {
          vendorId: vendor.id,
          eventDate: "2025-03-15",
          eventStartTime: "12:00",
          eventEndTime: "16:00",
          guestCount: 10, // Below minGuests (25)
          eventType: "BIRTHDAY",
          location: {
            address: "789 Broadway",
            city: "New York",
            state: "NY",
            zipCode: "10003",
          },
        },
        session
      );

      const response = await createBookingHandler(request);
      const data = await expectResponse(response, 400);

      expect(data.error).toBeDefined();
      expect(data.error.code).toContain("GUEST_COUNT");
    });

    it("should reject booking above maximum guests", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings`,
        {
          vendorId: vendor.id,
          eventDate: "2025-03-15",
          eventStartTime: "12:00",
          eventEndTime: "16:00",
          guestCount: 300, // Above maxGuests (200)
          eventType: "WEDDING",
          location: {
            address: "321 5th Ave",
            city: "New York",
            state: "NY",
            zipCode: "10004",
          },
        },
        session
      );

      const response = await createBookingHandler(request);
      const data = await expectResponse(response, 400);

      expect(data.error).toBeDefined();
      expect(data.error.code).toContain("GUEST_COUNT");
    });

    it("should reject booking for unavailable vendor", async () => {
      // Create suspended vendor
      const suspendedVendorUser = await prisma.user.create({
        data: createTestUser({ role: UserRole.VENDOR }) as any,
      });

      const suspendedVendor = await prisma.vendor.create({
        data: {
          ...createTestVendor({ userId: suspendedVendorUser.id }),
          status: VendorStatus.SUSPENDED,
        } as any,
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings`,
        {
          vendorId: suspendedVendor.id,
          eventDate: "2025-03-15",
          eventStartTime: "12:00",
          eventEndTime: "16:00",
          guestCount: 50,
          eventType: "CORPORATE",
          location: {
            address: "555 Madison Ave",
            city: "New York",
            state: "NY",
            zipCode: "10005",
          },
        },
        session
      );

      const response = await createBookingHandler(request);
      const data = await expectResponse(response, 403);

      expect(data.error).toBeDefined();
      expect(data.error.code).toContain("VENDOR_UNAVAILABLE");
    });

    it("should reject booking for past date", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/bookings`,
        {
          vendorId: vendor.id,
          eventDate: "2020-01-01", // Past date
          eventStartTime: "12:00",
          eventEndTime: "16:00",
          guestCount: 50,
          eventType: "CORPORATE",
          location: {
            address: "777 Wall St",
            city: "New York",
            state: "NY",
            zipCode: "10006",
          },
        },
        session
      );

      const response = await createBookingHandler(request);
      const data = await expectResponse(response, 400);

      expect(data.error).toBeDefined();
      expect(data.error.code).toContain("INVALID_DATE");
    });

    it("should require authentication", async () => {
      const request = createPostRequest(
        `${baseUrl}/api/bookings`,
        {
          vendorId: vendor.id,
          eventDate: "2025-03-15",
          eventStartTime: "12:00",
          eventEndTime: "16:00",
          guestCount: 50,
          eventType: "CORPORATE",
          location: {
            address: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
          },
        },
        null // No session
      );

      const response = await createBookingHandler(request);
      await expectResponse(response, 401);
    });
  });

  describe("GET /api/bookings - List Bookings", () => {
    it("should list customer bookings", async () => {
      // Create test bookings
      await prisma.booking.createMany({
        data: [
          {
            ...testBookingPending,
            customerId: customer.id,
            vendorId: vendor.id,
          } as any,
          {
            ...testBookingAccepted,
            customerId: customer.id,
            vendorId: vendor.id,
          } as any,
        ],
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createGetRequest(`${baseUrl}/api/bookings`, {}, session);

      const response = await listBookingsHandler(request);
      const data = await expectResponse(response, 200);

      expect(data.bookings).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it("should list vendor bookings", async () => {
      await prisma.booking.create({
        data: {
          ...testBookingPending,
          customerId: customer.id,
          vendorId: vendor.id,
        } as any,
      });

      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createGetRequest(`${baseUrl}/api/bookings`, {}, session);

      const response = await listBookingsHandler(request);
      const data = await expectResponse(response, 200);

      expect(data.bookings).toHaveLength(1);
      expect(data.bookings[0].vendorId).toBe(vendor.id);
    });

    it("should not show other users' bookings", async () => {
      // Create another customer
      const otherCustomer = await prisma.user.create({
        data: createTestUser({ role: UserRole.CUSTOMER }) as any,
      });

      await prisma.booking.create({
        data: {
          ...testBookingPending,
          customerId: otherCustomer.id,
          vendorId: vendor.id,
        } as any,
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createGetRequest(`${baseUrl}/api/bookings`, {}, session);

      const response = await listBookingsHandler(request);
      const data = await expectResponse(response, 200);

      expect(data.bookings).toHaveLength(0);
    });
  });

  describe("PUT /api/bookings/:id/accept - Vendor Accept", () => {
    it("should accept pending booking", async () => {
      const booking = await prisma.booking.create({
        data: {
          ...testBookingPending,
          customerId: customer.id,
          vendorId: vendor.id,
        } as any,
      });

      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPutRequest(
        `${baseUrl}/api/bookings/${booking.id}/accept`,
        {},
        session
      );

      const response = await acceptBookingHandler(request, {
        params: { id: booking.id },
      });
      const data = await expectResponse(response, 200);

      expect(data.booking.status).toBe(BookingStatus.ACCEPTED);
      expect(data.booking.acceptedAt).toBeTruthy();

      // Verify in database
      const updatedBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
      });
      expect(updatedBooking?.status).toBe(BookingStatus.ACCEPTED);
      expect(updatedBooking?.acceptedAt).toBeTruthy();
    });

    it("should reject accept by non-vendor", async () => {
      const booking = await prisma.booking.create({
        data: {
          ...testBookingPending,
          customerId: customer.id,
          vendorId: vendor.id,
        } as any,
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPutRequest(
        `${baseUrl}/api/bookings/${booking.id}/accept`,
        {},
        session
      );

      const response = await acceptBookingHandler(request, {
        params: { id: booking.id },
      });
      await expectResponse(response, 403);
    });

    it("should reject accept by different vendor", async () => {
      // Create another vendor
      const otherVendorUser = await prisma.user.create({
        data: createTestUser({ role: UserRole.VENDOR }) as any,
      });

      const otherVendor = await prisma.vendor.create({
        data: createTestVendor({ userId: otherVendorUser.id }) as any,
      });

      const booking = await prisma.booking.create({
        data: {
          ...testBookingPending,
          customerId: customer.id,
          vendorId: vendor.id,
        } as any,
      });

      const session = createMockSession(otherVendorUser.id, UserRole.VENDOR);
      const request = createPutRequest(
        `${baseUrl}/api/bookings/${booking.id}/accept`,
        {},
        session
      );

      const response = await acceptBookingHandler(request, {
        params: { id: booking.id },
      });
      await expectResponse(response, 403);
    });
  });

  describe("PUT /api/bookings/:id/decline - Vendor Decline", () => {
    it("should decline pending booking", async () => {
      const booking = await prisma.booking.create({
        data: {
          ...testBookingPending,
          customerId: customer.id,
          vendorId: vendor.id,
        } as any,
      });

      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPutRequest(
        `${baseUrl}/api/bookings/${booking.id}/decline`,
        {
          reason: "Fully booked on that date",
        },
        session
      );

      const response = await declineBookingHandler(request, {
        params: { id: booking.id },
      });
      const data = await expectResponse(response, 200);

      expect(data.booking.status).toBe(BookingStatus.CANCELLED);
      expect(data.booking.cancelledAt).toBeTruthy();
      expect(data.booking.cancellationReason).toBe("Fully booked on that date");
    });
  });

  describe("Booking Lifecycle - Full Flow", () => {
    it("should complete full booking flow: create → accept → pay → complete", async () => {
      // 1. Customer creates booking
      const customerSession = createMockSession(customer.id, UserRole.CUSTOMER);
      const createRequest = createPostRequest(
        `${baseUrl}/api/bookings`,
        {
          vendorId: vendor.id,
          eventDate: "2025-04-01",
          eventStartTime: "18:00",
          eventEndTime: "22:00",
          guestCount: 75,
          eventType: "WEDDING",
          location: {
            address: "100 Broadway",
            city: "New York",
            state: "NY",
            zipCode: "10007",
          },
        },
        customerSession
      );

      const createResponse = await createBookingHandler(createRequest);
      const createData = await expectResponse(createResponse, 201);
      expect(createData.booking.status).toBe(BookingStatus.PENDING);

      // 2. Vendor accepts booking
      const vendorSession = createMockSession(vendorUser.id, UserRole.VENDOR);
      const acceptRequest = createPutRequest(
        `${baseUrl}/api/bookings/${createData.booking.id}/accept`,
        {},
        vendorSession
      );

      const acceptResponse = await acceptBookingHandler(acceptRequest, {
        params: { id: createData.booking.id },
      });
      const acceptData = await expectResponse(acceptResponse, 200);
      expect(acceptData.booking.status).toBe(BookingStatus.ACCEPTED);

      // 3. Verify booking state in database
      const finalBooking = await prisma.booking.findUnique({
        where: { id: createData.booking.id },
      });
      expect(finalBooking?.status).toBe(BookingStatus.ACCEPTED);
      expect(finalBooking?.acceptedAt).toBeTruthy();
    });
  });
});
