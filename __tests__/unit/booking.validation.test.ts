/**
 * Unit Tests for Booking Validation Schemas
 * Tests inquiry-proposal validation, line items, and proposal schemas
 */

import { describe, it, expect } from '@jest/globals';
import { EventType } from '@prisma/client';
import {
  inquiryRequestSchema,
  proposalSchema,
  lineItemSchema,
  proposalAcceptSchema,
  bookingRequestSchema,
  bookingUpdateSchema,
  vendorDeclineSchema,
  cancellationSchema,
} from '@/modules/booking/booking.validation';

describe('Inquiry Validation', () => {
  const validInquiry = {
    vendorId: '123e4567-e89b-12d3-a456-426614174000',
    eventDate: '2025-12-25',
    eventTime: '18:00',
    eventType: EventType.WEDDING,
    location: '123 Main Street',
    guestCount: 100,
  };

  describe('Valid inquiry data', () => {
    it('should accept valid inquiry data', () => {
      const result = inquiryRequestSchema.safeParse(validInquiry);
      expect(result.success).toBe(true);
    });

    it('should accept inquiry with special requests', () => {
      const inquiryWithRequests = {
        ...validInquiry,
        specialRequests: 'Please include vegetarian options',
      };
      const result = inquiryRequestSchema.safeParse(inquiryWithRequests);
      expect(result.success).toBe(true);
    });

    it('should accept all valid event types', () => {
      const eventTypes = [
        EventType.WEDDING,
        EventType.CORPORATE,
        EventType.BIRTHDAY,
        EventType.FESTIVAL,
        EventType.OTHER,
      ];

      eventTypes.forEach((eventType) => {
        const inquiry = { ...validInquiry, eventType };
        const result = inquiryRequestSchema.safeParse(inquiry);
        expect(result.success).toBe(true);
      });
    });

    it('should accept minimum guest count', () => {
      const inquiry = { ...validInquiry, guestCount: 1 };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(true);
    });

    it('should accept maximum guest count', () => {
      const inquiry = { ...validInquiry, guestCount: 10000 };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid vendor ID', () => {
    it('should reject invalid UUID format', () => {
      const inquiry = { ...validInquiry, vendorId: 'invalid-uuid' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid vendor ID format');
      }
    });

    it('should reject missing vendor ID', () => {
      const { vendorId, ...inquiryWithoutVendor } = validInquiry;
      const result = inquiryRequestSchema.safeParse(inquiryWithoutVendor);
      expect(result.success).toBe(false);
    });

    it('should reject empty string vendor ID', () => {
      const inquiry = { ...validInquiry, vendorId: '' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
    });
  });

  describe('Event date validation', () => {
    it('should reject past dates', () => {
      const inquiry = { ...validInquiry, eventDate: '2020-01-01' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('future');
      }
    });

    it('should reject invalid date format', () => {
      const inquiry = { ...validInquiry, eventDate: '12/25/2025' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('YYYY-MM-DD');
      }
    });

    it('should reject invalid date values', () => {
      const inquiry = { ...validInquiry, eventDate: '2025-13-45' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
    });

    it('should reject missing event date', () => {
      const { eventDate, ...inquiryWithoutDate } = validInquiry;
      const result = inquiryRequestSchema.safeParse(inquiryWithoutDate);
      expect(result.success).toBe(false);
    });

    it('should accept today as event date', () => {
      const today = new Date().toISOString().split('T')[0];
      const inquiry = { ...validInquiry, eventDate: today };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(true);
    });
  });

  describe('Event time validation', () => {
    it('should accept valid 24-hour time format', () => {
      const times = ['00:00', '09:30', '12:00', '18:45', '23:59'];
      times.forEach((eventTime) => {
        const inquiry = { ...validInquiry, eventTime };
        const result = inquiryRequestSchema.safeParse(inquiry);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid time format', () => {
      const inquiry = { ...validInquiry, eventTime: '6:00 PM' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('HH:MM');
      }
    });

    it('should reject invalid hour values', () => {
      const inquiry = { ...validInquiry, eventTime: '25:00' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
    });

    it('should reject invalid minute values', () => {
      const inquiry = { ...validInquiry, eventTime: '12:60' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
    });
  });

  describe('Guest count validation', () => {
    it('should reject guest count below minimum', () => {
      const inquiry = { ...validInquiry, guestCount: 0 };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 1');
      }
    });

    it('should reject guest count above maximum', () => {
      const inquiry = { ...validInquiry, guestCount: 10001 };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot exceed 10,000');
      }
    });

    it('should reject non-integer guest count', () => {
      const inquiry = { ...validInquiry, guestCount: 50.5 };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('whole number');
      }
    });

    it('should reject negative guest count', () => {
      const inquiry = { ...validInquiry, guestCount: -10 };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
    });
  });

  describe('Event type validation', () => {
    it('should reject invalid event type', () => {
      const inquiry = { ...validInquiry, eventType: 'INVALID_TYPE' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid event type');
      }
    });

    it('should reject missing event type', () => {
      const { eventType, ...inquiryWithoutType } = validInquiry;
      const result = inquiryRequestSchema.safeParse(inquiryWithoutType);
      expect(result.success).toBe(false);
    });
  });

  describe('Location validation', () => {
    it('should reject location shorter than 5 characters', () => {
      const inquiry = { ...validInquiry, location: 'Apt' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 5 characters');
      }
    });

    it('should reject location longer than 500 characters', () => {
      const inquiry = { ...validInquiry, location: 'A'.repeat(501) };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 500 characters');
      }
    });

    it('should trim whitespace from location', () => {
      const inquiry = { ...validInquiry, location: '  123 Main St  ' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.location).toBe('123 Main St');
      }
    });
  });

  describe('Special requests validation', () => {
    it('should accept optional special requests', () => {
      const { specialRequests, ...inquiryWithoutRequests } = validInquiry;
      const result = inquiryRequestSchema.safeParse(inquiryWithoutRequests);
      expect(result.success).toBe(true);
    });

    it('should reject special requests longer than 2000 characters', () => {
      const inquiry = { ...validInquiry, specialRequests: 'A'.repeat(2001) };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 2000 characters');
      }
    });

    it('should trim whitespace from special requests', () => {
      const inquiry = { ...validInquiry, specialRequests: '  Please note  ' };
      const result = inquiryRequestSchema.safeParse(inquiry);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.specialRequests).toBe('Please note');
      }
    });
  });
});

describe('Line Item Validation', () => {
  const validLineItem = {
    name: 'Tacos',
    quantity: 10,
    unitPrice: 5.0,
    total: 50.0,
  };

  describe('Valid line item data', () => {
    it('should accept valid line item', () => {
      const result = lineItemSchema.safeParse(validLineItem);
      expect(result.success).toBe(true);
    });

    it('should accept zero unit price', () => {
      const item = { ...validLineItem, unitPrice: 0, total: 0 };
      const result = lineItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });
  });

  describe('Name validation', () => {
    it('should reject empty name', () => {
      const item = { ...validLineItem, name: '' };
      const result = lineItemSchema.safeParse(item);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject name longer than 200 characters', () => {
      const item = { ...validLineItem, name: 'A'.repeat(201) };
      const result = lineItemSchema.safeParse(item);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 200 characters');
      }
    });

    it('should trim whitespace from name', () => {
      const item = { ...validLineItem, name: '  Tacos  ' };
      const result = lineItemSchema.safeParse(item);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Tacos');
      }
    });
  });

  describe('Quantity validation', () => {
    it('should reject quantity less than 1', () => {
      const item = { ...validLineItem, quantity: 0 };
      const result = lineItemSchema.safeParse(item);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 1');
      }
    });

    it('should reject non-integer quantity', () => {
      const item = { ...validLineItem, quantity: 5.5 };
      const result = lineItemSchema.safeParse(item);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('whole number');
      }
    });
  });

  describe('Price validation', () => {
    it('should reject negative unit price', () => {
      const item = { ...validLineItem, unitPrice: -5 };
      const result = lineItemSchema.safeParse(item);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('non-negative');
      }
    });

    it('should reject negative total', () => {
      const item = { ...validLineItem, total: -50 };
      const result = lineItemSchema.safeParse(item);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('non-negative');
      }
    });
  });
});

describe('Proposal Validation', () => {
  const validProposal = {
    proposalAmount: 1000,
    proposalDetails: {
      lineItems: [
        {
          name: 'Tacos',
          quantity: 50,
          unitPrice: 10,
          total: 500,
        },
        {
          name: 'Burritos',
          quantity: 50,
          unitPrice: 10,
          total: 500,
        },
      ],
      inclusions: ['Plates', 'Napkins', 'Utensils'],
      terms: 'Payment due 48 hours before event',
    },
    expiresInDays: 7,
  };

  describe('Valid proposal data', () => {
    it('should accept valid proposal', () => {
      const result = proposalSchema.safeParse(validProposal);
      expect(result.success).toBe(true);
    });

    it('should accept proposal without terms', () => {
      const { terms, ...detailsWithoutTerms } = validProposal.proposalDetails;
      const proposal = {
        ...validProposal,
        proposalDetails: detailsWithoutTerms,
      };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(true);
    });

    it('should accept proposal without expiration (will use default)', () => {
      const { expiresInDays, ...proposalWithoutExpiry } = validProposal;
      const result = proposalSchema.safeParse(proposalWithoutExpiry);
      expect(result.success).toBe(true);
      // Note: Zod defaults work during parsing, actual default applied server-side
    });
  });

  describe('Proposal amount validation', () => {
    it('should reject zero proposal amount', () => {
      const proposal = { ...validProposal, proposalAmount: 0 };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject negative proposal amount', () => {
      const proposal = { ...validProposal, proposalAmount: -100 };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject proposal amount above maximum', () => {
      const proposal = { ...validProposal, proposalAmount: 1000001 };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot exceed 1,000,000');
      }
    });
  });

  describe('Line items validation', () => {
    it('should require at least one line item', () => {
      const proposal = {
        ...validProposal,
        proposalDetails: {
          ...validProposal.proposalDetails,
          lineItems: [],
        },
      };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one line item');
      }
    });

    it('should validate all line items', () => {
      const proposal = {
        ...validProposal,
        proposalDetails: {
          ...validProposal.proposalDetails,
          lineItems: [
            { name: 'Invalid', quantity: -1, unitPrice: 10, total: -10 },
          ],
        },
      };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
    });
  });

  describe('Inclusions validation', () => {
    it('should require at least one inclusion', () => {
      const proposal = {
        ...validProposal,
        proposalDetails: {
          ...validProposal.proposalDetails,
          inclusions: [],
        },
      };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one inclusion');
      }
    });

    it('should accept multiple inclusions', () => {
      const proposal = {
        ...validProposal,
        proposalDetails: {
          ...validProposal.proposalDetails,
          inclusions: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
        },
      };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(true);
    });
  });

  describe('Terms validation', () => {
    it('should reject terms longer than 2000 characters', () => {
      const proposal = {
        ...validProposal,
        proposalDetails: {
          ...validProposal.proposalDetails,
          terms: 'A'.repeat(2001),
        },
      };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 2000 characters');
      }
    });

    it('should trim whitespace from terms', () => {
      const proposal = {
        ...validProposal,
        proposalDetails: {
          ...validProposal.proposalDetails,
          terms: '  Terms and conditions  ',
        },
      };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.proposalDetails.terms).toBe('Terms and conditions');
      }
    });
  });

  describe('Expiration validation', () => {
    it('should reject expiration less than 1 day', () => {
      const proposal = { ...validProposal, expiresInDays: 0 };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 1 day');
      }
    });

    it('should reject expiration more than 30 days', () => {
      const proposal = { ...validProposal, expiresInDays: 31 };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot exceed 30 days');
      }
    });

    it('should reject non-integer expiration days', () => {
      const proposal = { ...validProposal, expiresInDays: 7.5 };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('whole number');
      }
    });

    it('should accept minimum expiration', () => {
      const proposal = { ...validProposal, expiresInDays: 1 };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(true);
    });

    it('should accept maximum expiration', () => {
      const proposal = { ...validProposal, expiresInDays: 30 };
      const result = proposalSchema.safeParse(proposal);
      expect(result.success).toBe(true);
    });
  });
});

describe('Proposal Accept Validation', () => {
  it('should accept when terms are true', () => {
    const result = proposalAcceptSchema.safeParse({ acceptTerms: true });
    expect(result.success).toBe(true);
  });

  it('should reject when terms are false', () => {
    const result = proposalAcceptSchema.safeParse({ acceptTerms: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('must accept the terms');
    }
  });

  it('should reject missing acceptTerms', () => {
    const result = proposalAcceptSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('Vendor Decline Validation', () => {
  it('should accept valid decline reason', () => {
    const result = vendorDeclineSchema.safeParse({
      reason: 'Not available on this date',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional reason', () => {
    const result = vendorDeclineSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject reason shorter than 10 characters', () => {
    const result = vendorDeclineSchema.safeParse({ reason: 'Too short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 10 characters');
    }
  });

  it('should reject reason longer than 1000 characters', () => {
    const result = vendorDeclineSchema.safeParse({ reason: 'A'.repeat(1001) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('less than 1000 characters');
    }
  });
});

describe('Cancellation Validation', () => {
  it('should accept valid cancellation reason', () => {
    const result = cancellationSchema.safeParse({
      reason: 'Changed plans',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional reason', () => {
    const result = cancellationSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject reason shorter than 5 characters', () => {
    const result = cancellationSchema.safeParse({ reason: 'Oops' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 5 characters');
    }
  });

  it('should reject reason longer than 1000 characters', () => {
    const result = cancellationSchema.safeParse({ reason: 'A'.repeat(1001) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('less than 1000 characters');
    }
  });
});
