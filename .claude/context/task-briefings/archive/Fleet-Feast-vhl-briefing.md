# Briefing: Fleet-Feast-vhl

**Generated**: 2025-12-07T20:45:00-05:00
**Agent**: Avery_Audit
**Task**: Verify heading hierarchy across all pages

---

## Task Details

**Objective**: Run accessibility audit to verify heading hierarchy has no skipped levels (e.g., H1 to H3 without H2).

**Priority**: 3 (Should Do)
**Type**: Verification
**WCAG Requirement**: 1.3.1 Info and Relationships (Level A)

---

## Verification Approach

1. **Sample Key Pages** - Check heading structure on:
   - Homepage (/)
   - Search page (/search)
   - Truck detail page (/trucks/[id])
   - Customer dashboard (/customer/dashboard)
   - Vendor dashboard (/vendor/dashboard)
   - Admin dashboard (/admin/dashboard)

2. **What to Check**:
   - Each page has exactly one H1
   - Headings follow logical order (H1 → H2 → H3, no skipping)
   - No empty headings
   - Headings describe content appropriately

3. **Common Issues to Look For**:
   - H1 to H3 skip (missing H2)
   - Multiple H1 elements
   - Using heading tags for styling (should use CSS instead)
   - Decorative text styled as headings

---

## Acceptance Criteria

- [ ] Audit at least 6 key pages
- [ ] Document any heading hierarchy issues found
- [ ] If issues exist, create fix tasks or fix directly
- [ ] Report pass/fail status

---

## Expected Output

If PASS: "Heading hierarchy verified. No skipped levels found across [N] pages."

If FAIL: List issues with:
- Page URL
- Current structure (e.g., "H1 → H3 → H4")
- Recommended fix (e.g., "Change H3 to H2")
