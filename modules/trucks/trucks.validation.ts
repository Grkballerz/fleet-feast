/**
 * Trucks Module Validation Schemas
 * Zod schemas for input validation
 */

import { z } from "zod";
import { CuisineType, PriceRange } from "@prisma/client";

/**
 * Menu item schema
 */
export const menuItemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name must be less than 100 characters")
    .trim(),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),

  price: z
    .number()
    .min(0, "Price must be non-negative")
    .max(10000, "Price cannot exceed $10,000"),

  dietaryTags: z
    .array(z.string().trim())
    .optional(),
});

/**
 * Menu update schema
 */
export const menuUpdateSchema = z.object({
  items: z
    .array(menuItemSchema)
    .min(1, "Menu must have at least one item")
    .max(100, "Menu cannot have more than 100 items"),

  pricingModel: z.enum(["per_person", "flat_rate", "custom"], {
    errorMap: () => ({ message: "Invalid pricing model" }),
  }),
});

/**
 * Single availability entry schema
 */
export const availabilityEntrySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),

  isAvailable: z.boolean(),

  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .trim()
    .optional(),
});

/**
 * Availability update schema (batch update)
 */
export const availabilityUpdateSchema = z.object({
  dates: z
    .array(availabilityEntrySchema)
    .min(1, "At least one date is required")
    .max(365, "Cannot update more than 365 dates at once"),
});

/**
 * Location filter schema
 */
export const locationFilterSchema = z.object({
  lat: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),

  lng: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),

  radiusMiles: z
    .number()
    .min(1, "Radius must be at least 1 mile")
    .max(100, "Radius cannot exceed 100 miles"),
});

/**
 * Truck search filters schema
 */
export const truckSearchFiltersSchema = z.object({
  query: z
    .string()
    .trim()
    .optional(),

  cuisineType: z
    .array(z.nativeEnum(CuisineType))
    .optional()
    .transform((val) => {
      // Handle single value or comma-separated string from query params
      if (typeof val === "string") {
        return val.split(",").map((v) => v.trim() as CuisineType);
      }
      return val;
    }),

  priceRange: z
    .array(z.nativeEnum(PriceRange))
    .optional()
    .transform((val) => {
      if (typeof val === "string") {
        return val.split(",").map((v) => v.trim() as PriceRange);
      }
      return val;
    }),

  capacityMin: z
    .number()
    .int("Minimum capacity must be a whole number")
    .min(1, "Minimum capacity must be at least 1")
    .optional(),

  capacityMax: z
    .number()
    .int("Maximum capacity must be a whole number")
    .min(1, "Maximum capacity must be at least 1")
    .optional(),

  minRating: z
    .number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .optional(),

  availableDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),

  location: locationFilterSchema.optional(),
});

/**
 * Search pagination schema
 */
export const searchPaginationSchema = z.object({
  page: z
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),

  sortBy: z
    .enum(["relevance", "rating", "price"])
    .default("relevance")
    .optional(),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc")
    .optional(),
});

/**
 * Truck ID parameter schema
 */
export const truckIdSchema = z.object({
  id: z.string().uuid("Invalid truck ID format"),
});

/**
 * Date parameter schema (for availability check)
 */
export const dateParamSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});
