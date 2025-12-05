/**
 * SQL Injection Security Tests
 * Tests for SQL injection vulnerability fixes in trucks.service.ts
 */

import { searchTrucks } from "@/modules/trucks/trucks.service";
import { prisma } from "@/lib/prisma";
import type { TruckSearchFilters, SearchPagination } from "@/modules/trucks/trucks.types";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe("SQL Injection Prevention - Trucks Search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("excludeId parameter", () => {
    it("should safely handle normal excludeId", async () => {
      const mockResult: any[] = [];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResult);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const filters: TruckSearchFilters = {
        excludeId: "valid-uuid-123",
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await searchTrucks(filters, pagination);

      // Verify Prisma.sql was used (parameterized query)
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it("should prevent SQL injection via excludeId", async () => {
      const mockResult: any[] = [];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResult);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const filters: TruckSearchFilters = {
        // Attempt SQL injection
        excludeId: "' OR 1=1--",
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await searchTrucks(filters, pagination);

      // Should not throw error, should safely parameterize
      expect(prisma.$queryRaw).toHaveBeenCalled();

      // Verify the malicious input was parameterized (not concatenated)
      const calls = (prisma.$queryRaw as jest.Mock).mock.calls;
      const queryCall = calls[0][0];

      // The query should be a Prisma.sql tagged template, not a raw string
      expect(queryCall).toHaveProperty('values');
      expect(queryCall.values).toContain("' OR 1=1--");
    });
  });

  describe("cuisineType parameter", () => {
    it("should safely handle array of cuisineTypes", async () => {
      const mockResult: any[] = [];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResult);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const filters: TruckSearchFilters = {
        cuisineType: ["AMERICAN", "CHINESE"],
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await searchTrucks(filters, pagination);

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it("should prevent SQL injection via cuisineType array", async () => {
      const mockResult: any[] = [];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResult);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const filters: TruckSearchFilters = {
        // Attempt SQL injection via array
        cuisineType: ["AMERICAN'); DROP TABLE vendors;--"],
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await searchTrucks(filters, pagination);

      // Should safely parameterize the malicious input
      expect(prisma.$queryRaw).toHaveBeenCalled();

      const calls = (prisma.$queryRaw as jest.Mock).mock.calls;
      const queryCall = calls[0][0];

      expect(queryCall).toHaveProperty('values');
      expect(queryCall.values).toContainEqual(["AMERICAN'); DROP TABLE vendors;--"]);
    });
  });

  describe("priceRange parameter", () => {
    it("should safely handle array of priceRanges", async () => {
      const mockResult: any[] = [];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResult);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const filters: TruckSearchFilters = {
        priceRange: ["BUDGET", "MODERATE"],
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await searchTrucks(filters, pagination);

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it("should prevent SQL injection via priceRange array", async () => {
      const mockResult: any[] = [];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResult);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const filters: TruckSearchFilters = {
        priceRange: ["BUDGET'); DELETE FROM users;--"],
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await searchTrucks(filters, pagination);

      expect(prisma.$queryRaw).toHaveBeenCalled();

      const calls = (prisma.$queryRaw as jest.Mock).mock.calls;
      const queryCall = calls[0][0];

      expect(queryCall).toHaveProperty('values');
    });
  });

  describe("availableDate parameter", () => {
    it("should accept valid date format", async () => {
      const mockResult: any[] = [];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResult);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const filters: TruckSearchFilters = {
        availableDate: "2025-01-15",
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await searchTrucks(filters, pagination);

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it("should reject invalid date format", async () => {
      const filters: TruckSearchFilters = {
        availableDate: "invalid-date",
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await expect(searchTrucks(filters, pagination)).rejects.toThrow(
        "Invalid date format"
      );
    });

    it("should prevent SQL injection via availableDate", async () => {
      const filters: TruckSearchFilters = {
        // Attempt SQL injection with date
        availableDate: "2025-01-01' AND (SELECT COUNT(*) FROM users WHERE role='ADMIN')>0--",
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      // Should reject due to date format validation
      await expect(searchTrucks(filters, pagination)).rejects.toThrow(
        "Invalid date format"
      );
    });

    it("should safely parameterize valid date after validation", async () => {
      const mockResult: any[] = [];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResult);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const filters: TruckSearchFilters = {
        availableDate: "2025-12-31",
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await searchTrucks(filters, pagination);

      const calls = (prisma.$queryRaw as jest.Mock).mock.calls;
      const queryCall = calls[0][0];

      // Verify parameterization
      expect(queryCall).toHaveProperty('values');
      expect(queryCall.values).toContain("2025-12-31");
    });
  });

  describe("capacityMin and capacityMax parameters", () => {
    it("should accept valid numbers", async () => {
      const mockResult: any[] = [];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockResult);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const filters: TruckSearchFilters = {
        capacityMin: 50,
        capacityMax: 200,
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await searchTrucks(filters, pagination);

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it("should reject invalid capacityMin", async () => {
      const filters: TruckSearchFilters = {
        capacityMin: NaN,
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await expect(searchTrucks(filters, pagination)).rejects.toThrow(
        "Invalid capacityMin"
      );
    });

    it("should reject invalid capacityMax", async () => {
      const filters: TruckSearchFilters = {
        capacityMax: "not-a-number" as any,
      };
      const pagination: SearchPagination = { page: 1, limit: 10 };

      await expect(searchTrucks(filters, pagination)).rejects.toThrow(
        "Invalid capacityMax"
      );
    });
  });
});
