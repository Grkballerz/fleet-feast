# Task 2.4: Admin Dashboard - Vendor Approval

## Objective
Create the admin interface for reviewing and approving/rejecting vendor applications.

## Requirements (from PRD)
- F3: Admin Approval Dashboard
- Platform admin interface to review applications
- Verify documents
- Approve/reject vendors
- Role: Admin only access

## Acceptance Criteria
- [ ] Admin-only protected route
- [ ] List of pending applications
- [ ] Application detail view
- [ ] Document viewer with verification toggle
- [ ] Approve/Reject actions with reason field
- [ ] Approved vendors activated automatically
- [ ] Email notifications on approval/rejection
- [ ] Filter by status (pending, approved, rejected)
- [ ] Search by business name

## Deliverables
- [ ] app/admin/vendors/page.tsx (list)
- [ ] app/admin/vendors/[id]/page.tsx (detail)
- [ ] components/admin/ApplicationReview.tsx
- [ ] components/admin/DocumentViewer.tsx
- [ ] app/api/admin/vendors/[id]/approve/route.ts
- [ ] app/api/admin/vendors/[id]/reject/route.ts

## Dependencies
- [ ] Task 1.6 - Authentication System Setup
- [ ] Task 2.2 - Vendor Application Backend

## Assigned
Parker_Pages

## Priority
high

## Files
- app/admin/vendors/page.tsx
- app/admin/vendors/[id]/page.tsx
- components/admin/ApplicationReview.tsx
- components/admin/DocumentViewer.tsx
- app/api/admin/vendors/[id]/approve/route.ts
- app/api/admin/vendors/[id]/reject/route.ts

## Status
[ ]
