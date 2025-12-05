/**
 * Anti-Circumvention Detection Module
 * Scans message content for attempts to exchange contact information
 */

import { MessageSeverity } from "@prisma/client";
import type {
  CircumventionPattern,
  CircumventionResult,
  CircumventionType,
} from "./messaging.types";

/**
 * Circumvention patterns to detect
 * Each pattern has a regex, type, severity, and description
 */
export const CIRCUMVENTION_PATTERNS: CircumventionPattern[] = [
  // Phone numbers - various formats
  {
    pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    type: "PHONE",
    severity: MessageSeverity.HIGH,
    description: "US phone number (formatted)",
  },
  {
    pattern: /\b\d{10,11}\b/g,
    type: "PHONE",
    severity: MessageSeverity.MEDIUM,
    description: "10-11 digit sequence (possible phone)",
  },
  {
    pattern: /\b(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    type: "PHONE",
    severity: MessageSeverity.HIGH,
    description: "International phone number",
  },

  // Email addresses
  {
    pattern: /\b[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}\b/gi,
    type: "EMAIL",
    severity: MessageSeverity.HIGH,
    description: "Email address",
  },
  {
    pattern: /\b[\w._%+-]+\s*@\s*[\w.-]+\s*\.\s*[a-zA-Z]{2,}\b/gi,
    type: "EMAIL",
    severity: MessageSeverity.HIGH,
    description: "Email address (spaced to avoid detection)",
  },
  {
    pattern: /\b[\w._%+-]+\s*\[at\]\s*[\w.-]+\s*\[dot\]\s*[a-zA-Z]{2,}\b/gi,
    type: "EMAIL",
    severity: MessageSeverity.MEDIUM,
    description: "Email address (obfuscated with [at]/[dot])",
  },

  // Social media handles
  {
    pattern: /@[\w]{3,}/g,
    type: "SOCIAL_HANDLE",
    severity: MessageSeverity.MEDIUM,
    description: "Social media handle (@username)",
  },

  // Social media platform mentions
  {
    pattern: /\b(instagram|insta|ig|facebook|fb|whatsapp|telegram|snapchat|tiktok|twitter|discord)\b/gi,
    type: "SOCIAL_PLATFORM",
    severity: MessageSeverity.MEDIUM,
    description: "Social media platform mention",
  },

  // Coded language suggesting off-platform communication
  {
    pattern: /\b(call me|text me|my number|my email|reach me at|contact me|dm me|message me|off platform|outside|direct contact)\b/gi,
    type: "CODED",
    severity: MessageSeverity.LOW,
    description: "Coded language suggesting external contact",
  },

  // External URLs (excluding whitelisted domains)
  {
    pattern: /https?:\/\/(?!fleetfeast\.com)[\w.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/gi,
    type: "EXTERNAL_URL",
    severity: MessageSeverity.MEDIUM,
    description: "External URL (non-FleetFeast)",
  },

  // Number sequences that might be phone numbers
  {
    pattern: /\b\d{3}\s*\d{3}\s*\d{4}\b/g,
    type: "PHONE",
    severity: MessageSeverity.MEDIUM,
    description: "Spaced digit sequence (possible phone)",
  },
];

/**
 * Scan message content for circumvention patterns
 *
 * @param content - Message content to scan
 * @returns Array of detected circumvention attempts
 */
export function scanForCircumvention(content: string): CircumventionResult[] {
  const results: CircumventionResult[] = [];

  for (const { pattern, type, severity, description } of CIRCUMVENTION_PATTERNS) {
    // Reset regex lastIndex to ensure fresh matching
    pattern.lastIndex = 0;

    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      // Get positions of all matches
      const positions: (number | undefined)[] = [];
      pattern.lastIndex = 0; // Reset again
      let match;

      while ((match = pattern.exec(content)) !== null) {
        positions.push(match.index);
      }

      results.push({
        type,
        severity,
        matches,
        positions,
      });
    }
  }

  return results;
}

/**
 * Check if content contains any high-severity violations
 *
 * @param results - Circumvention detection results
 * @returns True if high-severity violations exist
 */
export function hasHighSeverityViolations(
  results: CircumventionResult[]
): boolean {
  return results.some((r) => r.severity === MessageSeverity.HIGH);
}

/**
 * Get the highest severity level from detection results
 *
 * @param results - Circumvention detection results
 * @returns Highest severity level found
 */
export function getHighestSeverity(
  results: CircumventionResult[]
): MessageSeverity {
  if (results.length === 0) {
    return MessageSeverity.NONE;
  }

  const severityOrder = {
    [MessageSeverity.NONE]: 0,
    [MessageSeverity.LOW]: 1,
    [MessageSeverity.MEDIUM]: 2,
    [MessageSeverity.HIGH]: 3,
  };

  let highest = MessageSeverity.NONE;
  for (const result of results) {
    if (severityOrder[result.severity] > severityOrder[highest]) {
      highest = result.severity;
    }
  }

  return highest;
}

/**
 * Generate a human-readable flag reason from detection results
 *
 * @param results - Circumvention detection results
 * @returns Formatted reason string
 */
export function generateFlagReason(results: CircumventionResult[]): string {
  const types = [...new Set(results.map((r) => r.type))];
  const typeDescriptions: Record<CircumventionType, string> = {
    PHONE: "phone number",
    EMAIL: "email address",
    SOCIAL_HANDLE: "social media handle",
    SOCIAL_PLATFORM: "social media platform",
    CODED: "coded language",
    EXTERNAL_URL: "external URL",
  };

  const reasons = types.map((t) => typeDescriptions[t]);

  if (reasons.length === 0) {
    return "Suspicious content detected";
  } else if (reasons.length === 1) {
    return `Detected ${reasons[0]}`;
  } else if (reasons.length === 2) {
    return `Detected ${reasons[0]} and ${reasons[1]}`;
  } else {
    const last = reasons.pop();
    return `Detected ${reasons.join(", ")}, and ${last}`;
  }
}

/**
 * Get sanitized matches for logging (truncate long matches)
 *
 * @param matches - Array of matched strings
 * @param maxLength - Maximum length per match
 * @returns Sanitized matches
 */
export function getSanitizedMatches(
  matches: string[],
  maxLength: number = 50
): string[] {
  return matches.map((m) =>
    m.length > maxLength ? m.substring(0, maxLength) + "..." : m
  );
}
