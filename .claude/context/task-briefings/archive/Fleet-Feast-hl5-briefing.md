# Briefing: Fleet-Feast-hl5

Generated: 2025-12-17T02:03:00Z
Agent: Jordan_Junction (Frontend-Backend Integration)

## Task Details

**ID**: Fleet-Feast-hl5
**Title**: Add vendor location and service radius settings
**Priority**: 2 (High)
**Type**: Feature
**Phase**: 2

## Objective

Enable vendors to set their base location and service radius on their profile dashboard, enabling location-based search and filtering for customers.

## Current State Analysis

### Database (prisma/schema.prisma:183-229)
The Vendor model currently has:
- `serviceArea String?` - Free text like "Manhattan, Brooklyn"
- `location String?` - Stored as "lat,lng" for proximity searches

**Missing**: `serviceRadius` field for specifying service distance in miles.

### API (app/api/vendor/profile/route.ts)
- GET/PUT endpoints exist and return `serviceArea` and `location`
- Uses `vendorProfileUpdateSchema` from `modules/vendor/vendor.validation`
- Uses `updateVendorProfile` from `modules/vendor/vendor.service`

### Frontend (app/vendor/profile/page.tsx)
- Profile editing form exists but does NOT include location/service area fields
- Need to add new "Service Area" card with:
  - Location input (address or lat/lng)
  - Service radius dropdown (5mi, 10mi, 25mi, 50mi, 100mi)
  - Map preview (optional, nice-to-have)

## Requirements

### 1. Database Changes
Add to Vendor model in prisma/schema.prisma:
```prisma
serviceRadius Int? @map("service_radius") // Miles: 5, 10, 25, 50, 100
latitude      Float?
longitude     Float?
```
Consider: Either keep `location` string OR migrate to separate lat/lng fields.

### 2. API Changes
Files to modify:
- `modules/vendor/vendor.validation.ts` - Add serviceRadius, latitude, longitude to schema
- `modules/vendor/vendor.service.ts` - Handle new fields in updateVendorProfile
- `app/api/vendor/profile/route.ts` - Already returns location, add new fields

### 3. Search API Changes
Files to check/modify:
- `app/api/search/route.ts` or similar - Add location-based filtering
- Filter logic: Show trucks where customer location is within vendor's service radius

### 4. Frontend Changes
File: `app/vendor/profile/page.tsx`
- Add "Service Area" card with:
  - Location input field (address with geocoding OR lat/lng manual entry)
  - Service radius dropdown: 5mi, 10mi, 25mi, 50mi, 100mi
  - Optional: Map preview showing service radius circle

## Acceptance Criteria

- [ ] Vendors can set their base location (latitude/longitude)
- [ ] Vendors can set service radius (5, 10, 25, 50, or 100 miles)
- [ ] Location and radius saved to database
- [ ] Search can filter by customer location (if implemented)
- [ ] Trucks only shown if customer is within service radius (if search updated)

## Files to Modify

1. `prisma/schema.prisma` - Add serviceRadius, latitude, longitude fields
2. `modules/vendor/vendor.validation.ts` - Update validation schema
3. `modules/vendor/vendor.service.ts` - Update profile service
4. `app/api/vendor/profile/route.ts` - Return new fields
5. `app/vendor/profile/page.tsx` - Add Service Area UI card
6. `app/api/search/route.ts` (if exists) - Add location filtering

## Technical Notes

- After schema changes, run: `npx prisma migrate dev --name add-vendor-location-radius`
- For geocoding addresses to lat/lng, consider browser Geolocation API or a geocoding service
- Distance calculation: Use Haversine formula for lat/lng distance

## PRD Reference

From MASTER_PRD.md Feature F5 (Search & Discovery):
> "Search food trucks with filters: cuisine type, price range, event type, guest capacity, availability date, rating. Location-based results."

This task enables the location-based search capability referenced in the PRD.

## Dependencies Completed

- Fleet-Feast-0aj (Remove NYC-specific references) - CLOSED ✓

## Gap Checklist

Run gap analysis after implementation using:
- Critical: Functionality works, data saves correctly, no runtime errors
- Important: Good UX, proper validation, error handling
- Nice-to-have: Map preview, address autocomplete
