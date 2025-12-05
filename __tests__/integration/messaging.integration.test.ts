/**
 * Messaging API Integration Tests
 * Tests messaging: send → fetch → read → flagging
 */

import { UserRole, BookingStatus, MessageSeverity } from "@prisma/client";
import { GET as getInboxHandler, POST as sendMessageHandler } from "@/app/api/messages/route";
import { GET as getConversationHandler } from "@/app/api/messages/[bookingId]/route";
import { POST as markReadHandler } from "@/app/api/messages/[bookingId]/read/route";
import { getTestPrisma, clearDatabase } from "../setup/database";
import {
  createGetRequest,
  createPostRequest,
  createMockSession,
  expectResponse,
} from "../setup/server";
import { testCustomer, testVendorUser } from "../fixtures/users";
import { testVendor } from "../fixtures/vendors";
import { testBookingConfirmed } from "../fixtures/bookings";

// Import mocks
import "../mocks/sendgrid";
import "../mocks/nextauth";

const prisma = getTestPrisma();
const baseUrl = "http://localhost:3000";

describe("Messaging API Integration Tests", () => {
  let customer: any;
  let vendorUser: any;
  let vendor: any;
  let booking: any;

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

    // Create confirmed booking for messaging
    booking = await prisma.booking.create({
      data: {
        ...testBookingConfirmed,
        customerId: customer.id,
        vendorId: vendor.id,
      } as any,
    });
  });

  describe("POST /api/messages - Send Message", () => {
    it("should send message from customer to vendor", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: "What time should we arrive for setup?",
        },
        session
      );

      const response = await sendMessageHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.message).toBeDefined();
      expect(data.message.senderId).toBe(customer.id);
      expect(data.message.bookingId).toBe(booking.id);
      expect(data.message.content).toBe("What time should we arrive for setup?");
      expect(data.message.flagged).toBe(false);

      // Verify in database
      const message = await prisma.message.findUnique({
        where: { id: data.message.id },
      });
      expect(message).toBeTruthy();
      expect(message?.readAt).toBeNull();
    });

    it("should send message from vendor to customer", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: "Please arrive 30 minutes before the event starts.",
        },
        session
      );

      const response = await sendMessageHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.message.senderId).toBe(vendorUser.id);
    });

    it("should flag message containing phone number", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: "Call me at 555-123-4567 to discuss details",
        },
        session
      );

      const response = await sendMessageHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.message.flagged).toBe(true);
      expect(data.message.flaggedReason).toContain("contact");
      expect(data.message.severity).toBe(MessageSeverity.MEDIUM);
      expect(data.warning).toBeDefined();

      // Verify in database
      const message = await prisma.message.findUnique({
        where: { id: data.message.id },
      });
      expect(message?.flagged).toBe(true);
    });

    it("should flag message containing email address", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: "Email me at myemail@example.com for the contract",
        },
        session
      );

      const response = await sendMessageHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.message.flagged).toBe(true);
      expect(data.message.flaggedReason).toContain("contact");
      expect(data.warning).toBeDefined();
    });

    it("should flag message with PayPal/Venmo mention", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: "Can I pay you via PayPal instead?",
        },
        session
      );

      const response = await sendMessageHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.message.flagged).toBe(true);
      expect(data.message.flaggedReason).toContain("circumvention");
      expect(data.message.severity).toBe(MessageSeverity.HIGH);
    });

    it("should NOT flag normal message", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: "Thank you for accepting our booking! Looking forward to the event.",
        },
        session
      );

      const response = await sendMessageHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.message.flagged).toBe(false);
      expect(data.warning).toBeUndefined();
    });

    it("should reject message for non-participant", async () => {
      // Create another user not part of booking
      const otherUser = await prisma.user.create({
        data: {
          id: "other-user-001",
          email: "other@test.com",
          passwordHash: "$2a$12$test",
          role: UserRole.CUSTOMER,
        } as any,
      });

      const session = createMockSession(otherUser.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: "Unauthorized message",
        },
        session
      );

      const response = await sendMessageHandler(request);
      await expectResponse(response, 403);
    });

    it("should reject empty message", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: "",
        },
        session
      );

      const response = await sendMessageHandler(request);
      const data = await expectResponse(response, 400);

      expect(data.error).toBeDefined();
    });

    it("should reject message exceeding character limit", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const longMessage = "a".repeat(5001); // Assuming 5000 char limit

      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: longMessage,
        },
        session
      );

      const response = await sendMessageHandler(request);
      const data = await expectResponse(response, 400);

      expect(data.error).toBeDefined();
    });
  });

  describe("GET /api/messages - Get Inbox", () => {
    beforeEach(async () => {
      // Create test messages
      await prisma.message.createMany({
        data: [
          {
            id: "msg-001",
            bookingId: booking.id,
            senderId: customer.id,
            receiverId: vendorUser.id,
            content: "Message 1",
            createdAt: new Date("2025-01-01T10:00:00Z"),
          },
          {
            id: "msg-002",
            bookingId: booking.id,
            senderId: vendorUser.id,
            receiverId: customer.id,
            content: "Message 2",
            readAt: new Date("2025-01-01T11:00:00Z"),
            createdAt: new Date("2025-01-01T10:30:00Z"),
          },
          {
            id: "msg-003",
            bookingId: booking.id,
            senderId: customer.id,
            receiverId: vendorUser.id,
            content: "Message 3",
            createdAt: new Date("2025-01-01T12:00:00Z"),
          },
        ],
      });
    });

    it("should fetch customer inbox", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createGetRequest(`${baseUrl}/api/messages`, {}, session);

      const response = await getInboxHandler(request);
      const data = await expectResponse(response, 200);

      expect(data.items).toBeDefined();
      expect(data.items.length).toBeGreaterThan(0);

      // Customer should see messages from vendor
      const messagesFromVendor = data.items.filter((m: any) => m.senderId === vendorUser.id);
      expect(messagesFromVendor.length).toBeGreaterThan(0);
    });

    it("should fetch vendor inbox", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createGetRequest(`${baseUrl}/api/messages`, {}, session);

      const response = await getInboxHandler(request);
      const data = await expectResponse(response, 200);

      expect(data.items).toBeDefined();

      // Vendor should see messages from customer
      const messagesFromCustomer = data.items.filter((m: any) => m.senderId === customer.id);
      expect(messagesFromCustomer.length).toBeGreaterThan(0);
    });

    it("should filter unread messages only", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createGetRequest(
        `${baseUrl}/api/messages`,
        { unreadOnly: "true" },
        session
      );

      const response = await getInboxHandler(request);
      const data = await expectResponse(response, 200);

      // All returned messages should be unread
      data.items.forEach((msg: any) => {
        expect(msg.readAt).toBeNull();
      });
    });

    it("should paginate inbox results", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createGetRequest(
        `${baseUrl}/api/messages`,
        { page: "1", limit: "1" },
        session
      );

      const response = await getInboxHandler(request);
      const data = await expectResponse(response, 200);

      expect(data.items).toHaveLength(1);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(1);
      expect(data.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /api/messages/:bookingId - Get Conversation", () => {
    beforeEach(async () => {
      // Create conversation messages
      await prisma.message.createMany({
        data: [
          {
            id: "conv-msg-001",
            bookingId: booking.id,
            senderId: customer.id,
            receiverId: vendorUser.id,
            content: "First message",
            createdAt: new Date("2025-01-01T10:00:00Z"),
          },
          {
            id: "conv-msg-002",
            bookingId: booking.id,
            senderId: vendorUser.id,
            receiverId: customer.id,
            content: "Reply message",
            createdAt: new Date("2025-01-01T10:30:00Z"),
          },
        ],
      });
    });

    it("should fetch full conversation for customer", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createGetRequest(
        `${baseUrl}/api/messages/${booking.id}`,
        {},
        session
      );

      const response = await getConversationHandler(request, {
        params: { bookingId: booking.id },
      });
      const data = await expectResponse(response, 200);

      expect(data.messages).toHaveLength(2);
      expect(data.messages[0].content).toBe("First message");
      expect(data.messages[1].content).toBe("Reply message");
    });

    it("should fetch full conversation for vendor", async () => {
      const session = createMockSession(vendorUser.id, UserRole.VENDOR);
      const request = createGetRequest(
        `${baseUrl}/api/messages/${booking.id}`,
        {},
        session
      );

      const response = await getConversationHandler(request, {
        params: { bookingId: booking.id },
      });
      const data = await expectResponse(response, 200);

      expect(data.messages).toHaveLength(2);
    });

    it("should reject conversation access by non-participant", async () => {
      const otherUser = await prisma.user.create({
        data: {
          id: "other-user-002",
          email: "other2@test.com",
          passwordHash: "$2a$12$test",
          role: UserRole.CUSTOMER,
        } as any,
      });

      const session = createMockSession(otherUser.id, UserRole.CUSTOMER);
      const request = createGetRequest(
        `${baseUrl}/api/messages/${booking.id}`,
        {},
        session
      );

      const response = await getConversationHandler(request, {
        params: { bookingId: booking.id },
      });
      await expectResponse(response, 403);
    });
  });

  describe("POST /api/messages/:bookingId/read - Mark as Read", () => {
    it("should mark messages as read", async () => {
      // Create unread message for customer
      const message = await prisma.message.create({
        data: {
          id: "unread-msg-001",
          bookingId: booking.id,
          senderId: vendorUser.id,
          receiverId: customer.id,
          content: "Unread message",
        },
      });

      expect(message.readAt).toBeNull();

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages/${booking.id}/read`,
        {},
        session
      );

      const response = await markReadHandler(request, {
        params: { bookingId: booking.id },
      });
      const data = await expectResponse(response, 200);

      expect(data.markedRead).toBeGreaterThan(0);

      // Verify message marked as read
      const updatedMessage = await prisma.message.findUnique({
        where: { id: message.id },
      });
      expect(updatedMessage?.readAt).toBeTruthy();
    });

    it("should only mark own messages as read", async () => {
      // Create message sent by customer
      await prisma.message.create({
        data: {
          id: "own-msg-001",
          bookingId: booking.id,
          senderId: customer.id,
          receiverId: vendorUser.id,
          content: "My own message",
        },
      });

      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages/${booking.id}/read`,
        {},
        session
      );

      const response = await markReadHandler(request, {
        params: { bookingId: booking.id },
      });
      const data = await expectResponse(response, 200);

      // Should not mark own sent messages as read
      const message = await prisma.message.findFirst({
        where: { id: "own-msg-001" },
      });
      expect(message?.readAt).toBeNull();
    });
  });

  describe("Anti-Circumvention - Violation Tracking", () => {
    it("should create violation for repeated contact info sharing", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);

      // Send multiple flagged messages
      for (let i = 0; i < 3; i++) {
        const request = createPostRequest(
          `${baseUrl}/api/messages`,
          {
            bookingId: booking.id,
            content: `Call me at 555-123-456${i}`,
          },
          session
        );
        await sendMessageHandler(request);
      }

      // Check if violation was created
      const violations = await prisma.violation.findMany({
        where: {
          userId: customer.id,
          type: "CONTACT_INFO_SHARING",
        },
      });

      expect(violations.length).toBeGreaterThan(0);
    });

    it("should escalate severity for PayPal/payment circumvention", async () => {
      const session = createMockSession(customer.id, UserRole.CUSTOMER);
      const request = createPostRequest(
        `${baseUrl}/api/messages`,
        {
          bookingId: booking.id,
          content: "Let's use Venmo to avoid the platform fee",
        },
        session
      );

      const response = await sendMessageHandler(request);
      const data = await expectResponse(response, 201);

      expect(data.message.severity).toBe(MessageSeverity.HIGH);
      expect(data.message.flaggedReason).toContain("circumvention");
    });
  });
});
