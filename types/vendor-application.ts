/**
 * Vendor Application Form Types
 * Type definitions for the multi-step vendor application flow
 */

import { CuisineType } from "./index";

// Document types for vendor application
export enum DocumentType {
  BUSINESS_LICENSE = "BUSINESS_LICENSE",
  HEALTH_PERMIT = "HEALTH_PERMIT",
  INSURANCE = "INSURANCE",
}

export interface DocumentData {
  id?: string;
  type: DocumentType;
  fileName: string;
  fileUrl?: string;
  fileSize: number;
  uploadedAt?: Date;
  file?: File; // For client-side upload
}

// Pricing model for menu items
export enum PricingModel {
  PER_PERSON = "PER_PERSON",
  FLAT_RATE = "FLAT_RATE",
}

// Dietary tags for menu items
export enum DietaryTag {
  VEGETARIAN = "VEGETARIAN",
  VEGAN = "VEGAN",
  GLUTEN_FREE = "GLUTEN_FREE",
  DAIRY_FREE = "DAIRY_FREE",
  NUT_FREE = "NUT_FREE",
  HALAL = "HALAL",
  KOSHER = "KOSHER",
}

export interface MenuItemData {
  id?: string;
  name: string;
  description: string;
  price: number;
  dietaryTags: DietaryTag[];
}

// Availability pattern types
export enum AvailabilityPattern {
  WEEKDAYS = "WEEKDAYS",
  WEEKENDS = "WEEKENDS",
  SPECIFIC_DAYS = "SPECIFIC_DAYS",
  CUSTOM = "CUSTOM",
}

export interface AvailabilityDate {
  date: string; // ISO date string
  available: boolean;
  note?: string;
}

export interface AvailabilityData {
  pricingModel: PricingModel;
  dates: AvailabilityDate[];
  recurringPattern?: AvailabilityPattern;
  recurringDays?: number[]; // 0-6 for Sunday-Saturday
}

// Step 1: Business Information
export interface BusinessInfoData {
  businessName: string;
  cuisineType: CuisineType[];
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
  capacity: {
    min: number;
    max: number;
  };
  serviceArea: string;
}

// Complete application state
export interface ApplicationState {
  currentStep: number;
  businessInfo: Partial<BusinessInfoData>;
  documents: DocumentData[];
  menu: MenuItemData[];
  availability: Partial<AvailabilityData>;
  isDraft: boolean;
  lastSavedAt?: Date;
}

// Validation errors
export interface ValidationErrors {
  [key: string]: string;
}

// API request types
export interface SaveDraftRequest {
  businessInfo?: Partial<BusinessInfoData>;
  documents?: DocumentData[];
  menu?: MenuItemData[];
  availability?: Partial<AvailabilityData>;
}

export interface SubmitApplicationRequest {
  businessInfo: BusinessInfoData;
  documents: DocumentData[];
  menu: MenuItemData[];
  availability: AvailabilityData;
}

// Step component props
export interface StepProps {
  data: any;
  errors: ValidationErrors;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}
