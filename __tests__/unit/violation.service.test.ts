/**
 * Unit Tests for Violation Service
 * Tests violation creation, penalty calculation, and status updates
 */

import {
  createViolation,
  processCircumventionViolation,
  getUserViolationSummary,
  recalculateUserStatus,
  ViolationError,
} from "@/modules/violation/violation.service";
import { ViolationType, MessageSeverity, UserStatus } from "@prisma/client";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    violation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock("@/modules/violation/penalty.rules", () => ({
  calculatePenalty: jest.fn(),
  getStatusPriority: jest.fn(),
  mapPenaltyToAccountStatus: jest.fn(),
  calculateExpiryDate: jest.fn(),
  severityToPoints: jest.fn((severity) => {
    switch (severity) {
      case MessageSeverity.LOW: return 1;
      case MessageSeverity.MEDIUM: return 3;
      case MessageSeverity.HIGH: return 5;
      case MessageSeverity.CRITICAL: return 10;
      default: return 0;
    }
  }),
  getViolationPoints: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import {
  calculatePenalty,
  getStatusPriority,
  mapPenaltyToAccountStatus,
  calculateExpiryDate,
} from "@/modules/violation/penalty.rules";

describe("ViolationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createViolation", () => {
    const mockUser = {
      id: "user-123",
      status: UserStatus.ACTIVE,
      statusExpiresAt: null,
    };

    it("should create violation and update user status if penalty is severe", async () => {
      (prisma.violation.create as jest.Mock).mockResolvedValue({
        id: "violation-123",
        userId: "user-123",
        type: ViolationType.CONTACT_INFO_SHARING,
        description: "Shared phone number",
        severity: MessageSeverity.HIGH,
        automated: true,
        source: "MESSAGING_SYSTEM",
        sourceId: "message-123",
      });
      (prisma.violation.findMany as jest.Mock).mockResolvedValue([
        {
          severity: MessageSeverity.HIGH,
          type: ViolationType.CONTACT_INFO_SHARING,
        },
      ]);
      (calculatePenalty as jest.Mock).mockReturnValue({
        penalty: "SUSPEND_7_DAYS",
        duration: 7,
        description: "7-day suspension",
      });
      (mapPenaltyToAccountStatus as jest.Mock).mockReturnValue(
        UserStatus.SUSPENDED
      );
      (getStatusPriority as jest.Mock)
        .mockReturnValueOnce(0) // Current (ACTIVE)
        .mockReturnValueOnce(1); // New (SUSPENDED)
      (calculateExpiryDate as jest.Mock).mockReturnValue(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.violation.update as jest.Mock).mockResolvedValue({});

      await createViolation({
        userId: "user-123",
        type: ViolationType.CONTACT_INFO_SHARING,
        source: "MESSAGING_SYSTEM",
        sourceId: "message-123",
        description: "Shared phone number",
        automated: true,
        severityOverride: MessageSeverity.HIGH,
      });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-123" },
          data: expect.objectContaining({
            status: UserStatus.SUSPENDED,
            statusExpiresAt: expect.any(Date),
          }),
        })
      );
    });

    it("should not downgrade user status", async () => {
      (prisma.violation.create as jest.Mock).mockResolvedValue({
        id: "violation-123",
        userId: "user-123",
        type: ViolationType.OTHER,
        severity: MessageSeverity.LOW,
      });
      (prisma.violation.findMany as jest.Mock).mockResolvedValue([]);
      (calculatePenalty as jest.Mock).mockReturnValue({
        penalty: "WARNING",
        duration: null,
        description: "Warning",
      });
      (mapPenaltyToAccountStatus as jest.Mock).mockReturnValue(
        UserStatus.ACTIVE
      );
      (getStatusPriority as jest.Mock)
        .mockReturnValueOnce(2) // Current (SUSPENDED)
        .mockReturnValueOnce(0); // New (ACTIVE)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        status: UserStatus.SUSPENDED,
      });

      await createViolation({
        userId: "user-123",
        type: ViolationType.OTHER,
        source: "MANUAL_REPORT",
        sourceId: "report-123",
        description: "Minor issue",
        automated: false,
      });

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("should calculate total points from last year", async () => {
      (prisma.violation.create as jest.Mock).mockResolvedValue({
        id: "violation-123",
        userId: "user-123",
        type: ViolationType.CONTACT_INFO_SHARING,
        severity: MessageSeverity.MEDIUM,
      });
      (prisma.violation.findMany as jest.Mock).mockResolvedValue([
        { severity: MessageSeverity.LOW, type: ViolationType.OTHER },
        { severity: MessageSeverity.MEDIUM, type: ViolationType.OTHER },
      ]);
      (calculatePenalty as jest.Mock).mockReturnValue({
        penalty: "WARNING",
        duration: null,
      });
      (mapPenaltyToAccountStatus as jest.Mock).mockReturnValue(
        UserStatus.ACTIVE
      );
      (getStatusPriority as jest.Mock).mockReturnValue(0);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await createViolation({
        userId: "user-123",
        type: ViolationType.CONTACT_INFO_SHARING,
        source: "MESSAGING_SYSTEM",
        sourceId: "message-123",
        description: "Test",
        automated: true,
      });

      // Should have fetched violations from last year
      expect(prisma.violation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-123",
            createdAt: expect.any(Object),
          }),
        })
      );
    });

    it("should throw error if user not found", async () => {
      (prisma.violation.create as jest.Mock).mockResolvedValue({
        id: "violation-123",
      });
      (prisma.violation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        createViolation({
          userId: "nonexistent",
          type: ViolationType.OTHER,
          source: "MANUAL_REPORT",
          sourceId: "report-123",
          description: "Test",
          automated: false,
        })
      ).rejects.toThrow(ViolationError);
      await expect(
        createViolation({
          userId: "nonexistent",
          type: ViolationType.OTHER,
          source: "MANUAL_REPORT",
          sourceId: "report-123",
          description: "Test",
          automated: false,
        })
      ).rejects.toThrow("User not found");
    });
  });

  describe("processCircumventionViolation", () => {
    it("should create circumvention violation for first offense", async () => {
      (prisma.violation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.violation.create as jest.Mock).mockResolvedValue({
        id: "violation-123",
        userId: "user-123",
        type: ViolationType.CIRCUMVENTION_ATTEMPT,
        severity: MessageSeverity.MEDIUM,
      });
      (prisma.violation.findMany as jest.Mock).mockResolvedValue([]);
      (calculatePenalty as jest.Mock).mockReturnValue({
        penalty: "WARNING",
      });
      (mapPenaltyToAccountStatus as jest.Mock).mockReturnValue(
        UserStatus.ACTIVE
      );
      (getStatusPriority as jest.Mock).mockReturnValue(0);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        status: UserStatus.ACTIVE,
        statusExpiresAt: null,
      });

      await processCircumventionViolation({
        userId: "user-123",
        messageId: "message-123",
        severity: MessageSeverity.MEDIUM,
        flagReason: "Phone number detected",
      });

      expect(prisma.violation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-123",
            type: ViolationType.CIRCUMVENTION_ATTEMPT,
            automated: true,
          }),
        })
      );
    });

    it("should escalate to CONTACT_INFO_SHARING for repeat offense", async () => {
      const recentViolation = {
        id: "previous-violation",
        userId: "user-123",
        type: ViolationType.CIRCUMVENTION_ATTEMPT,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      };

      (prisma.violation.findMany as jest.Mock)
        .mockResolvedValueOnce([recentViolation]) // Recent violations check
        .mockResolvedValueOnce([recentViolation]); // Total violations check
      (prisma.violation.create as jest.Mock).mockResolvedValue({
        id: "violation-123",
        userId: "user-123",
        type: ViolationType.CONTACT_INFO_SHARING,
        severity: MessageSeverity.HIGH,
      });
      (calculatePenalty as jest.Mock).mockReturnValue({
        penalty: "SUSPEND_7_DAYS",
      });
      (mapPenaltyToAccountStatus as jest.Mock).mockReturnValue(
        UserStatus.SUSPENDED
      );
      (getStatusPriority as jest.Mock).mockReturnValue(1);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        status: UserStatus.ACTIVE,
      });
      (calculateExpiryDate as jest.Mock).mockReturnValue(new Date());
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.violation.update as jest.Mock).mockResolvedValue({});

      await processCircumventionViolation({
        userId: "user-123",
        messageId: "message-123",
        severity: MessageSeverity.MEDIUM,
        flagReason: "Email detected",
      });

      expect(prisma.violation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: ViolationType.CONTACT_INFO_SHARING,
          }),
        })
      );
    });
  });

  describe("getUserViolationSummary", () => {
    it("should return user violation summary", async () => {
      const mockUser = {
        id: "user-123",
        status: UserStatus.ACTIVE,
        statusExpiresAt: null,
      };

      const mockViolations = [
        {
          id: "v1",
          userId: "user-123",
          type: ViolationType.OTHER,
          severity: MessageSeverity.LOW,
          appealed: false,
          createdAt: new Date(),
        },
        {
          id: "v2",
          userId: "user-123",
          type: ViolationType.CONTACT_INFO_SHARING,
          severity: MessageSeverity.HIGH,
          appealed: false,
          createdAt: new Date(),
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.violation.findMany as jest.Mock).mockResolvedValue(
        mockViolations
      );
      (calculatePenalty as jest.Mock).mockReturnValue({
        penalty: "WARNING",
      });

      const result = await getUserViolationSummary("user-123");

      expect(result.userId).toBe("user-123");
      expect(result.totalViolations).toBe(2);
      expect(result.totalPoints).toBe(6); // LOW=1 + HIGH=5
      expect(result.accountStatus).toBe(UserStatus.ACTIVE);
    });

    it("should exclude appealed violations from points", async () => {
      const mockViolations = [
        {
          id: "v1",
          severity: MessageSeverity.HIGH,
          appealed: true,
          createdAt: new Date(),
        },
        {
          id: "v2",
          severity: MessageSeverity.LOW,
          appealed: false,
          createdAt: new Date(),
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-123",
        status: UserStatus.ACTIVE,
      });
      (prisma.violation.findMany as jest.Mock).mockResolvedValue(
        mockViolations
      );
      (calculatePenalty as jest.Mock).mockReturnValue({
        penalty: "WARNING",
      });

      const result = await getUserViolationSummary("user-123");

      expect(result.totalPoints).toBe(1); // Only LOW=1, HIGH is appealed
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        getUserViolationSummary("nonexistent")
      ).rejects.toThrow(ViolationError);
    });
  });

  describe("recalculateUserStatus", () => {
    it("should recalculate user status based on active violations", async () => {
      (prisma.violation.findMany as jest.Mock).mockResolvedValue([
        { severity: MessageSeverity.MEDIUM },
        { severity: MessageSeverity.HIGH },
      ]);
      (calculatePenalty as jest.Mock).mockReturnValue({
        penalty: "SUSPEND_7_DAYS",
      });
      (mapPenaltyToAccountStatus as jest.Mock).mockReturnValue(
        UserStatus.SUSPENDED
      );
      (calculateExpiryDate as jest.Mock).mockReturnValue(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await recalculateUserStatus("user-123");

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-123" },
          data: expect.objectContaining({
            status: UserStatus.SUSPENDED,
            statusExpiresAt: expect.any(Date),
          }),
        })
      );
    });

    it("should only count non-appealed violations", async () => {
      (prisma.violation.findMany as jest.Mock).mockResolvedValue([]);
      (calculatePenalty as jest.Mock).mockReturnValue({
        penalty: "NONE",
      });
      (mapPenaltyToAccountStatus as jest.Mock).mockReturnValue(
        UserStatus.ACTIVE
      );
      (calculateExpiryDate as jest.Mock).mockReturnValue(null);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await recalculateUserStatus("user-123");

      expect(prisma.violation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            appealed: false,
          }),
        })
      );
    });
  });
});
