/**
 * Fleet Feast - Type Definitions
 * Shared TypeScript types across the application
 */

// User types
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  VENDOR = "VENDOR",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Booking types
export enum BookingStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  DISPUTED = "DISPUTED",
}

export interface Booking {
  id: string;
  customerId: string;
  vendorId: string;
  eventDate: Date;
  eventLocation: string;
  guestCount: number;
  status: BookingStatus;
  totalAmount: number;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment types
export enum PaymentStatus {
  PENDING = "PENDING",
  AUTHORIZED = "AUTHORIZED",
  CAPTURED = "CAPTURED",
  RELEASED = "RELEASED",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  platformFee: number;
  vendorPayout: number;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vendor types
export enum VendorStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export enum CuisineType {
  AMERICAN = "AMERICAN",
  MEXICAN = "MEXICAN",
  ITALIAN = "ITALIAN",
  ASIAN = "ASIAN",
  BBQ = "BBQ",
  DESSERT = "DESSERT",
  VEGETARIAN = "VEGETARIAN",
  OTHER = "OTHER",
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  cuisineType: CuisineType[];
  pricePerPerson: number;
  minimumGuests: number;
  maximumGuests: number;
  status: VendorStatus;
  logoUrl?: string;
  truckPhotoUrls: string[];
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message types
export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  recipientId: string;
  content: string;
  flagged: boolean;
  createdAt: Date;
}

// Review types
export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface BookingFormData {
  vendorId: string;
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  specialRequests?: string;
}

export interface VendorApplicationFormData {
  businessName: string;
  description: string;
  cuisineType: CuisineType[];
  pricePerPerson: number;
  minimumGuests: number;
  maximumGuests: number;
}

// Search types
export interface VendorSearchFilters {
  cuisineType?: CuisineType[];
  minPrice?: number;
  maxPrice?: number;
  minGuests?: number;
  maxGuests?: number;
  eventDate?: string;
  location?: string;
}

// NextAuth types extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
