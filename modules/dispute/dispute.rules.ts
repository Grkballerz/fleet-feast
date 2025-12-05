/**
 * Dispute Auto-Resolution Rules Engine
 * Defines automatic resolution logic for specific dispute types
 */

import {
  DisputeType,
  ResolutionOutcome,
  ResolutionSuggestion,
  DisputeDetails,
} from "./dispute.types";

/**
 * Constants for auto-resolution thresholds
 */
export const LATE_ARRIVAL_THRESHOLDS = {
  MAJOR_LATE_MINUTES: 60, // 1 hour+ = 50% refund
  MINOR_LATE_MINUTES: 30, // 30min+ = 25% refund
};

/**
 * Rule: NO_SHOW - Vendor didn't arrive
 * Auto-resolution: Full refund to customer
 */
function evaluateNoShowRule(dispute: DisputeDetails): ResolutionSuggestion {
  return {
    outcome: ResolutionOutcome.FULL_REFUND,
    refundPercent: 100,
    requiresManualReview: false,
    reason: "Vendor no-show confirmed - full refund applied",
    autoApplicable: true,
  };
}

/**
 * Rule: LATE_ARRIVAL - Vendor arrived late
 * Auto-resolution based on lateness:
 * - 60+ minutes late: 50% refund
 * - 30-59 minutes late: 25% refund
 * - Under 30 minutes: Manual review required
 */
function evaluateLateArrivalRule(dispute: DisputeDetails): ResolutionSuggestion {
  const lateMinutes = dispute.metadata?.lateMinutes as number | undefined;

  if (!lateMinutes || lateMinutes < 0) {
    return {
      outcome: null,
      refundPercent: null,
      requiresManualReview: true,
      reason: "Late arrival time not specified - manual review required",
      autoApplicable: false,
    };
  }

  if (lateMinutes >= LATE_ARRIVAL_THRESHOLDS.MAJOR_LATE_MINUTES) {
    return {
      outcome: ResolutionOutcome.PARTIAL_REFUND,
      refundPercent: 50,
      requiresManualReview: false,
      reason: `Vendor arrived ${lateMinutes} minutes late - 50% refund applied`,
      autoApplicable: true,
    };
  }

  if (lateMinutes >= LATE_ARRIVAL_THRESHOLDS.MINOR_LATE_MINUTES) {
    return {
      outcome: ResolutionOutcome.PARTIAL_REFUND,
      refundPercent: 25,
      requiresManualReview: false,
      reason: `Vendor arrived ${lateMinutes} minutes late - 25% refund applied`,
      autoApplicable: true,
    };
  }

  // Less than 30 minutes late - manual review
  return {
    outcome: null,
    refundPercent: null,
    requiresManualReview: true,
    reason: `Vendor arrived ${lateMinutes} minutes late - under threshold, manual review required`,
    autoApplicable: false,
  };
}

/**
 * Rule: SERVICE_QUALITY - Poor service quality
 * Manual review required - subjective assessment
 */
function evaluateServiceQualityRule(
  dispute: DisputeDetails
): ResolutionSuggestion {
  return {
    outcome: null,
    refundPercent: null,
    requiresManualReview: true,
    reason: "Service quality disputes require manual review and assessment",
    autoApplicable: false,
  };
}

/**
 * Rule: WRONG_ORDER - Incorrect food/menu items
 * Manual review required - need to verify order details
 */
function evaluateWrongOrderRule(dispute: DisputeDetails): ResolutionSuggestion {
  return {
    outcome: null,
    refundPercent: null,
    requiresManualReview: true,
    reason: "Wrong order disputes require manual verification of order details",
    autoApplicable: false,
  };
}

/**
 * Rule: FOOD_QUALITY - Poor food quality
 * Manual review required - subjective assessment
 */
function evaluateFoodQualityRule(dispute: DisputeDetails): ResolutionSuggestion {
  return {
    outcome: null,
    refundPercent: null,
    requiresManualReview: true,
    reason: "Food quality disputes require manual review and assessment",
    autoApplicable: false,
  };
}

/**
 * Rule: OTHER - Generic disputes
 * Always requires manual review
 */
function evaluateOtherRule(dispute: DisputeDetails): ResolutionSuggestion {
  return {
    outcome: null,
    refundPercent: null,
    requiresManualReview: true,
    reason: "Generic disputes require manual review",
    autoApplicable: false,
  };
}

/**
 * Main rule evaluation engine
 * Routes dispute to appropriate rule based on type
 */
export function evaluateDisputeRules(
  dispute: DisputeDetails
): ResolutionSuggestion {
  const disputeType = dispute.type as DisputeType;

  switch (disputeType) {
    case DisputeType.NO_SHOW:
      return evaluateNoShowRule(dispute);

    case DisputeType.LATE_ARRIVAL:
      return evaluateLateArrivalRule(dispute);

    case DisputeType.SERVICE_QUALITY:
      return evaluateServiceQualityRule(dispute);

    case DisputeType.WRONG_ORDER:
      return evaluateWrongOrderRule(dispute);

    case DisputeType.FOOD_QUALITY:
      return evaluateFoodQualityRule(dispute);

    case DisputeType.OTHER:
      return evaluateOtherRule(dispute);

    default:
      return {
        outcome: null,
        refundPercent: null,
        requiresManualReview: true,
        reason: "Unknown dispute type - manual review required",
        autoApplicable: false,
      };
  }
}

/**
 * Check if a dispute can be auto-resolved
 */
export function canAutoResolve(dispute: DisputeDetails): boolean {
  const suggestion = evaluateDisputeRules(dispute);
  return suggestion.autoApplicable && !suggestion.requiresManualReview;
}

/**
 * Get suggested resolution for a dispute
 */
export function getSuggestedResolution(
  dispute: DisputeDetails
): ResolutionSuggestion {
  return evaluateDisputeRules(dispute);
}
