/**
 * Vendor Module Validation Schemas
 * Zod schemas for input validation
 */

import { z } from "zod";
import { CuisineType, PriceRange, DocumentType } from "@prisma/client";

/**
 * Vendor application submission schema
 */
export const vendorApplicationSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters")
    .trim(),

  cuisineType: z.nativeEnum(CuisineType, {
    errorMap: () => ({ message: "Invalid cuisine type" }),
  }),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters")
    .trim()
    .optional(),

  priceRange: z.nativeEnum(PriceRange, {
    errorMap: () => ({ message: "Invalid price range" }),
  }),

  capacityMin: z
    .number()
    .int("Minimum capacity must be a whole number")
    .min(1, "Minimum capacity must be at least 1")
    .max(10000, "Minimum capacity cannot exceed 10,000"),

  capacityMax: z
    .number()
    .int("Maximum capacity must be a whole number")
    .min(1, "Maximum capacity must be at least 1")
    .max(10000, "Maximum capacity cannot exceed 10,000"),

  serviceArea: z
    .string()
    .min(2, "Service area must be at least 2 characters")
    .max(200, "Service area must be less than 200 characters")
    .trim()
    .optional(),

  location: z
    .string()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, "Location must be in 'lat,lng' format")
    .optional(),

  serviceRadius: z
    .number()
    .int("Service radius must be a whole number")
    .refine(
      (val) => [5, 10, 25, 50, 100].includes(val),
      "Service radius must be 5, 10, 25, 50, or 100 miles"
    )
    .optional(),

  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),

  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
}).refine(
  (data) => data.capacityMax >= data.capacityMin,
  {
    message: "Maximum capacity must be greater than or equal to minimum capacity",
    path: ["capacityMax"],
  }
);

/**
 * Vendor profile update schema (all fields optional)
 */
export const vendorProfileUpdateSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters")
    .trim()
    .optional(),

  cuisineType: z.nativeEnum(CuisineType).optional(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters")
    .trim()
    .optional(),

  priceRange: z.nativeEnum(PriceRange).optional(),

  capacityMin: z
    .number()
    .int("Minimum capacity must be a whole number")
    .min(1, "Minimum capacity must be at least 1")
    .max(10000, "Minimum capacity cannot exceed 10,000")
    .optional(),

  capacityMax: z
    .number()
    .int("Maximum capacity must be a whole number")
    .min(1, "Maximum capacity must be at least 1")
    .max(10000, "Maximum capacity cannot exceed 10,000")
    .optional(),

  serviceArea: z
    .string()
    .min(2, "Service area must be at least 2 characters")
    .max(200, "Service area must be less than 200 characters")
    .trim()
    .optional(),

  location: z
    .string()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, "Location must be in 'lat,lng' format")
    .optional(),

  serviceRadius: z
    .number()
    .int("Service radius must be a whole number")
    .refine(
      (val) => [5, 10, 25, 50, 100].includes(val),
      "Service radius must be 5, 10, 25, 50, or 100 miles"
    )
    .optional(),

  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),

  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
}).refine(
  (data) => {
    // If both capacities are provided, validate relationship
    if (data.capacityMin !== undefined && data.capacityMax !== undefined) {
      return data.capacityMax >= data.capacityMin;
    }
    return true;
  },
  {
    message: "Maximum capacity must be greater than or equal to minimum capacity",
    path: ["capacityMax"],
  }
);

/**
 * Document upload schema
 */
export const documentUploadSchema = z.object({
  type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: "Invalid document type" }),
  }),

  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must be less than 255 characters"),

  fileUrl: z
    .string()
    .url("Invalid file URL")
    .max(500, "File URL must be less than 500 characters"),

  fileSize: z
    .number()
    .int("File size must be a whole number")
    .min(1, "File size must be at least 1 byte")
    .max(10 * 1024 * 1024, "File size cannot exceed 10MB")
    .optional(),
});

/**
 * Vendor rejection schema
 */
export const vendorRejectionSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(1000, "Rejection reason must be less than 1000 characters")
    .trim(),
});

/**
 * Vendor ID parameter schema
 */
export const vendorIdSchema = z.object({
  id: z.string().uuid("Invalid vendor ID format"),
});
