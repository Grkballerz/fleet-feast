# Beads Export

*Generated: Sat, 20 Dec 2025 19:16:02 EST*

## Summary

| Metric | Count |
|--------|-------|
| **Total** | 170 |
| Open | 37 |
| In Progress | 0 |
| Blocked | 0 |
| Closed | 133 |

## Quick Actions

Ready-to-run commands for bulk operations:

```bash
# Close open items (37 total, showing first 10)
bd close Fleet-Feast-azl4 Fleet-Feast-mnxj Fleet-Feast-u0h3 Fleet-Feast-f3y Fleet-Feast-602 Fleet-Feast-zt6 Fleet-Feast-rpi Fleet-Feast-1p1 Fleet-Feast-ndn Fleet-Feast-0jt

# View high-priority items (P0/P1)
bd show Fleet-Feast-azl4 Fleet-Feast-mnxj Fleet-Feast-u0h3 Fleet-Feast-f3y Fleet-Feast-602 Fleet-Feast-zt6 Fleet-Feast-rpi Fleet-Feast-1p1 Fleet-Feast-ndn Fleet-Feast-0jt Fleet-Feast-bb0 Fleet-Feast-wsl Fleet-Feast-cyi Fleet-Feast-l33 Fleet-Feast-88e Fleet-Feast-coe Fleet-Feast-fjp Fleet-Feast-cuk Fleet-Feast-9ji Fleet-Feast-eay Fleet-Feast-dpx Fleet-Feast-exf Fleet-Feast-tp2 Fleet-Feast-y1r Fleet-Feast-5vo Fleet-Feast-jwyf Fleet-Feast-qemg Fleet-Feast-uvzu Fleet-Feast-67o Fleet-Feast-1y0 Fleet-Feast-4ln Fleet-Feast-db3 Fleet-Feast-6ea Fleet-Feast-ea8 Fleet-Feast-b4t Fleet-Feast-skd Fleet-Feast-vwa

```

## Table of Contents

- [🟢 Fleet-Feast-azl4 Integration verification for Helcim payment system](#fleet-feast-azl4)
- [🟢 Fleet-Feast-mnxj Add vendor payout settings page with bank account management](#fleet-feast-mnxj)
- [🟢 Fleet-Feast-u0h3 Update payment page to use HelcimPaymentForm](#fleet-feast-u0h3)
- [🟢 Fleet-Feast-f3y Implement automated vendor payout scheduling system](#fleet-feast-f3y)
- [🟢 Fleet-Feast-602 Create vendor bank account management API](#fleet-feast-602)
- [🟢 Fleet-Feast-zt6 Create Helcim webhook handler for payment events](#fleet-feast-zt6)
- [🟢 Fleet-Feast-rpi Implement payment API endpoints with Helcim integration](#fleet-feast-rpi)
- [🟢 Fleet-Feast-1p1 Install and configure Helcim SDK and API client](#fleet-feast-1p1)
- [🟢 Fleet-Feast-ndn Create internal escrow ledger system for payment tracking](#fleet-feast-ndn)
- [🟢 Fleet-Feast-0jt Add vendor bank account fields to Vendor model](#fleet-feast-0jt)
- [🟢 Fleet-Feast-bb0 Remove Stripe dependencies and clean up Stripe-specific code](#fleet-feast-bb0)
- [🟢 Fleet-Feast-wsl Integrate and verify complete inquiry-proposal-payment flow](#fleet-feast-wsl)
- [🟢 Fleet-Feast-cyi Update /vendor/messages/[bookingId] page with proposal sending](#fleet-feast-cyi)
- [🟢 Fleet-Feast-l33 Update /customer/messages/[bookingId] page with ProposalCard](#fleet-feast-l33)
- [🟢 Fleet-Feast-88e Update /customer/booking page to inquiry-only flow](#fleet-feast-88e)
- [🟢 Fleet-Feast-coe Update booking types and validation for inquiry-proposal flow](#fleet-feast-coe)
- [🟢 Fleet-Feast-fjp Update payment flow for 50/50 platform fee split](#fleet-feast-fjp)
- [🟢 Fleet-Feast-cuk Update POST /api/bookings/:id/decline for inquiry/proposal decline](#fleet-feast-cuk)
- [🟢 Fleet-Feast-9ji Update POST /api/bookings/:id/accept for proposal acceptance](#fleet-feast-9ji)
- [🟢 Fleet-Feast-eay Create POST /api/bookings/:id/proposal endpoint for vendor proposals](#fleet-feast-eay)
- [🟢 Fleet-Feast-dpx Create POST /api/inquiries endpoint for customer inquiry submission](#fleet-feast-dpx)
- [🟢 Fleet-Feast-exf Create and run Prisma migration for inquiry-proposal schema](#fleet-feast-exf)
- [🟢 Fleet-Feast-tp2 Add proposal notification types to NotificationType enum](#fleet-feast-tp2)
- [🟢 Fleet-Feast-y1r Add proposal fields to Booking model](#fleet-feast-y1r)
- [🟢 Fleet-Feast-5vo Update BookingStatus enum with inquiry-proposal flow statuses](#fleet-feast-5vo)
- [🟢 Fleet-Feast-jwyf Write tests for Helcim payment integration](#fleet-feast-jwyf)
- [🟢 Fleet-Feast-qemg Create admin payout management dashboard](#fleet-feast-qemg)
- [🟢 Fleet-Feast-uvzu Create VendorBankAccountForm component for payout setup](#fleet-feast-uvzu)
- [🟢 Fleet-Feast-67o Create HelcimPaymentForm component with Helcim.js](#fleet-feast-67o)
- [🟢 Fleet-Feast-1y0 Write E2E tests for complete inquiry-to-payment flow](#fleet-feast-1y0)
- [🟢 Fleet-Feast-4ln Write integration tests for inquiry-proposal API endpoints](#fleet-feast-4ln)
- [🟢 Fleet-Feast-db3 Write unit tests for inquiry-proposal booking service](#fleet-feast-db3)
- [🟢 Fleet-Feast-6ea Implement proposal notification triggers and email templates](#fleet-feast-6ea)
- [🟢 Fleet-Feast-ea8 Update booking list pages to show new inquiry/proposal statuses](#fleet-feast-ea8)
- [🟢 Fleet-Feast-b4t Create InquiryForm component replacing price calculator](#fleet-feast-b4t)
- [🟢 Fleet-Feast-skd Create ProposalBuilder component for vendors to create proposals](#fleet-feast-skd)
- [🟢 Fleet-Feast-vwa Create ProposalCard component for message thread display](#fleet-feast-vwa)
- [⚫ Fleet-Feast-0fi Vendor Bookings page (/vendor/bookings) missing sidebar navigation - user stuck](#fleet-feast-0fi)
- [⚫ Fleet-Feast-w98 Vendor Messages page (/vendor/messages) missing sidebar navigation - user stuck](#fleet-feast-w98)
- [⚫ Fleet-Feast-bxz Customer Bookings page (/customer/bookings) missing sidebar navigation - user stuck](#fleet-feast-bxz)
- [⚫ Fleet-Feast-822 Customer Messages page (/customer/messages) missing sidebar navigation - user stuck](#fleet-feast-822)
- [⚫ Fleet-Feast-tet Mobile bottom nav Messages link goes to /dashboard/messages (404) instead of role-specific path](#fleet-feast-tet)
- [⚫ Fleet-Feast-dsr Fix Dropdown being clipped inside MobileDrawer - overflow issue](#fleet-feast-dsr)
- [⚫ Fleet-Feast-p9n Fix MobileDrawer z-index - menu appears under HeroSection instead of on top](#fleet-feast-p9n)
- [⚫ Fleet-Feast-ded Fix MobileDrawer opening from wrong side - should open from RIGHT to match hamburger button position](#fleet-feast-ded)
- [⚫ Fleet-Feast-z9k Auth redirect loop - middleware getToken() fails to read valid session](#fleet-feast-z9k)
- [⚫ Fleet-Feast-bz5 Fix /api/trucks endpoint returning HTML instead of JSON](#fleet-feast-bz5)
- [⚫ Fleet-Feast-rfr Fix Rating.tsx hydration error - button nested inside button](#fleet-feast-rfr)
- [⚫ Fleet-Feast-daa Restyle Layout Components (Header, Footer, Sidebar, Navigation)](#fleet-feast-daa)
- [⚫ Fleet-Feast-hv0 Restyle Core UI Components (Button, Input, Card, Modal, Badge)](#fleet-feast-hv0)
- [⚫ Fleet-Feast-wo2 Design System: Neo-Brutalist Glassmorphism Foundation](#fleet-feast-wo2)
- [⚫ Fleet-Feast-5oq HOTFIX: Rate limit middleware breaks auth session endpoint](#fleet-feast-5oq)
- [⚫ Fleet-Feast-9iz Re-validate production readiness after blocker fixes](#fleet-feast-9iz)
- [⚫ Fleet-Feast-2c9 BLOCKER: Fix Jest configuration for Next.js 14 integration tests](#fleet-feast-2c9)
- [⚫ Fleet-Feast-pe7 BLOCKER: Fix route group conflicts preventing production build](#fleet-feast-pe7)
- [⚫ Fleet-Feast-me3 CRITICAL: Dynamic route conflict prevents server startup](#fleet-feast-me3)
- [⚫ Fleet-Feast-eh7 Phase A: Foundation](#fleet-feast-eh7)
- [⚫ Fleet-Feast-uhr Fix sticky booking card getting cut off by header](#fleet-feast-uhr)
- [⚫ Fleet-Feast-ztv Fix 404 error on Book This Truck button and calendar date clicks](#fleet-feast-ztv)
- [⚫ Fleet-Feast-76i Update trucks service to include coverImageUrl in responses](#fleet-feast-76i)
- [⚫ Fleet-Feast-dhq Update FeaturedTrucks to fetch real vendors from API](#fleet-feast-dhq)
- [⚫ Fleet-Feast-0pq Update seed data with coverImageUrl for 5 featured vendors](#fleet-feast-0pq)
- [⚫ Fleet-Feast-sh6 Generate AI images for 5 featured food trucks](#fleet-feast-sh6)
- [⚫ Fleet-Feast-3lk Add coverImageUrl field to Vendor model](#fleet-feast-3lk)
- [⚫ Fleet-Feast-dtb Homepage images don't load unless user is logged in](#fleet-feast-dtb)
- [⚫ Fleet-Feast-4pk Missing /unauthorized page shows 404 instead of proper error message](#fleet-feast-4pk)
- [⚫ Fleet-Feast-9pf Vendor messages page throws 'Cannot read properties of undefined (reading avatarUrl)'](#fleet-feast-9pf)
- [⚫ Fleet-Feast-679 Vendor dashboard shows 'bookings.filter is not a function' error](#fleet-feast-679)
- [⚫ Fleet-Feast-wuc Search page shows 0 results but API returns 8 trucks](#fleet-feast-wuc)
- [⚫ Fleet-Feast-n5o C:/Program Files/Git/vendor/apply should be public but redirects to login](#fleet-feast-n5o)
- [⚫ Fleet-Feast-dbr Fix mobile navigation menu not opening](#fleet-feast-dbr)
- [⚫ Fleet-Feast-6sb Make food truck profiles publicly accessible](#fleet-feast-6sb)
- [⚫ Fleet-Feast-8wp Accessibility Audit for New Design System](#fleet-feast-8wp)
- [⚫ Fleet-Feast-vr7 Responsive Testing & Mobile Optimization](#fleet-feast-vr7)
- [⚫ Fleet-Feast-eeu Restyle Static Pages (About, Contact, FAQ)](#fleet-feast-eeu)
- [⚫ Fleet-Feast-not Restyle Messaging System](#fleet-feast-not)
- [⚫ Fleet-Feast-4ce Restyle Admin Dashboard & Management Pages](#fleet-feast-4ce)
- [⚫ Fleet-Feast-526 Restyle Vendor Application Flow](#fleet-feast-526)
- [⚫ Fleet-Feast-6of Restyle Vendor Dashboard & Management Pages](#fleet-feast-6of)
- [⚫ Fleet-Feast-0qv Restyle Customer Dashboard & Booking Pages](#fleet-feast-0qv)
- [⚫ Fleet-Feast-8gg Restyle Authentication Pages](#fleet-feast-8gg)
- [⚫ Fleet-Feast-jma Restyle Food Truck Detail Pages](#fleet-feast-jma)
- [⚫ Fleet-Feast-cc2 Restyle Search & Discovery Pages](#fleet-feast-cc2)
- [⚫ Fleet-Feast-d59 Restyle Homepage & Public Marketing Sections](#fleet-feast-d59)
- [⚫ Fleet-Feast-pcn HOTFIX: Search sort dropdown component broken](#fleet-feast-pcn)
- [⚫ Fleet-Feast-ue6 Loyalty discount system not implemented](#fleet-feast-ue6)
- [⚫ Fleet-Feast-gm5 Cancellation policy refund calculation missing](#fleet-feast-gm5)
- [⚫ Fleet-Feast-016 Final Validation & Launch Checklist](#fleet-feast-016)
- [⚫ Fleet-Feast-bgd Infrastructure Configuration](#fleet-feast-bgd)
- [⚫ Fleet-Feast-4cw CI/CD Pipeline Setup](#fleet-feast-4cw)
- [⚫ Fleet-Feast-2v4 Security Fixes](#fleet-feast-2v4)
- [⚫ Fleet-Feast-4f4 Compliance Audit](#fleet-feast-4f4)
- [⚫ Fleet-Feast-04a Security Audit](#fleet-feast-04a)
- [⚫ Fleet-Feast-8sg Bug Fixes from QA](#fleet-feast-8sg)
- [⚫ Fleet-Feast-c2q Payment Flow Testing](#fleet-feast-c2q)
- [⚫ Fleet-Feast-qjr QA Validation - Feature Completeness](#fleet-feast-qjr)
- [⚫ Fleet-Feast-6fo E2E Tests - Critical User Flows](#fleet-feast-6fo)
- [⚫ Fleet-Feast-2w3 Integration Tests - API Endpoints](#fleet-feast-2w3)
- [⚫ Fleet-Feast-es6 Unit Test Suite - Frontend Components](#fleet-feast-es6)
- [⚫ Fleet-Feast-2tl Unit Test Suite - Backend Services](#fleet-feast-2tl)
- [⚫ Fleet-Feast-dw4 Code Review - Frontend Components](#fleet-feast-dw4)
- [⚫ Fleet-Feast-5ey Code Review - Auth & Core APIs](#fleet-feast-5ey)
- [⚫ Fleet-Feast-v16 Messaging Interface](#fleet-feast-v16)
- [⚫ Fleet-Feast-r28 Booking Flow Pages](#fleet-feast-r28)
- [⚫ Fleet-Feast-dxo Food Truck Profile Pages](#fleet-feast-dxo)
- [⚫ Fleet-Feast-zyk Food Truck Search & Discovery Pages](#fleet-feast-zyk)
- [⚫ Fleet-Feast-qm9 Vendor Application Pages](#fleet-feast-qm9)
- [⚫ Fleet-Feast-8ve Authentication Pages](#fleet-feast-8ve)
- [⚫ Fleet-Feast-9xc Violation & Penalty System](#fleet-feast-9xc)
- [⚫ Fleet-Feast-32i Dispute Resolution System](#fleet-feast-32i)
- [⚫ Fleet-Feast-2f0 Messaging System with Anti-Circumvention](#fleet-feast-2f0)
- [⚫ Fleet-Feast-5cl Payment & Escrow System](#fleet-feast-5cl)
- [⚫ Fleet-Feast-bj4 Review & Rating System](#fleet-feast-bj4)
- [⚫ Fleet-Feast-wu8 Booking System API](#fleet-feast-wu8)
- [⚫ Fleet-Feast-5ub Navigation & Layout System](#fleet-feast-5ub)
- [⚫ Fleet-Feast-w6w Food Truck Profiles & Search API](#fleet-feast-w6w)
- [⚫ Fleet-Feast-e63 API Middleware & Rate Limiting](#fleet-feast-e63)
- [⚫ Fleet-Feast-ok7 Vendor Application & Onboarding API](#fleet-feast-ok7)
- [⚫ Fleet-Feast-bxt UI Component Library](#fleet-feast-bxt)
- [⚫ Fleet-Feast-igb Authentication System Implementation](#fleet-feast-igb)
- [⚫ Fleet-Feast-nww Global Styles & Theme Implementation](#fleet-feast-nww)
- [⚫ Fleet-Feast-3rw Database Implementation & Migrations](#fleet-feast-3rw)
- [⚫ Fleet-Feast-mx9 Design Patterns & Code Standards](#fleet-feast-mx9)
- [⚫ Fleet-Feast-zjd API Design & Specification](#fleet-feast-zjd)
- [⚫ Fleet-Feast-fja Project Scaffolding & Configuration](#fleet-feast-fja)
- [⚫ Fleet-Feast-huc Database Schema Design](#fleet-feast-huc)
- [⚫ Fleet-Feast-1kw System Architecture Design](#fleet-feast-1kw)
- [⚫ Fleet-Feast-9g2 Refactor: Verify build metrics and test coverage after refactoring](#fleet-feast-9g2)
- [⚫ Fleet-Feast-dpj Refactor: Review and optimize Prisma includes/selects](#fleet-feast-dpj)
- [⚫ Fleet-Feast-eab Refactor: Add React Query stale-time optimization](#fleet-feast-eab)
- [⚫ Fleet-Feast-8kk Refactor: Enhance database query caching layer](#fleet-feast-8kk)
- [⚫ Fleet-Feast-cps Refactor: Create shared API error handling utility](#fleet-feast-cps)
- [⚫ Fleet-Feast-meq Refactor: Standardize error handling in violation API routes](#fleet-feast-meq)
- [⚫ Fleet-Feast-y7c Refactor: Type-safe query filters in lib/queries/optimized.ts](#fleet-feast-y7c)
- [⚫ Fleet-Feast-4xa Refactor: Add strict generics to lib/api-response.ts](#fleet-feast-4xa)
- [⚫ Fleet-Feast-m0d Refactor: Remove any types from lib/middleware/rate-limit.ts](#fleet-feast-m0d)
- [⚫ Fleet-Feast-bdu Refactor: Remove any types from lib/middleware/validation.ts](#fleet-feast-bdu)
- [⚫ Fleet-Feast-hl5 Add vendor location and service radius settings](#fleet-feast-hl5)
- [⚫ Fleet-Feast-0aj Remove NYC-specific references - make platform location-agnostic](#fleet-feast-0aj)
- [⚫ Fleet-Feast-mz4 Mobile menu missing public navigation links for authenticated users](#fleet-feast-mz4)
- [⚫ Fleet-Feast-cbj Dashboard sidebar FOIC - customer nav flashes before vendor nav loads](#fleet-feast-cbj)
- [⚫ Fleet-Feast-0id Investigate Invalid or unexpected token JS error](#fleet-feast-0id)
- [⚫ Fleet-Feast-43x Add missing favicon.ico](#fleet-feast-43x)
- [⚫ Fleet-Feast-b3m Add main landmark to page layouts](#fleet-feast-b3m)
- [⚫ Fleet-Feast-25p Add skip navigation link for keyboard users](#fleet-feast-25p)
- [⚫ Fleet-Feast-egj Verify calendar cell touch targets meet 44px minimum](#fleet-feast-egj)
- [⚫ Fleet-Feast-3ar Small button touch targets below WCAG 44px minimum](#fleet-feast-3ar)
- [⚫ Fleet-Feast-k8d Monitoring & Alerting Setup](#fleet-feast-k8d)
- [⚫ Fleet-Feast-oo4 Developer Documentation](#fleet-feast-oo4)
- [⚫ Fleet-Feast-gr1 User Documentation](#fleet-feast-gr1)
- [⚫ Fleet-Feast-fmh API Documentation](#fleet-feast-fmh)
- [⚫ Fleet-Feast-1ez Accessibility Fixes](#fleet-feast-1ez)
- [⚫ Fleet-Feast-8pt Accessibility Audit](#fleet-feast-8pt)
- [⚫ Fleet-Feast-2ui Load Testing](#fleet-feast-2ui)
- [⚫ Fleet-Feast-uw2 Performance Optimization](#fleet-feast-uw2)
- [⚫ Fleet-Feast-4h6 Quote Request System](#fleet-feast-4h6)
- [⚫ Fleet-Feast-yo3 Homepage & Landing Pages](#fleet-feast-yo3)
- [⚫ Fleet-Feast-8hk Admin Dashboard Pages](#fleet-feast-8hk)
- [⚫ Fleet-Feast-6ir Vendor Dashboard Pages](#fleet-feast-6ir)
- [⚫ Fleet-Feast-pgs Customer Dashboard Pages](#fleet-feast-pgs)
- [⚫ Fleet-Feast-4tc Loyalty Discount System](#fleet-feast-4tc)
- [⚫ Fleet-Feast-zft Notification System](#fleet-feast-zft)
- [⚫ Fleet-Feast-3j3 Frontend State Management](#fleet-feast-3j3)
- [⚫ Fleet-Feast-31d Refactor: Type-safe lib/utils.ts debounce function](#fleet-feast-31d)
- [⚫ Fleet-Feast-dwa Login page has pre-filled demo credentials](#fleet-feast-dwa)
- [⚫ Fleet-Feast-vhl Verify heading hierarchy across all pages](#fleet-feast-vhl)
- [⚫ Fleet-Feast-2xv Knowledge Base Setup](#fleet-feast-2xv)
- [⚫ Fleet-Feast-s2t Optimize for mobile landscape orientation](#fleet-feast-s2t)
- [⚫ Fleet-Feast-2za Add horizontal scroll indicators for mobile](#fleet-feast-2za)
- [⚫ Fleet-Feast-280 Add slide-in animation for mobile filter drawer](#fleet-feast-280)

---

## Dependency Graph

```mermaid
graph TD
    classDef open fill:#50FA7B,stroke:#333,color:#000
    classDef inprogress fill:#8BE9FD,stroke:#333,color:#000
    classDef blocked fill:#FF5555,stroke:#333,color:#000
    classDef closed fill:#6272A4,stroke:#333,color:#fff

    Fleet-Feast-azl4["Fleet-Feast-azl4<br/>Integration verification for Helcim p..."]
    class Fleet-Feast-azl4 open
    Fleet-Feast-azl4 ==> Fleet-Feast-u0h3
    Fleet-Feast-azl4 ==> Fleet-Feast-mnxj
    Fleet-Feast-azl4 ==> Fleet-Feast-qemg
    Fleet-Feast-azl4 ==> Fleet-Feast-jwyf
    Fleet-Feast-mnxj["Fleet-Feast-mnxj<br/>Add vendor payout settings page with ..."]
    class Fleet-Feast-mnxj open
    Fleet-Feast-mnxj ==> Fleet-Feast-uvzu
    Fleet-Feast-mnxj ==> Fleet-Feast-602
    Fleet-Feast-u0h3["Fleet-Feast-u0h3<br/>Update payment page to use HelcimPaym..."]
    class Fleet-Feast-u0h3 open
    Fleet-Feast-u0h3 ==> Fleet-Feast-67o
    Fleet-Feast-u0h3 ==> Fleet-Feast-rpi
    Fleet-Feast-f3y["Fleet-Feast-f3y<br/>Implement automated vendor payout sch..."]
    class Fleet-Feast-f3y open
    Fleet-Feast-f3y ==> Fleet-Feast-ndn
    Fleet-Feast-f3y ==> Fleet-Feast-602
    Fleet-Feast-602["Fleet-Feast-602<br/>Create vendor bank account management..."]
    class Fleet-Feast-602 open
    Fleet-Feast-602 ==> Fleet-Feast-0jt
    Fleet-Feast-zt6["Fleet-Feast-zt6<br/>Create Helcim webhook handler for pay..."]
    class Fleet-Feast-zt6 open
    Fleet-Feast-zt6 ==> Fleet-Feast-1p1
    Fleet-Feast-rpi["Fleet-Feast-rpi<br/>Implement payment API endpoints with ..."]
    class Fleet-Feast-rpi open
    Fleet-Feast-rpi ==> Fleet-Feast-1p1
    Fleet-Feast-rpi ==> Fleet-Feast-ndn
    Fleet-Feast-1p1["Fleet-Feast-1p1<br/>Install and configure Helcim SDK and ..."]
    class Fleet-Feast-1p1 open
    Fleet-Feast-1p1 ==> Fleet-Feast-bb0
    Fleet-Feast-ndn["Fleet-Feast-ndn<br/>Create internal escrow ledger system ..."]
    class Fleet-Feast-ndn open
    Fleet-Feast-ndn ==> Fleet-Feast-bb0
    Fleet-Feast-0jt["Fleet-Feast-0jt<br/>Add vendor bank account fields to Ven..."]
    class Fleet-Feast-0jt open
    Fleet-Feast-0jt ==> Fleet-Feast-bb0
    Fleet-Feast-bb0["Fleet-Feast-bb0<br/>Remove Stripe dependencies and clean ..."]
    class Fleet-Feast-bb0 open
    Fleet-Feast-wsl["Fleet-Feast-wsl<br/>Integrate and verify complete inquiry..."]
    class Fleet-Feast-wsl open
    Fleet-Feast-wsl ==> Fleet-Feast-88e
    Fleet-Feast-wsl ==> Fleet-Feast-l33
    Fleet-Feast-wsl ==> Fleet-Feast-cyi
    Fleet-Feast-wsl ==> Fleet-Feast-fjp
    Fleet-Feast-wsl ==> Fleet-Feast-6ea
    Fleet-Feast-cyi["Fleet-Feast-cyi<br/>Update /vendor/messages/(bookingId) p..."]
    class Fleet-Feast-cyi open
    Fleet-Feast-cyi ==> Fleet-Feast-skd
    Fleet-Feast-cyi ==> Fleet-Feast-eay
    Fleet-Feast-l33["Fleet-Feast-l33<br/>Update /customer/messages/(bookingId)..."]
    class Fleet-Feast-l33 open
    Fleet-Feast-l33 ==> Fleet-Feast-vwa
    Fleet-Feast-l33 ==> Fleet-Feast-9ji
    Fleet-Feast-88e["Fleet-Feast-88e<br/>Update /customer/booking page to inqu..."]
    class Fleet-Feast-88e open
    Fleet-Feast-88e ==> Fleet-Feast-b4t
    Fleet-Feast-88e ==> Fleet-Feast-dpx
    Fleet-Feast-coe["Fleet-Feast-coe<br/>Update booking types and validation f..."]
    class Fleet-Feast-coe open
    Fleet-Feast-coe ==> Fleet-Feast-exf
    Fleet-Feast-fjp["Fleet-Feast-fjp<br/>Update payment flow for 50/50 platfor..."]
    class Fleet-Feast-fjp open
    Fleet-Feast-fjp ==> Fleet-Feast-9ji
    Fleet-Feast-fjp ==> Fleet-Feast-rpi
    Fleet-Feast-cuk["Fleet-Feast-cuk<br/>Update POST /api/bookings/:id/decline..."]
    class Fleet-Feast-cuk open
    Fleet-Feast-cuk ==> Fleet-Feast-exf
    Fleet-Feast-9ji["Fleet-Feast-9ji<br/>Update POST /api/bookings/:id/accept ..."]
    class Fleet-Feast-9ji open
    Fleet-Feast-9ji ==> Fleet-Feast-eay
    Fleet-Feast-eay["Fleet-Feast-eay<br/>Create POST /api/bookings/:id/proposa..."]
    class Fleet-Feast-eay open
    Fleet-Feast-eay ==> Fleet-Feast-exf
    Fleet-Feast-dpx["Fleet-Feast-dpx<br/>Create POST /api/inquiries endpoint f..."]
    class Fleet-Feast-dpx open
    Fleet-Feast-dpx ==> Fleet-Feast-exf
    Fleet-Feast-exf["Fleet-Feast-exf<br/>Create and run Prisma migration for i..."]
    class Fleet-Feast-exf open
    Fleet-Feast-exf ==> Fleet-Feast-5vo
    Fleet-Feast-exf ==> Fleet-Feast-y1r
    Fleet-Feast-exf ==> Fleet-Feast-tp2
    Fleet-Feast-tp2["Fleet-Feast-tp2<br/>Add proposal notification types to No..."]
    class Fleet-Feast-tp2 open
    Fleet-Feast-tp2 ==> Fleet-Feast-5vo
    Fleet-Feast-y1r["Fleet-Feast-y1r<br/>Add proposal fields to Booking model"]
    class Fleet-Feast-y1r open
    Fleet-Feast-y1r ==> Fleet-Feast-5vo
    Fleet-Feast-5vo["Fleet-Feast-5vo<br/>Update BookingStatus enum with inquir..."]
    class Fleet-Feast-5vo open
    Fleet-Feast-jwyf["Fleet-Feast-jwyf<br/>Write tests for Helcim payment integr..."]
    class Fleet-Feast-jwyf open
    Fleet-Feast-jwyf ==> Fleet-Feast-rpi
    Fleet-Feast-jwyf ==> Fleet-Feast-zt6
    Fleet-Feast-jwyf ==> Fleet-Feast-f3y
    Fleet-Feast-qemg["Fleet-Feast-qemg<br/>Create admin payout management dashboard"]
    class Fleet-Feast-qemg open
    Fleet-Feast-qemg ==> Fleet-Feast-f3y
    Fleet-Feast-uvzu["Fleet-Feast-uvzu<br/>Create VendorBankAccountForm componen..."]
    class Fleet-Feast-uvzu open
    Fleet-Feast-uvzu ==> Fleet-Feast-602
    Fleet-Feast-67o["Fleet-Feast-67o<br/>Create HelcimPaymentForm component wi..."]
    class Fleet-Feast-67o open
    Fleet-Feast-67o ==> Fleet-Feast-1p1
    Fleet-Feast-1y0["Fleet-Feast-1y0<br/>Write E2E tests for complete inquiry-..."]
    class Fleet-Feast-1y0 open
    Fleet-Feast-1y0 ==> Fleet-Feast-88e
    Fleet-Feast-1y0 ==> Fleet-Feast-l33
    Fleet-Feast-1y0 ==> Fleet-Feast-cyi
    Fleet-Feast-1y0 ==> Fleet-Feast-fjp
    Fleet-Feast-4ln["Fleet-Feast-4ln<br/>Write integration tests for inquiry-p..."]
    class Fleet-Feast-4ln open
    Fleet-Feast-4ln ==> Fleet-Feast-db3
    Fleet-Feast-db3["Fleet-Feast-db3<br/>Write unit tests for inquiry-proposal..."]
    class Fleet-Feast-db3 open
    Fleet-Feast-db3 ==> Fleet-Feast-dpx
    Fleet-Feast-db3 ==> Fleet-Feast-eay
    Fleet-Feast-db3 ==> Fleet-Feast-9ji
    Fleet-Feast-db3 ==> Fleet-Feast-cuk
    Fleet-Feast-6ea["Fleet-Feast-6ea<br/>Implement proposal notification trigg..."]
    class Fleet-Feast-6ea open
    Fleet-Feast-6ea ==> Fleet-Feast-tp2
    Fleet-Feast-6ea ==> Fleet-Feast-dpx
    Fleet-Feast-6ea ==> Fleet-Feast-eay
    Fleet-Feast-6ea ==> Fleet-Feast-9ji
    Fleet-Feast-ea8["Fleet-Feast-ea8<br/>Update booking list pages to show new..."]
    class Fleet-Feast-ea8 open
    Fleet-Feast-ea8 ==> Fleet-Feast-exf
    Fleet-Feast-b4t["Fleet-Feast-b4t<br/>Create InquiryForm component replacin..."]
    class Fleet-Feast-b4t open
    Fleet-Feast-b4t ==> Fleet-Feast-coe
    Fleet-Feast-skd["Fleet-Feast-skd<br/>Create ProposalBuilder component for ..."]
    class Fleet-Feast-skd open
    Fleet-Feast-skd ==> Fleet-Feast-coe
    Fleet-Feast-vwa["Fleet-Feast-vwa<br/>Create ProposalCard component for mes..."]
    class Fleet-Feast-vwa open
    Fleet-Feast-vwa ==> Fleet-Feast-coe
    Fleet-Feast-0fi["Fleet-Feast-0fi<br/>Vendor Bookings page (/vendor/booking..."]
    class Fleet-Feast-0fi closed
    Fleet-Feast-w98["Fleet-Feast-w98<br/>Vendor Messages page (/vendor/message..."]
    class Fleet-Feast-w98 closed
    Fleet-Feast-bxz["Fleet-Feast-bxz<br/>Customer Bookings page (/customer/boo..."]
    class Fleet-Feast-bxz closed
    Fleet-Feast-822["Fleet-Feast-822<br/>Customer Messages page (/customer/mes..."]
    class Fleet-Feast-822 closed
    Fleet-Feast-tet["Fleet-Feast-tet<br/>Mobile bottom nav Messages link goes ..."]
    class Fleet-Feast-tet closed
    Fleet-Feast-dsr["Fleet-Feast-dsr<br/>Fix Dropdown being clipped inside Mob..."]
    class Fleet-Feast-dsr closed
    Fleet-Feast-p9n["Fleet-Feast-p9n<br/>Fix MobileDrawer z-index - menu appea..."]
    class Fleet-Feast-p9n closed
    Fleet-Feast-ded["Fleet-Feast-ded<br/>Fix MobileDrawer opening from wrong s..."]
    class Fleet-Feast-ded closed
    Fleet-Feast-z9k["Fleet-Feast-z9k<br/>Auth redirect loop - middleware getTo..."]
    class Fleet-Feast-z9k closed
    Fleet-Feast-bz5["Fleet-Feast-bz5<br/>Fix /api/trucks endpoint returning HT..."]
    class Fleet-Feast-bz5 closed
    Fleet-Feast-rfr["Fleet-Feast-rfr<br/>Fix Rating.tsx hydration error - butt..."]
    class Fleet-Feast-rfr closed
    Fleet-Feast-daa["Fleet-Feast-daa<br/>Restyle Layout Components (Header, Fo..."]
    class Fleet-Feast-daa closed
    Fleet-Feast-daa ==> Fleet-Feast-wo2
    Fleet-Feast-hv0["Fleet-Feast-hv0<br/>Restyle Core UI Components (Button, I..."]
    class Fleet-Feast-hv0 closed
    Fleet-Feast-hv0 ==> Fleet-Feast-wo2
    Fleet-Feast-wo2["Fleet-Feast-wo2<br/>Design System: Neo-Brutalist Glassmor..."]
    class Fleet-Feast-wo2 closed
    Fleet-Feast-5oq["Fleet-Feast-5oq<br/>HOTFIX: Rate limit middleware breaks ..."]
    class Fleet-Feast-5oq closed
    Fleet-Feast-9iz["Fleet-Feast-9iz<br/>Re-validate production readiness afte..."]
    class Fleet-Feast-9iz closed
    Fleet-Feast-9iz ==> Fleet-Feast-pe7
    Fleet-Feast-9iz ==> Fleet-Feast-2c9
    Fleet-Feast-2c9["Fleet-Feast-2c9<br/>BLOCKER: Fix Jest configuration for N..."]
    class Fleet-Feast-2c9 closed
    Fleet-Feast-pe7["Fleet-Feast-pe7<br/>BLOCKER: Fix route group conflicts pr..."]
    class Fleet-Feast-pe7 closed
    Fleet-Feast-me3["Fleet-Feast-me3<br/>CRITICAL: Dynamic route conflict prev..."]
    class Fleet-Feast-me3 closed
    Fleet-Feast-eh7["Fleet-Feast-eh7<br/>Phase A: Foundation"]
    class Fleet-Feast-eh7 closed
    Fleet-Feast-uhr["Fleet-Feast-uhr<br/>Fix sticky booking card getting cut o..."]
    class Fleet-Feast-uhr closed
    Fleet-Feast-ztv["Fleet-Feast-ztv<br/>Fix 404 error on Book This Truck butt..."]
    class Fleet-Feast-ztv closed
    Fleet-Feast-76i["Fleet-Feast-76i<br/>Update trucks service to include cove..."]
    class Fleet-Feast-76i closed
    Fleet-Feast-76i ==> Fleet-Feast-3lk
    Fleet-Feast-dhq["Fleet-Feast-dhq<br/>Update FeaturedTrucks to fetch real v..."]
    class Fleet-Feast-dhq closed
    Fleet-Feast-dhq ==> Fleet-Feast-0pq
    Fleet-Feast-dhq ==> Fleet-Feast-76i
    Fleet-Feast-0pq["Fleet-Feast-0pq<br/>Update seed data with coverImageUrl f..."]
    class Fleet-Feast-0pq closed
    Fleet-Feast-0pq ==> Fleet-Feast-3lk
    Fleet-Feast-0pq ==> Fleet-Feast-sh6
    Fleet-Feast-sh6["Fleet-Feast-sh6<br/>Generate AI images for 5 featured foo..."]
    class Fleet-Feast-sh6 closed
    Fleet-Feast-sh6 ==> Fleet-Feast-3lk
    Fleet-Feast-3lk["Fleet-Feast-3lk<br/>Add coverImageUrl field to Vendor model"]
    class Fleet-Feast-3lk closed
    Fleet-Feast-dtb["Fleet-Feast-dtb<br/>Homepage images don't load unless use..."]
    class Fleet-Feast-dtb closed
    Fleet-Feast-4pk["Fleet-Feast-4pk<br/>Missing /unauthorized page shows 404 ..."]
    class Fleet-Feast-4pk closed
    Fleet-Feast-9pf["Fleet-Feast-9pf<br/>Vendor messages page throws 'Cannot r..."]
    class Fleet-Feast-9pf closed
    Fleet-Feast-679["Fleet-Feast-679<br/>Vendor dashboard shows 'bookings.filt..."]
    class Fleet-Feast-679 closed
    Fleet-Feast-wuc["Fleet-Feast-wuc<br/>Search page shows 0 results but API r..."]
    class Fleet-Feast-wuc closed
    Fleet-Feast-n5o["Fleet-Feast-n5o<br/>C:/Program Files/Git/vendor/apply sho..."]
    class Fleet-Feast-n5o closed
    Fleet-Feast-dbr["Fleet-Feast-dbr<br/>Fix mobile navigation menu not opening"]
    class Fleet-Feast-dbr closed
    Fleet-Feast-6sb["Fleet-Feast-6sb<br/>Make food truck profiles publicly acc..."]
    class Fleet-Feast-6sb closed
    Fleet-Feast-8wp["Fleet-Feast-8wp<br/>Accessibility Audit for New Design Sy..."]
    class Fleet-Feast-8wp closed
    Fleet-Feast-8wp ==> Fleet-Feast-d59
    Fleet-Feast-8wp ==> Fleet-Feast-cc2
    Fleet-Feast-8wp ==> Fleet-Feast-jma
    Fleet-Feast-8wp ==> Fleet-Feast-8gg
    Fleet-Feast-8wp ==> Fleet-Feast-0qv
    Fleet-Feast-8wp ==> Fleet-Feast-6of
    Fleet-Feast-8wp ==> Fleet-Feast-526
    Fleet-Feast-8wp ==> Fleet-Feast-4ce
    Fleet-Feast-8wp ==> Fleet-Feast-not
    Fleet-Feast-8wp ==> Fleet-Feast-eeu
    Fleet-Feast-vr7["Fleet-Feast-vr7<br/>Responsive Testing & Mobile Optimization"]
    class Fleet-Feast-vr7 closed
    Fleet-Feast-vr7 ==> Fleet-Feast-d59
    Fleet-Feast-vr7 ==> Fleet-Feast-cc2
    Fleet-Feast-vr7 ==> Fleet-Feast-jma
    Fleet-Feast-vr7 ==> Fleet-Feast-8gg
    Fleet-Feast-vr7 ==> Fleet-Feast-0qv
    Fleet-Feast-vr7 ==> Fleet-Feast-6of
    Fleet-Feast-vr7 ==> Fleet-Feast-526
    Fleet-Feast-vr7 ==> Fleet-Feast-4ce
    Fleet-Feast-vr7 ==> Fleet-Feast-not
    Fleet-Feast-vr7 ==> Fleet-Feast-eeu
    Fleet-Feast-eeu["Fleet-Feast-eeu<br/>Restyle Static Pages (About, Contact,..."]
    class Fleet-Feast-eeu closed
    Fleet-Feast-eeu ==> Fleet-Feast-hv0
    Fleet-Feast-eeu ==> Fleet-Feast-daa
    Fleet-Feast-not["Fleet-Feast-not<br/>Restyle Messaging System"]
    class Fleet-Feast-not closed
    Fleet-Feast-not ==> Fleet-Feast-hv0
    Fleet-Feast-not ==> Fleet-Feast-daa
    Fleet-Feast-4ce["Fleet-Feast-4ce<br/>Restyle Admin Dashboard & Management ..."]
    class Fleet-Feast-4ce closed
    Fleet-Feast-4ce ==> Fleet-Feast-hv0
    Fleet-Feast-4ce ==> Fleet-Feast-daa
    Fleet-Feast-526["Fleet-Feast-526<br/>Restyle Vendor Application Flow"]
    class Fleet-Feast-526 closed
    Fleet-Feast-526 ==> Fleet-Feast-hv0
    Fleet-Feast-526 ==> Fleet-Feast-daa
    Fleet-Feast-6of["Fleet-Feast-6of<br/>Restyle Vendor Dashboard & Management..."]
    class Fleet-Feast-6of closed
    Fleet-Feast-6of ==> Fleet-Feast-hv0
    Fleet-Feast-6of ==> Fleet-Feast-daa
    Fleet-Feast-0qv["Fleet-Feast-0qv<br/>Restyle Customer Dashboard & Booking ..."]
    class Fleet-Feast-0qv closed
    Fleet-Feast-0qv ==> Fleet-Feast-hv0
    Fleet-Feast-0qv ==> Fleet-Feast-daa
    Fleet-Feast-8gg["Fleet-Feast-8gg<br/>Restyle Authentication Pages"]
    class Fleet-Feast-8gg closed
    Fleet-Feast-8gg ==> Fleet-Feast-hv0
    Fleet-Feast-8gg ==> Fleet-Feast-daa
    Fleet-Feast-jma["Fleet-Feast-jma<br/>Restyle Food Truck Detail Pages"]
    class Fleet-Feast-jma closed
    Fleet-Feast-jma ==> Fleet-Feast-hv0
    Fleet-Feast-jma ==> Fleet-Feast-daa
    Fleet-Feast-cc2["Fleet-Feast-cc2<br/>Restyle Search & Discovery Pages"]
    class Fleet-Feast-cc2 closed
    Fleet-Feast-cc2 ==> Fleet-Feast-hv0
    Fleet-Feast-cc2 ==> Fleet-Feast-daa
    Fleet-Feast-d59["Fleet-Feast-d59<br/>Restyle Homepage & Public Marketing S..."]
    class Fleet-Feast-d59 closed
    Fleet-Feast-d59 ==> Fleet-Feast-hv0
    Fleet-Feast-d59 ==> Fleet-Feast-daa
    Fleet-Feast-pcn["Fleet-Feast-pcn<br/>HOTFIX: Search sort dropdown componen..."]
    class Fleet-Feast-pcn closed
    Fleet-Feast-ue6["Fleet-Feast-ue6<br/>Loyalty discount system not implemented"]
    class Fleet-Feast-ue6 closed
    Fleet-Feast-gm5["Fleet-Feast-gm5<br/>Cancellation policy refund calculatio..."]
    class Fleet-Feast-gm5 closed
    Fleet-Feast-016["Fleet-Feast-016<br/>Final Validation & Launch Checklist"]
    class Fleet-Feast-016 closed
    Fleet-Feast-016 ==> Fleet-Feast-8sg
    Fleet-Feast-016 ==> Fleet-Feast-2v4
    Fleet-Feast-016 ==> Fleet-Feast-4f4
    Fleet-Feast-016 ==> Fleet-Feast-uw2
    Fleet-Feast-bgd["Fleet-Feast-bgd<br/>Infrastructure Configuration"]
    class Fleet-Feast-bgd closed
    Fleet-Feast-bgd ==> Fleet-Feast-fja
    Fleet-Feast-4cw["Fleet-Feast-4cw<br/>CI/CD Pipeline Setup"]
    class Fleet-Feast-4cw closed
    Fleet-Feast-4cw ==> Fleet-Feast-fja
    Fleet-Feast-4cw ==> Fleet-Feast-2tl
    Fleet-Feast-4cw ==> Fleet-Feast-es6
    Fleet-Feast-4cw ==> Fleet-Feast-2w3
    Fleet-Feast-2v4["Fleet-Feast-2v4<br/>Security Fixes"]
    class Fleet-Feast-2v4 closed
    Fleet-Feast-2v4 ==> Fleet-Feast-04a
    Fleet-Feast-4f4["Fleet-Feast-4f4<br/>Compliance Audit"]
    class Fleet-Feast-4f4 closed
    Fleet-Feast-4f4 ==> Fleet-Feast-5cl
    Fleet-Feast-4f4 ==> Fleet-Feast-3rw
    Fleet-Feast-04a["Fleet-Feast-04a<br/>Security Audit"]
    class Fleet-Feast-04a closed
    Fleet-Feast-04a ==> Fleet-Feast-5ey
    Fleet-Feast-04a ==> Fleet-Feast-igb
    Fleet-Feast-04a ==> Fleet-Feast-5cl
    Fleet-Feast-8sg["Fleet-Feast-8sg<br/>Bug Fixes from QA"]
    class Fleet-Feast-8sg closed
    Fleet-Feast-8sg ==> Fleet-Feast-qjr
    Fleet-Feast-c2q["Fleet-Feast-c2q<br/>Payment Flow Testing"]
    class Fleet-Feast-c2q closed
    Fleet-Feast-c2q ==> Fleet-Feast-5cl
    Fleet-Feast-c2q ==> Fleet-Feast-4tc
    Fleet-Feast-qjr["Fleet-Feast-qjr<br/>QA Validation - Feature Completeness"]
    class Fleet-Feast-qjr closed
    Fleet-Feast-qjr ==> Fleet-Feast-yo3
    Fleet-Feast-qjr ==> Fleet-Feast-pgs
    Fleet-Feast-qjr ==> Fleet-Feast-6ir
    Fleet-Feast-qjr ==> Fleet-Feast-8hk
    Fleet-Feast-6fo["Fleet-Feast-6fo<br/>E2E Tests - Critical User Flows"]
    class Fleet-Feast-6fo closed
    Fleet-Feast-6fo ==> Fleet-Feast-8ve
    Fleet-Feast-6fo ==> Fleet-Feast-r28
    Fleet-Feast-6fo ==> Fleet-Feast-v16
    Fleet-Feast-2w3["Fleet-Feast-2w3<br/>Integration Tests - API Endpoints"]
    class Fleet-Feast-2w3 closed
    Fleet-Feast-2w3 ==> Fleet-Feast-igb
    Fleet-Feast-2w3 ==> Fleet-Feast-wu8
    Fleet-Feast-2w3 ==> Fleet-Feast-5cl
    Fleet-Feast-2w3 ==> Fleet-Feast-e63
    Fleet-Feast-es6["Fleet-Feast-es6<br/>Unit Test Suite - Frontend Components"]
    class Fleet-Feast-es6 closed
    Fleet-Feast-es6 ==> Fleet-Feast-bxt
    Fleet-Feast-es6 ==> Fleet-Feast-5ub
    Fleet-Feast-2tl["Fleet-Feast-2tl<br/>Unit Test Suite - Backend Services"]
    class Fleet-Feast-2tl closed
    Fleet-Feast-2tl ==> Fleet-Feast-igb
    Fleet-Feast-2tl ==> Fleet-Feast-wu8
    Fleet-Feast-2tl ==> Fleet-Feast-5cl
    Fleet-Feast-2tl ==> Fleet-Feast-2f0
    Fleet-Feast-2tl ==> Fleet-Feast-mx9
    Fleet-Feast-dw4["Fleet-Feast-dw4<br/>Code Review - Frontend Components"]
    class Fleet-Feast-dw4 closed
    Fleet-Feast-dw4 ==> Fleet-Feast-bxt
    Fleet-Feast-dw4 ==> Fleet-Feast-5ub
    Fleet-Feast-dw4 ==> Fleet-Feast-8ve
    Fleet-Feast-dw4 ==> Fleet-Feast-zyk
    Fleet-Feast-dw4 ==> Fleet-Feast-r28
    Fleet-Feast-5ey["Fleet-Feast-5ey<br/>Code Review - Auth & Core APIs"]
    class Fleet-Feast-5ey closed
    Fleet-Feast-5ey ==> Fleet-Feast-igb
    Fleet-Feast-5ey ==> Fleet-Feast-ok7
    Fleet-Feast-5ey ==> Fleet-Feast-w6w
    Fleet-Feast-5ey ==> Fleet-Feast-wu8
    Fleet-Feast-5ey ==> Fleet-Feast-5cl
    Fleet-Feast-v16["Fleet-Feast-v16<br/>Messaging Interface"]
    class Fleet-Feast-v16 closed
    Fleet-Feast-v16 ==> Fleet-Feast-2f0
    Fleet-Feast-v16 ==> Fleet-Feast-bxt
    Fleet-Feast-v16 ==> Fleet-Feast-5ub
    Fleet-Feast-r28["Fleet-Feast-r28<br/>Booking Flow Pages"]
    class Fleet-Feast-r28 closed
    Fleet-Feast-r28 ==> Fleet-Feast-wu8
    Fleet-Feast-r28 ==> Fleet-Feast-5cl
    Fleet-Feast-r28 ==> Fleet-Feast-bxt
    Fleet-Feast-r28 ==> Fleet-Feast-5ub
    Fleet-Feast-dxo["Fleet-Feast-dxo<br/>Food Truck Profile Pages"]
    class Fleet-Feast-dxo closed
    Fleet-Feast-dxo ==> Fleet-Feast-w6w
    Fleet-Feast-dxo ==> Fleet-Feast-bj4
    Fleet-Feast-dxo ==> Fleet-Feast-bxt
    Fleet-Feast-dxo ==> Fleet-Feast-5ub
    Fleet-Feast-zyk["Fleet-Feast-zyk<br/>Food Truck Search & Discovery Pages"]
    class Fleet-Feast-zyk closed
    Fleet-Feast-zyk ==> Fleet-Feast-w6w
    Fleet-Feast-zyk ==> Fleet-Feast-bxt
    Fleet-Feast-zyk ==> Fleet-Feast-5ub
    Fleet-Feast-qm9["Fleet-Feast-qm9<br/>Vendor Application Pages"]
    class Fleet-Feast-qm9 closed
    Fleet-Feast-qm9 ==> Fleet-Feast-ok7
    Fleet-Feast-qm9 ==> Fleet-Feast-bxt
    Fleet-Feast-qm9 ==> Fleet-Feast-5ub
    Fleet-Feast-8ve["Fleet-Feast-8ve<br/>Authentication Pages"]
    class Fleet-Feast-8ve closed
    Fleet-Feast-8ve ==> Fleet-Feast-igb
    Fleet-Feast-8ve ==> Fleet-Feast-bxt
    Fleet-Feast-8ve ==> Fleet-Feast-5ub
    Fleet-Feast-9xc["Fleet-Feast-9xc<br/>Violation & Penalty System"]
    class Fleet-Feast-9xc closed
    Fleet-Feast-9xc ==> Fleet-Feast-2f0
    Fleet-Feast-9xc ==> Fleet-Feast-igb
    Fleet-Feast-32i["Fleet-Feast-32i<br/>Dispute Resolution System"]
    class Fleet-Feast-32i closed
    Fleet-Feast-32i ==> Fleet-Feast-wu8
    Fleet-Feast-32i ==> Fleet-Feast-5cl
    Fleet-Feast-2f0["Fleet-Feast-2f0<br/>Messaging System with Anti-Circumvention"]
    class Fleet-Feast-2f0 closed
    Fleet-Feast-2f0 ==> Fleet-Feast-wu8
    Fleet-Feast-2f0 ==> Fleet-Feast-igb
    Fleet-Feast-5cl["Fleet-Feast-5cl<br/>Payment & Escrow System"]
    class Fleet-Feast-5cl closed
    Fleet-Feast-5cl ==> Fleet-Feast-wu8
    Fleet-Feast-5cl ==> Fleet-Feast-ok7
    Fleet-Feast-bj4["Fleet-Feast-bj4<br/>Review & Rating System"]
    class Fleet-Feast-bj4 closed
    Fleet-Feast-bj4 ==> Fleet-Feast-w6w
    Fleet-Feast-wu8["Fleet-Feast-wu8<br/>Booking System API"]
    class Fleet-Feast-wu8 closed
    Fleet-Feast-wu8 ==> Fleet-Feast-igb
    Fleet-Feast-wu8 ==> Fleet-Feast-w6w
    Fleet-Feast-5ub["Fleet-Feast-5ub<br/>Navigation & Layout System"]
    class Fleet-Feast-5ub closed
    Fleet-Feast-5ub ==> Fleet-Feast-bxt
    Fleet-Feast-5ub ==> Fleet-Feast-igb
    Fleet-Feast-w6w["Fleet-Feast-w6w<br/>Food Truck Profiles & Search API"]
    class Fleet-Feast-w6w closed
    Fleet-Feast-w6w ==> Fleet-Feast-3rw
    Fleet-Feast-w6w ==> Fleet-Feast-ok7
    Fleet-Feast-e63["Fleet-Feast-e63<br/>API Middleware & Rate Limiting"]
    class Fleet-Feast-e63 closed
    Fleet-Feast-e63 ==> Fleet-Feast-igb
    Fleet-Feast-e63 ==> Fleet-Feast-zjd
    Fleet-Feast-ok7["Fleet-Feast-ok7<br/>Vendor Application & Onboarding API"]
    class Fleet-Feast-ok7 closed
    Fleet-Feast-ok7 ==> Fleet-Feast-3rw
    Fleet-Feast-ok7 ==> Fleet-Feast-igb
    Fleet-Feast-bxt["Fleet-Feast-bxt<br/>UI Component Library"]
    class Fleet-Feast-bxt closed
    Fleet-Feast-bxt ==> Fleet-Feast-fja
    Fleet-Feast-bxt ==> Fleet-Feast-mx9
    Fleet-Feast-bxt ==> Fleet-Feast-nww
    Fleet-Feast-igb["Fleet-Feast-igb<br/>Authentication System Implementation"]
    class Fleet-Feast-igb closed
    Fleet-Feast-igb ==> Fleet-Feast-3rw
    Fleet-Feast-igb ==> Fleet-Feast-mx9
    Fleet-Feast-nww["Fleet-Feast-nww<br/>Global Styles & Theme Implementation"]
    class Fleet-Feast-nww closed
    Fleet-Feast-nww ==> Fleet-Feast-fja
    Fleet-Feast-3rw["Fleet-Feast-3rw<br/>Database Implementation & Migrations"]
    class Fleet-Feast-3rw closed
    Fleet-Feast-3rw ==> Fleet-Feast-huc
    Fleet-Feast-3rw ==> Fleet-Feast-fja
    Fleet-Feast-mx9["Fleet-Feast-mx9<br/>Design Patterns & Code Standards"]
    class Fleet-Feast-mx9 closed
    Fleet-Feast-mx9 ==> Fleet-Feast-fja
    Fleet-Feast-zjd["Fleet-Feast-zjd<br/>API Design & Specification"]
    class Fleet-Feast-zjd closed
    Fleet-Feast-zjd ==> Fleet-Feast-1kw
    Fleet-Feast-zjd ==> Fleet-Feast-huc
    Fleet-Feast-fja["Fleet-Feast-fja<br/>Project Scaffolding & Configuration"]
    class Fleet-Feast-fja closed
    Fleet-Feast-fja ==> Fleet-Feast-1kw
    Fleet-Feast-huc["Fleet-Feast-huc<br/>Database Schema Design"]
    class Fleet-Feast-huc closed
    Fleet-Feast-huc ==> Fleet-Feast-1kw
    Fleet-Feast-1kw["Fleet-Feast-1kw<br/>System Architecture Design"]
    class Fleet-Feast-1kw closed
    Fleet-Feast-9g2["Fleet-Feast-9g2<br/>Refactor: Verify build metrics and te..."]
    class Fleet-Feast-9g2 closed
    Fleet-Feast-9g2 ==> Fleet-Feast-bdu
    Fleet-Feast-9g2 ==> Fleet-Feast-m0d
    Fleet-Feast-9g2 ==> Fleet-Feast-4xa
    Fleet-Feast-9g2 ==> Fleet-Feast-y7c
    Fleet-Feast-9g2 ==> Fleet-Feast-meq
    Fleet-Feast-9g2 ==> Fleet-Feast-cps
    Fleet-Feast-9g2 ==> Fleet-Feast-31d
    Fleet-Feast-9g2 ==> Fleet-Feast-8kk
    Fleet-Feast-9g2 ==> Fleet-Feast-eab
    Fleet-Feast-9g2 ==> Fleet-Feast-dpj
    Fleet-Feast-dpj["Fleet-Feast-dpj<br/>Refactor: Review and optimize Prisma ..."]
    class Fleet-Feast-dpj closed
    Fleet-Feast-eab["Fleet-Feast-eab<br/>Refactor: Add React Query stale-time ..."]
    class Fleet-Feast-eab closed
    Fleet-Feast-8kk["Fleet-Feast-8kk<br/>Refactor: Enhance database query cach..."]
    class Fleet-Feast-8kk closed
    Fleet-Feast-cps["Fleet-Feast-cps<br/>Refactor: Create shared API error han..."]
    class Fleet-Feast-cps closed
    Fleet-Feast-meq["Fleet-Feast-meq<br/>Refactor: Standardize error handling ..."]
    class Fleet-Feast-meq closed
    Fleet-Feast-y7c["Fleet-Feast-y7c<br/>Refactor: Type-safe query filters in ..."]
    class Fleet-Feast-y7c closed
    Fleet-Feast-4xa["Fleet-Feast-4xa<br/>Refactor: Add strict generics to lib/..."]
    class Fleet-Feast-4xa closed
    Fleet-Feast-m0d["Fleet-Feast-m0d<br/>Refactor: Remove any types from lib/m..."]
    class Fleet-Feast-m0d closed
    Fleet-Feast-bdu["Fleet-Feast-bdu<br/>Refactor: Remove any types from lib/m..."]
    class Fleet-Feast-bdu closed
    Fleet-Feast-hl5["Fleet-Feast-hl5<br/>Add vendor location and service radiu..."]
    class Fleet-Feast-hl5 closed
    Fleet-Feast-hl5 ==> Fleet-Feast-0aj
    Fleet-Feast-0aj["Fleet-Feast-0aj<br/>Remove NYC-specific references - make..."]
    class Fleet-Feast-0aj closed
    Fleet-Feast-mz4["Fleet-Feast-mz4<br/>Mobile menu missing public navigation..."]
    class Fleet-Feast-mz4 closed
    Fleet-Feast-cbj["Fleet-Feast-cbj<br/>Dashboard sidebar FOIC - customer nav..."]
    class Fleet-Feast-cbj closed
    Fleet-Feast-0id["Fleet-Feast-0id<br/>Investigate Invalid or unexpected tok..."]
    class Fleet-Feast-0id closed
    Fleet-Feast-43x["Fleet-Feast-43x<br/>Add missing favicon.ico"]
    class Fleet-Feast-43x closed
    Fleet-Feast-b3m["Fleet-Feast-b3m<br/>Add main landmark to page layouts"]
    class Fleet-Feast-b3m closed
    Fleet-Feast-25p["Fleet-Feast-25p<br/>Add skip navigation link for keyboard..."]
    class Fleet-Feast-25p closed
    Fleet-Feast-egj["Fleet-Feast-egj<br/>Verify calendar cell touch targets me..."]
    class Fleet-Feast-egj closed
    Fleet-Feast-3ar["Fleet-Feast-3ar<br/>Small button touch targets below WCAG..."]
    class Fleet-Feast-3ar closed
    Fleet-Feast-k8d["Fleet-Feast-k8d<br/>Monitoring & Alerting Setup"]
    class Fleet-Feast-k8d closed
    Fleet-Feast-k8d ==> Fleet-Feast-fja
    Fleet-Feast-oo4["Fleet-Feast-oo4<br/>Developer Documentation"]
    class Fleet-Feast-oo4 closed
    Fleet-Feast-oo4 ==> Fleet-Feast-1kw
    Fleet-Feast-oo4 ==> Fleet-Feast-fja
    Fleet-Feast-gr1["Fleet-Feast-gr1<br/>User Documentation"]
    class Fleet-Feast-gr1 closed
    Fleet-Feast-gr1 ==> Fleet-Feast-qjr
    Fleet-Feast-fmh["Fleet-Feast-fmh<br/>API Documentation"]
    class Fleet-Feast-fmh closed
    Fleet-Feast-fmh ==> Fleet-Feast-zjd
    Fleet-Feast-fmh ==> Fleet-Feast-wu8
    Fleet-Feast-fmh ==> Fleet-Feast-5cl
    Fleet-Feast-1ez["Fleet-Feast-1ez<br/>Accessibility Fixes"]
    class Fleet-Feast-1ez closed
    Fleet-Feast-1ez ==> Fleet-Feast-8pt
    Fleet-Feast-8pt["Fleet-Feast-8pt<br/>Accessibility Audit"]
    class Fleet-Feast-8pt closed
    Fleet-Feast-8pt ==> Fleet-Feast-dw4
    Fleet-Feast-2ui["Fleet-Feast-2ui<br/>Load Testing"]
    class Fleet-Feast-2ui closed
    Fleet-Feast-2ui ==> Fleet-Feast-qjr
    Fleet-Feast-uw2["Fleet-Feast-uw2<br/>Performance Optimization"]
    class Fleet-Feast-uw2 closed
    Fleet-Feast-uw2 ==> Fleet-Feast-qjr
    Fleet-Feast-4h6["Fleet-Feast-4h6<br/>Quote Request System"]
    class Fleet-Feast-4h6 closed
    Fleet-Feast-4h6 ==> Fleet-Feast-w6w
    Fleet-Feast-4h6 ==> Fleet-Feast-wu8
    Fleet-Feast-yo3["Fleet-Feast-yo3<br/>Homepage & Landing Pages"]
    class Fleet-Feast-yo3 closed
    Fleet-Feast-yo3 ==> Fleet-Feast-bxt
    Fleet-Feast-yo3 ==> Fleet-Feast-5ub
    Fleet-Feast-8hk["Fleet-Feast-8hk<br/>Admin Dashboard Pages"]
    class Fleet-Feast-8hk closed
    Fleet-Feast-8hk ==> Fleet-Feast-ok7
    Fleet-Feast-8hk ==> Fleet-Feast-32i
    Fleet-Feast-8hk ==> Fleet-Feast-9xc
    Fleet-Feast-8hk ==> Fleet-Feast-bxt
    Fleet-Feast-8hk ==> Fleet-Feast-5ub
    Fleet-Feast-6ir["Fleet-Feast-6ir<br/>Vendor Dashboard Pages"]
    class Fleet-Feast-6ir closed
    Fleet-Feast-6ir ==> Fleet-Feast-w6w
    Fleet-Feast-6ir ==> Fleet-Feast-wu8
    Fleet-Feast-6ir ==> Fleet-Feast-5cl
    Fleet-Feast-6ir ==> Fleet-Feast-bxt
    Fleet-Feast-6ir ==> Fleet-Feast-5ub
    Fleet-Feast-pgs["Fleet-Feast-pgs<br/>Customer Dashboard Pages"]
    class Fleet-Feast-pgs closed
    Fleet-Feast-pgs ==> Fleet-Feast-wu8
    Fleet-Feast-pgs ==> Fleet-Feast-2f0
    Fleet-Feast-pgs ==> Fleet-Feast-bxt
    Fleet-Feast-pgs ==> Fleet-Feast-5ub
    Fleet-Feast-4tc["Fleet-Feast-4tc<br/>Loyalty Discount System"]
    class Fleet-Feast-4tc closed
    Fleet-Feast-4tc ==> Fleet-Feast-wu8
    Fleet-Feast-4tc ==> Fleet-Feast-5cl
    Fleet-Feast-zft["Fleet-Feast-zft<br/>Notification System"]
    class Fleet-Feast-zft closed
    Fleet-Feast-zft ==> Fleet-Feast-igb
    Fleet-Feast-zft ==> Fleet-Feast-wu8
    Fleet-Feast-3j3["Fleet-Feast-3j3<br/>Frontend State Management"]
    class Fleet-Feast-3j3 closed
    Fleet-Feast-3j3 ==> Fleet-Feast-fja
    Fleet-Feast-3j3 ==> Fleet-Feast-mx9
    Fleet-Feast-31d["Fleet-Feast-31d<br/>Refactor: Type-safe lib/utils.ts debo..."]
    class Fleet-Feast-31d closed
    Fleet-Feast-dwa["Fleet-Feast-dwa<br/>Login page has pre-filled demo creden..."]
    class Fleet-Feast-dwa closed
    Fleet-Feast-vhl["Fleet-Feast-vhl<br/>Verify heading hierarchy across all p..."]
    class Fleet-Feast-vhl closed
    Fleet-Feast-2xv["Fleet-Feast-2xv<br/>Knowledge Base Setup"]
    class Fleet-Feast-2xv closed
    Fleet-Feast-2xv ==> Fleet-Feast-qjr
    Fleet-Feast-s2t["Fleet-Feast-s2t<br/>Optimize for mobile landscape orienta..."]
    class Fleet-Feast-s2t closed
    Fleet-Feast-2za["Fleet-Feast-2za<br/>Add horizontal scroll indicators for ..."]
    class Fleet-Feast-2za closed
    Fleet-Feast-280["Fleet-Feast-280<br/>Add slide-in animation for mobile fil..."]
    class Fleet-Feast-280 closed
```

---

## 📋 Fleet-Feast-azl4 Integration verification for Helcim payment system

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:13 |
| **Updated** | 2025-12-20 19:13 |
| **Labels** | agent:Jordan_Junction, category:enhancement, phase:4, type:post-completion |

### Description

Final integration verification for complete Helcim payment system.

**Verification Checklist:**

**1. Customer Payment Flow:**
- [ ] HelcimPaymentForm loads correctly
- [ ] Card tokenization works
- [ ] Payment processes via Helcim API
- [ ] Success/failure handled correctly
- [ ] Fee split calculated and stored

**2. Webhook Integration:**
- [ ] Webhooks received from Helcim
- [ ] Payment status updates correctly
- [ ] Notifications triggered
- [ ] Idempotency works

**3. Vendor Bank Setup:**
- [ ] Bank account form submits
- [ ] Data encrypted at rest
- [ ] Account displays masked
- [ ] Verification status updates

**4. Payout System:**
- [ ] Scheduler runs correctly
- [ ] Payouts created for eligible bookings
- [ ] Disputes block payouts
- [ ] Admin can hold/release
- [ ] Vendor sees payout history

**5. Edge Cases:**
- [ ] Payment decline handled
- [ ] Webhook timeout/retry
- [ ] Invalid bank account detection
- [ ] Payout failure recovery

**6. Stripe Removal Verification:**
- [ ] No Stripe errors in console
- [ ] No Stripe API calls
- [ ] No Stripe UI elements
- [ ] Environment clean of Stripe keys

**Testing Environments:**
- Helcim sandbox/test mode
- Test card numbers
- Simulated webhooks

**Acceptance Criteria:**
- [ ] All flows work end-to-end
- [ ] No regressions from Stripe removal
- [ ] Performance acceptable
- [ ] Error handling robust

**Files:** (verification task, may touch multiple files for fixes)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-u0h3`
- ⛔ **blocks**: `Fleet-Feast-mnxj`
- ⛔ **blocks**: `Fleet-Feast-qemg`
- ⛔ **blocks**: `Fleet-Feast-jwyf`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-azl4 -s in_progress

# Add a comment
bd comment Fleet-Feast-azl4 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-azl4 -p 1

# View full details
bd show Fleet-Feast-azl4
```

</details>

---

## ✨ Fleet-Feast-mnxj Add vendor payout settings page with bank account management

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:12 |
| **Updated** | 2025-12-20 19:12 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:3, type:post-completion |

### Description

Create vendor settings page for managing payout bank account and viewing payout history.

**New Page:** /vendor/settings/payouts (or add section to existing settings)

**Sections:**

**1. Bank Account:**
- Current bank account display (masked)
- Add/Update bank account button → VendorBankAccountForm
- Verification status badge
- Remove account option (with confirmation)

**2. Payout History:**
- Table of past payouts
- Columns: Date, Amount, Status, Bookings, Reference
- Status badges: Pending, Processing, Completed, Failed
- Click to expand: see included bookings

**3. Pending Earnings:**
- Show bookings awaiting payout (in 7-day window)
- Display: Booking, Event Date, Amount, Payout Date
- Total pending amount

**4. Payout Preferences (future):**
- Minimum payout threshold (optional)
- Payout frequency preferences

**Remove:**
- Stripe Connect onboarding flow
- Stripe dashboard links

**API Calls:**
- GET /api/vendor/bank-account
- GET /api/vendor/payouts (history)
- GET /api/vendor/payouts/pending (earnings awaiting payout)

**Acceptance Criteria:**
- [ ] Bank account section works
- [ ] Payout history displays
- [ ] Pending earnings show correctly
- [ ] Status badges accurate
- [ ] Responsive design
- [ ] Stripe references removed

**Files:**
- app/vendor/settings/payouts/page.tsx (NEW or update settings)
- Remove Stripe Connect UI components

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-uvzu`
- ⛔ **blocks**: `Fleet-Feast-602`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-mnxj -s in_progress

# Add a comment
bd comment Fleet-Feast-mnxj 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-mnxj -p 1

# View full details
bd show Fleet-Feast-mnxj
```

</details>

---

## ✨ Fleet-Feast-u0h3 Update payment page to use HelcimPaymentForm

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:12 |
| **Updated** | 2025-12-20 19:12 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:3, type:post-completion |

### Description

Update the customer payment page to use Helcim instead of Stripe.

**Current State:**
- app/customer/booking/[id]/payment/page.tsx
- Uses Stripe Elements or similar

**Changes Required:**
1. Remove Stripe Elements/PaymentElement
2. Add HelcimPaymentForm component
3. Update form submission to:
   - Get cardToken from HelcimPaymentForm
   - POST to /api/payments with token
4. Handle payment success → redirect to confirmation
5. Handle payment failure → show error, allow retry

**Updated Flow:**
1. Page loads with booking details + amount
2. Customer enters card in HelcimPaymentForm
3. Submit tokenizes card via Helcim.js
4. Token sent to /api/payments
5. API processes payment via Helcim
6. Success: redirect to confirmation
7. Failure: show error message

**Display Updates:**
- Show fee breakdown (proposal + 5% service fee)
- Show total amount to charge
- Show secure payment badges
- Update payment processor branding (remove Stripe, add Helcim if required)

**Acceptance Criteria:**
- [ ] HelcimPaymentForm renders
- [ ] Tokenization and payment work
- [ ] Fee breakdown displays correctly
- [ ] Success redirects to confirmation
- [ ] Errors display clearly
- [ ] Loading states during payment

**Files:**
- app/customer/booking/[id]/payment/page.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-67o`
- ⛔ **blocks**: `Fleet-Feast-rpi`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-u0h3 -s in_progress

# Add a comment
bd comment Fleet-Feast-u0h3 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-u0h3 -p 1

# View full details
bd show Fleet-Feast-u0h3
```

</details>

---

## ✨ Fleet-Feast-f3y Implement automated vendor payout scheduling system

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:11 |
| **Updated** | 2025-12-20 19:11 |
| **Labels** | agent:Blake_Backend, category:enhancement, phase:2, type:post-completion |

### Description

Create system to automatically schedule and process vendor payouts.

**Payout Rules (from PRD):**
- 7 days after event completion
- Only if no active dispute
- Deduct platform fee (5% vendor portion)

**Components:**

**1. Payout Scheduler (Cron):**
- Run daily at 6 AM
- Find bookings: COMPLETED, 7+ days ago, no dispute
- Create VendorPayout records
- Batch by vendor (multiple bookings = one payout)

**2. Payout Processor (Cron):**
- Process PENDING payouts
- Generate ACH/EFT file or use Helcim ACH API
- Update status to PROCESSING → COMPLETED/FAILED
- Notify vendor of payout

**3. Admin Payout Management:**
- View pending payouts
- Approve/hold individual payouts
- Manual payout trigger
- View payout history

**API Endpoints:**
- POST /api/admin/payouts/process - Trigger payout processing
- GET /api/admin/payouts - List all payouts
- GET /api/admin/payouts/:id - Payout details
- POST /api/admin/payouts/:id/hold - Hold a payout
- POST /api/admin/payouts/:id/release - Release held payout

**Cron Jobs:**
- /api/cron/schedule-payouts - Daily at 6 AM
- /api/cron/process-payouts - Daily at 7 AM

**Acceptance Criteria:**
- [ ] Payouts scheduled automatically after 7 days
- [ ] Disputes block payout scheduling
- [ ] Platform fee deducted correctly
- [ ] Batch payouts by vendor
- [ ] Admin can hold/release payouts
- [ ] Vendor notified on payout

**Files:**
- app/api/cron/schedule-payouts/route.ts (NEW)
- app/api/cron/process-payouts/route.ts (NEW)
- app/api/admin/payouts/route.ts (NEW)
- modules/payout/payout.service.ts (NEW)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-ndn`
- ⛔ **blocks**: `Fleet-Feast-602`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-f3y -s in_progress

# Add a comment
bd comment Fleet-Feast-f3y 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-f3y -p 1

# View full details
bd show Fleet-Feast-f3y
```

</details>

---

## ✨ Fleet-Feast-602 Create vendor bank account management API

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:10 |
| **Updated** | 2025-12-20 19:10 |
| **Labels** | agent:Ellis_Endpoints, category:enhancement, phase:2, type:post-completion |

### Description

Create API endpoints for vendors to manage their bank account for payouts.

**Endpoints:**

**POST /api/vendor/bank-account:**
- Add/update bank account info
- Encrypt sensitive fields before storage
- Trigger verification process

**GET /api/vendor/bank-account:**
- Return bank account info (masked)
- Show verification status

**DELETE /api/vendor/bank-account:**
- Remove bank account (only if no pending payouts)

**POST /api/vendor/bank-account/verify:**
- Micro-deposit verification flow (optional)
- Or manual admin verification

**Request Body (POST):**
{
  accountHolderName: string,
  accountNumber: string,
  routingNumber: string,
  accountType: 'CHECKING' | 'SAVINGS',
  bankName?: string
}

**Response (GET):**
{
  accountHolderName: string,
  accountNumberLast4: string,  // Only last 4
  routingNumber: string,
  accountType: string,
  bankName: string,
  verified: boolean,
  verifiedAt: string | null
}

**Security:**
- Encrypt account number with AES-256
- Audit log all changes
- Rate limit submissions
- Require re-authentication for changes

**Acceptance Criteria:**
- [ ] Vendors can add bank account
- [ ] Account number encrypted at rest
- [ ] Only last 4 digits returned in GET
- [ ] Verification status tracked
- [ ] Audit trail for changes

**Files:**
- app/api/vendor/bank-account/route.ts (NEW)
- lib/encryption.ts (NEW or update)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-0jt`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-602 -s in_progress

# Add a comment
bd comment Fleet-Feast-602 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-602 -p 1

# View full details
bd show Fleet-Feast-602
```

</details>

---

## ✨ Fleet-Feast-zt6 Create Helcim webhook handler for payment events

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:10 |
| **Updated** | 2025-12-20 19:10 |
| **Labels** | agent:Ellis_Endpoints, category:enhancement, phase:2, type:post-completion |

### Description

Implement webhook endpoint for Helcim payment event notifications.

**Endpoint:** POST /api/payments/webhook

**Helcim Webhook Events:**
- transaction.approved - Payment successful
- transaction.declined - Payment failed
- transaction.refunded - Refund processed
- transaction.voided - Authorization voided

**Implementation:**
1. Verify webhook signature (HMAC)
2. Parse event type and data
3. Update Payment/EscrowTransaction records
4. Trigger appropriate notifications
5. Return 200 OK (Helcim expects this)

**Event Handling:**
- transaction.approved: Update Payment to AUTHORIZED, notify customer
- transaction.declined: Update Payment to FAILED, notify customer
- transaction.refunded: Create REFUND escrow entry, update booking
- transaction.voided: Handle authorization cancellation

**Security:**
- Validate HMAC signature
- Only accept from Helcim IPs (if provided)
- Log all webhook events
- Idempotency handling (duplicate webhooks)

**Acceptance Criteria:**
- [ ] Webhook endpoint created
- [ ] Signature verification works
- [ ] All event types handled
- [ ] Database updated correctly
- [ ] Notifications triggered
- [ ] Proper error responses

**Files:**
- app/api/payments/webhook/route.ts

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-1p1`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-zt6 -s in_progress

# Add a comment
bd comment Fleet-Feast-zt6 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-zt6 -p 1

# View full details
bd show Fleet-Feast-zt6
```

</details>

---

## ✨ Fleet-Feast-rpi Implement payment API endpoints with Helcim integration

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:09 |
| **Updated** | 2025-12-20 19:09 |
| **Labels** | agent:Ellis_Endpoints, category:enhancement, phase:2, type:post-completion |

### Description

Rewrite payment API endpoints to use Helcim instead of Stripe.

**Endpoints to Update:**

**POST /api/payments (create payment):**
- Accept cardToken from Helcim.js
- Call Helcim preauth API to hold funds
- Create EscrowTransaction with HOLD type
- Update Payment model with helcimTransactionId
- Return success/failure

**POST /api/payments/:id/capture:**
- For admin/cron to capture held funds after event
- Call Helcim capture API
- Create EscrowTransaction with CAPTURE type
- Update Payment status

**POST /api/payments/:id/refund:**
- Call Helcim refund API
- Create EscrowTransaction with REFUND type
- Update booking status
- Handle partial refunds

**GET /api/payments/:id:**
- Fetch payment details
- Include escrow transaction history

**Request Body Changes:**
- Remove Stripe-specific fields
- Add: cardToken (from Helcim.js)
- Add: cardHolderName, billingAddress (if needed)

**Acceptance Criteria:**
- [ ] Payments process through Helcim
- [ ] Preauth (hold) works correctly
- [ ] Capture releases held funds
- [ ] Refunds process correctly
- [ ] Escrow ledger updated on each action
- [ ] Error handling for Helcim failures

**Files:**
- app/api/payments/route.ts
- app/api/payments/[id]/route.ts
- app/api/payments/[id]/refund/route.ts

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-1p1`
- ⛔ **blocks**: `Fleet-Feast-ndn`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-rpi -s in_progress

# Add a comment
bd comment Fleet-Feast-rpi 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-rpi -p 1

# View full details
bd show Fleet-Feast-rpi
```

</details>

---

## 📋 Fleet-Feast-1p1 Install and configure Helcim SDK and API client

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:09 |
| **Updated** | 2025-12-20 19:09 |
| **Labels** | agent:Blake_Backend, category:enhancement, phase:2, type:post-completion |

### Description

Set up Helcim API integration for payment processing.

**Installation:**
npm install @helcim/helcim-js  # Or use REST API directly

**Environment Variables:**
- HELCIM_API_TOKEN: API authentication token
- HELCIM_ACCOUNT_ID: Helcim account ID
- HELCIM_JS_CONFIG_TOKEN: Token for Helcim.js frontend
- HELCIM_WEBHOOK_SECRET: For webhook verification

**Create lib/helcim.ts:**
- Initialize Helcim API client
- Helper functions for common operations
- Error handling and logging
- Rate limiting awareness

**API Endpoints Used:**
- POST /payment/purchase - Process payment
- POST /payment/preauth - Authorize (hold) funds
- POST /payment/capture - Capture held funds
- POST /payment/refund - Process refunds
- GET /payment/{transactionId} - Get transaction details

**Acceptance Criteria:**
- [ ] Helcim SDK/client installed
- [ ] API client configured with auth
- [ ] Environment variables documented
- [ ] Basic API connectivity tested
- [ ] TypeScript types for Helcim responses

**Files:**
- package.json
- lib/helcim.ts (NEW)
- .env.example

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-bb0`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-1p1 -s in_progress

# Add a comment
bd comment Fleet-Feast-1p1 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-1p1 -p 1

# View full details
bd show Fleet-Feast-1p1
```

</details>

---

## ✨ Fleet-Feast-ndn Create internal escrow ledger system for payment tracking

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:09 |
| **Updated** | 2025-12-20 19:09 |
| **Labels** | agent:Dana_Database, category:enhancement, phase:1, type:post-completion |

### Description

Create database models for internal escrow ledger to track payment lifecycle.

**New Models:**

**EscrowTransaction:**
- id: String (UUID)
- bookingId: String (FK)
- type: Enum (CAPTURE, HOLD, RELEASE, REFUND)
- amount: Decimal
- status: Enum (PENDING, COMPLETED, FAILED)
- helcimTransactionId: String? - External reference
- createdAt: DateTime
- completedAt: DateTime?
- notes: String?

**VendorPayout:**
- id: String (UUID)
- vendorId: String (FK)
- amount: Decimal
- status: Enum (PENDING, PROCESSING, COMPLETED, FAILED)
- payoutMethod: Enum (ACH, EFT, WIRE)
- scheduledFor: DateTime
- processedAt: DateTime?
- externalReference: String? - Bank reference number
- failureReason: String?
- bookings: Booking[] - Many-to-many for batch payouts

**Indexes:**
- EscrowTransaction: bookingId, status, createdAt
- VendorPayout: vendorId, status, scheduledFor

**Acceptance Criteria:**
- [ ] EscrowTransaction model created
- [ ] VendorPayout model created
- [ ] Proper relations to Booking and Vendor
- [ ] Status enums defined
- [ ] Migration created

**Files:** prisma/schema.prisma

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-bb0`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-ndn -s in_progress

# Add a comment
bd comment Fleet-Feast-ndn 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-ndn -p 1

# View full details
bd show Fleet-Feast-ndn
```

</details>

---

## ✨ Fleet-Feast-0jt Add vendor bank account fields to Vendor model

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:08 |
| **Updated** | 2025-12-20 19:08 |
| **Labels** | agent:Dana_Database, category:enhancement, phase:1, type:post-completion |

### Description

Add fields to Vendor model for storing bank account information for payouts.

**New Fields:**
- bankAccountHolder: String - Account holder name
- bankAccountNumber: String (encrypted) - Account number
- bankRoutingNumber: String - Routing/Transit number
- bankAccountType: Enum (CHECKING, SAVINGS)
- bankName: String? - Bank name for display
- bankVerified: Boolean - Whether account has been verified
- bankVerifiedAt: DateTime? - When verification occurred
- payoutMethod: Enum (ACH, EFT, WIRE) - Payout method

**Remove Fields:**
- stripeAccountId (replaced by bank fields)
- stripeConnected (replaced by bankVerified)

**Security Considerations:**
- Account number should be encrypted at rest
- Only show last 4 digits in UI
- Audit log for bank info changes

**Acceptance Criteria:**
- [ ] All new fields added to Vendor model
- [ ] Encryption strategy for sensitive fields documented
- [ ] Migration handles existing vendors gracefully
- [ ] BankAccountType enum created

**Files:** prisma/schema.prisma

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-bb0`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-0jt -s in_progress

# Add a comment
bd comment Fleet-Feast-0jt 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-0jt -p 1

# View full details
bd show Fleet-Feast-0jt
```

</details>

---

## 📋 Fleet-Feast-bb0 Remove Stripe dependencies and clean up Stripe-specific code

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:08 |
| **Updated** | 2025-12-20 19:08 |
| **Labels** | agent:Blake_Backend, category:refactor, phase:1, type:post-completion |

### Description

Remove all Stripe SDK dependencies and Stripe-specific code.

**Files to Update/Remove:**
- package.json: Remove @stripe/stripe-js, stripe
- lib/stripe.ts: Delete or repurpose
- app/api/payments/webhook/route.ts: Remove Stripe webhook handling
- app/api/payments/connect/onboard/route.ts: Remove (Stripe Connect specific)

**Database Changes:**
- Keep stripePaymentIntentId in Payment model (rename to externalPaymentId)
- Keep stripeTransferId (rename to externalTransferId)
- Remove stripeAccountId from Vendor (replace with bank info)
- Remove stripeConnected from Vendor

**Environment Variables to Remove:**
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_CONNECT_*

**Acceptance Criteria:**
- [ ] No Stripe packages in package.json
- [ ] No Stripe imports in codebase
- [ ] Database fields renamed appropriately
- [ ] Build succeeds without Stripe

**Files:**
- package.json
- lib/stripe.ts (delete)
- prisma/schema.prisma
- .env.example

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-bb0 -s in_progress

# Add a comment
bd comment Fleet-Feast-bb0 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-bb0 -p 1

# View full details
bd show Fleet-Feast-bb0
```

</details>

---

## 📋 Fleet-Feast-wsl Integrate and verify complete inquiry-proposal-payment flow

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:01 |
| **Updated** | 2025-12-20 19:01 |
| **Labels** | agent:Jordan_Junction, category:enhancement, phase:4, type:post-completion |

### Description

Integration task to verify all components work together end-to-end.

**Integration Checklist:**

1. **Frontend-Backend Connection:**
   - [ ] InquiryForm submits to /api/inquiries correctly
   - [ ] ProposalBuilder submits to /api/bookings/:id/proposal
   - [ ] ProposalCard accept/decline calls correct endpoints
   - [ ] Error responses display user-friendly messages

2. **State Management:**
   - [ ] Booking status updates reflect in UI without refresh
   - [ ] Optimistic updates where appropriate
   - [ ] Loading states during API calls
   - [ ] Error recovery (retry mechanisms)

3. **Payment Integration:**
   - [ ] Accept redirects to payment with correct amount
   - [ ] Payment page shows customer fee separately
   - [ ] Successful payment updates booking to PAID
   - [ ] Failed payment shows error, allows retry

4. **Notification Flow:**
   - [ ] Inquiry triggers vendor notification
   - [ ] Proposal triggers customer notification
   - [ ] Accept triggers vendor notification
   - [ ] Notifications link to correct pages

5. **Edge Cases:**
   - [ ] Concurrent proposal send (one should fail)
   - [ ] Accept while another tab declines
   - [ ] Network failure recovery
   - [ ] Session timeout handling

**Final Verification:**
Run through complete flow manually in staging environment.

**Acceptance Criteria:**
- [ ] All integration points verified
- [ ] No console errors in browser
- [ ] No unhandled API errors
- [ ] Mobile and desktop flows work

**Files:** (verification task, may touch multiple files for fixes)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-88e`
- ⛔ **blocks**: `Fleet-Feast-l33`
- ⛔ **blocks**: `Fleet-Feast-cyi`
- ⛔ **blocks**: `Fleet-Feast-fjp`
- ⛔ **blocks**: `Fleet-Feast-6ea`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-wsl -s in_progress

# Add a comment
bd comment Fleet-Feast-wsl 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-wsl -p 1

# View full details
bd show Fleet-Feast-wsl
```

</details>

---

## ✨ Fleet-Feast-cyi Update /vendor/messages/[bookingId] page with proposal sending

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:59 |
| **Updated** | 2025-12-20 18:59 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:3, type:post-completion |

### Description

Update vendor messages page to allow sending proposals on inquiries.

**Current State:**
- Shows message thread between vendor and customer
- app/vendor/messages/[bookingId]/page.tsx

**New Features:**
1. Detect if booking is inquiry (status: INQUIRY)
2. Show 'Send Proposal' button in header or floating
3. Click opens ProposalBuilder modal/drawer
4. Submit sends POST /api/bookings/:id/proposal
5. After send, show ProposalCard (vendor view: read-only)
6. Show inquiry details summary

**ProposalBuilder Integration:**
- Pass inquiry data (event details, guest count, etc.)
- Pass vendor menu for price suggestions
- Handle submit: call API, close modal, refresh page
- Show loading/success states

**Status-Specific UI:**
- INQUIRY: Show inquiry banner + 'Send Proposal' CTA
- PROPOSAL_SENT: Show read-only ProposalCard + 'Awaiting response'
- ACCEPTED: Show 'Customer accepted' + 'Awaiting payment'
- DECLINED: Show 'Customer declined' message
- EXPIRED: Show 'Proposal expired' + option to resend

**Acceptance Criteria:**
- [ ] 'Send Proposal' button visible for INQUIRY status
- [ ] ProposalBuilder modal opens and works
- [ ] Proposal submits successfully
- [ ] Page updates to show sent proposal
- [ ] Status-specific messaging

**Files:**
- app/vendor/messages/[bookingId]/page.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-skd`
- ⛔ **blocks**: `Fleet-Feast-eay`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-cyi -s in_progress

# Add a comment
bd comment Fleet-Feast-cyi 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-cyi -p 1

# View full details
bd show Fleet-Feast-cyi
```

</details>

---

## ✨ Fleet-Feast-l33 Update /customer/messages/[bookingId] page with ProposalCard

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:59 |
| **Updated** | 2025-12-20 18:59 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:3, type:post-completion |

### Description

Update customer messages page to display proposals and accept/decline actions.

**Current State:**
- Shows message thread between customer and vendor
- app/customer/messages/[bookingId]/page.tsx

**New Features:**
1. Detect if booking has proposal (status: PROPOSAL_SENT)
2. Render ProposalCard at top of message thread or inline
3. Accept button triggers POST /api/bookings/:id/accept
4. Decline button triggers POST /api/bookings/:id/decline
5. After accept, redirect to payment page
6. Show proposal status badge in header

**ProposalCard Integration:**
- Pass proposal data from booking object
- Handle onAccept: call API, redirect to payment
- Handle onDecline: call API, show confirmation
- Show loading states

**Status-Specific UI:**
- INQUIRY: Show 'Awaiting vendor proposal' banner
- PROPOSAL_SENT: Show ProposalCard with actions
- ACCEPTED: Show 'Proposal accepted' + payment link
- PAID/CONFIRMED: Show confirmation details
- DECLINED: Show 'Proposal declined' message
- EXPIRED: Show 'Proposal expired' message

**Acceptance Criteria:**
- [ ] ProposalCard renders when proposal exists
- [ ] Accept flow completes and redirects
- [ ] Decline flow with confirmation
- [ ] Status-specific messaging
- [ ] Real-time updates if possible

**Files:**
- app/customer/messages/[bookingId]/page.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-vwa`
- ⛔ **blocks**: `Fleet-Feast-9ji`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-l33 -s in_progress

# Add a comment
bd comment Fleet-Feast-l33 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-l33 -p 1

# View full details
bd show Fleet-Feast-l33
```

</details>

---

## ✨ Fleet-Feast-88e Update /customer/booking page to inquiry-only flow

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:58 |
| **Updated** | 2025-12-20 18:58 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:3, type:post-completion |

### Description

Refactor customer booking page from direct booking to inquiry submission.

**Current State:**
- /customer/booking shows BookingClient with price calculator
- Customer selects menu items, sees total, proceeds to payment
- app/customer/booking/BookingClient.tsx

**New State:**
- Page uses InquiryForm component
- No price calculation
- Submit creates inquiry (status: INQUIRY)
- Redirects to messages thread after submission
- Clear messaging: 'Request a Quote'

**Changes Required:**
1. Replace BookingClient with InquiryForm
2. Update page.tsx to fetch vendor data only (no menu pricing needed)
3. Update API call to POST /api/inquiries
4. Redirect to /customer/messages/[bookingId] on success
5. Update page title/meta

**Acceptance Criteria:**
- [ ] Page loads InquiryForm
- [ ] No price calculator visible
- [ ] Form submits to /api/inquiries
- [ ] Redirects to messages on success
- [ ] Error handling for API failures
- [ ] Loading states during submission

**Files:**
- app/customer/booking/page.tsx
- app/customer/booking/BookingClient.tsx (major refactor or delete)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-b4t`
- ⛔ **blocks**: `Fleet-Feast-dpx`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-88e -s in_progress

# Add a comment
bd comment Fleet-Feast-88e 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-88e -p 1

# View full details
bd show Fleet-Feast-88e
```

</details>

---

## ✨ Fleet-Feast-coe Update booking types and validation for inquiry-proposal flow

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:57 |
| **Updated** | 2025-12-20 18:57 |
| **Labels** | agent:Blake_Backend, category:enhancement, phase:2, type:post-completion |

### Description

Update TypeScript types and Zod validation schemas for new booking flow.

**Updated Types (booking.types.ts):**
- InquiryRequestData: New type for inquiry submission
- ProposalData: New type for vendor proposals
- BookingDetails: Add proposal fields
- BookingListItem: Add status-specific fields

**New Validation Schemas (booking.validation.ts):**
- inquiryRequestSchema: Validate inquiry submission
- proposalSchema: Validate proposal data
- proposalAcceptSchema: Validate acceptance

**Acceptance Criteria:**
- [ ] All new types exported
- [ ] Validation schemas match API requirements
- [ ] Existing types backward compatible
- [ ] Types match Prisma generated types

**Files:**
- modules/booking/booking.types.ts
- modules/booking/booking.validation.ts

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-exf`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-coe -s in_progress

# Add a comment
bd comment Fleet-Feast-coe 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-coe -p 1

# View full details
bd show Fleet-Feast-coe
```

</details>

---

## ✨ Fleet-Feast-fjp Update payment flow for 50/50 platform fee split

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:56 |
| **Updated** | 2025-12-20 18:56 |
| **Labels** | agent:Blake_Backend, category:enhancement, phase:2, type:post-completion |

### Description

Update Stripe payment integration for 50/50 fee split model.

**New Fee Structure:**
- Total platform fee: 10% of booking amount
- Customer pays: booking amount + 5% (as service fee)
- Vendor receives: booking amount - 5% (deducted from payout)

**Example (from spec):**
Booking total: $1000
Fee rate: 10%
Customer pays: $1000 + $50 = $1050
Vendor receives: $1000 - $50 = $950
Platform keeps: $100

**Implementation:**
- Update payment intent creation with customer fee
- Update Stripe Connect transfer with vendor deduction
- Store both fee components in Booking model
- Update receipts/invoices to show fee breakdown

**Acceptance Criteria:**
- [ ] Customer charged proposal + 5% service fee
- [ ] Vendor receives proposal - 5% platform fee
- [ ] Both fees stored in database
- [ ] Stripe metadata includes fee breakdown
- [ ] Payment confirmation shows fees transparently

**Files:**
- app/api/payments/route.ts
- modules/payment/payment.service.ts (if exists)
- lib/stripe.ts (if exists)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-9ji`
- ⛔ **blocks**: `Fleet-Feast-rpi`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-fjp -s in_progress

# Add a comment
bd comment Fleet-Feast-fjp 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-fjp -p 1

# View full details
bd show Fleet-Feast-fjp
```

</details>

---

## ✨ Fleet-Feast-cuk Update POST /api/bookings/:id/decline for inquiry/proposal decline

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:56 |
| **Updated** | 2025-12-20 18:56 |
| **Labels** | agent:Ellis_Endpoints, category:enhancement, phase:2, type:post-completion |

### Description

Update decline endpoint to handle both vendor and customer declines.

**Endpoint:** POST /api/bookings/:id/decline

**Request Body:**
{
  reason?: string
}

**Business Logic:**

**Customer Declines Proposal:**
- Validates booking is in PROPOSAL_SENT status
- Sets status to DECLINED
- Notifies vendor

**Vendor Declines Inquiry:**
- Validates booking is in INQUIRY status
- Sets status to DECLINED
- Notifies customer

**Response:**
{
  id: string,
  status: 'DECLINED',
  declinedAt: string
}

**Acceptance Criteria:**
- [ ] Customer can decline proposals (PROPOSAL_SENT → DECLINED)
- [ ] Vendor can decline inquiries (INQUIRY → DECLINED)
- [ ] Proper notifications sent
- [ ] Reason stored in messages

**Files:**
- app/api/bookings/[id]/decline/route.ts (update)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-exf`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-cuk -s in_progress

# Add a comment
bd comment Fleet-Feast-cuk 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-cuk -p 1

# View full details
bd show Fleet-Feast-cuk
```

</details>

---

## ✨ Fleet-Feast-9ji Update POST /api/bookings/:id/accept for proposal acceptance

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:56 |
| **Updated** | 2025-12-20 18:56 |
| **Labels** | agent:Ellis_Endpoints, category:enhancement, phase:2, type:post-completion |

### Description

Update accept endpoint for customers to accept vendor proposals.

**Endpoint:** POST /api/bookings/:id/accept

**Request Body:** (none required, or optional notes)

**Response:**
{
  id: string,
  status: 'ACCEPTED',
  totalAmount: number (proposalAmount + customerFee),
  paymentUrl: string (redirect to payment)
}

**Business Logic:**
- Validates booking is in PROPOSAL_SENT status
- Validates customer owns the booking
- Validates proposal hasn't expired
- Updates status to ACCEPTED
- Calculates 50/50 fee split:
  * Platform fee = 10% of proposalAmount
  * Customer pays: proposalAmount + 5% (platformFeeCustomer)
  * Vendor receives: proposalAmount - 5% (platformFeeVendor)
- Triggers PROPOSAL_ACCEPTED notification to vendor
- Returns payment initiation URL

**Acceptance Criteria:**
- [ ] Only customers can accept
- [ ] Only PROPOSAL_SENT bookings can be accepted
- [ ] Expired proposals rejected with 400
- [ ] Fee split calculated correctly
- [ ] Vendor notified

**Files:**
- app/api/bookings/[id]/accept/route.ts (update)
- modules/booking/booking.service.ts (update)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-eay`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-9ji -s in_progress

# Add a comment
bd comment Fleet-Feast-9ji 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-9ji -p 1

# View full details
bd show Fleet-Feast-9ji
```

</details>

---

## ✨ Fleet-Feast-eay Create POST /api/bookings/:id/proposal endpoint for vendor proposals

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:55 |
| **Updated** | 2025-12-20 18:55 |
| **Labels** | agent:Ellis_Endpoints, category:enhancement, phase:2, type:post-completion |

### Description

Create endpoint for vendors to send proposals on inquiries.

**Endpoint:** POST /api/bookings/:id/proposal

**Request Body:**
{
  proposalAmount: number,
  proposalDetails: {
    lineItems: [{name, quantity, unitPrice, total}],
    inclusions: string[],
    terms?: string
  },
  expiresInDays?: number (default: 7)
}

**Response:**
{
  id: string,
  status: 'PROPOSAL_SENT',
  proposalAmount: number,
  proposalExpiresAt: string
}

**Business Logic:**
- Validates booking is in INQUIRY status
- Validates vendor owns the booking
- Updates booking with proposal fields
- Sets status to PROPOSAL_SENT
- Triggers PROPOSAL_SENT notification to customer
- Creates proposal message in thread

**Acceptance Criteria:**
- [ ] Only vendors can send proposals
- [ ] Only INQUIRY status bookings accept proposals
- [ ] Proposal fields populated correctly
- [ ] Customer receives notification
- [ ] Proposal message added to thread

**Files:**
- app/api/bookings/[id]/proposal/route.ts (NEW)
- modules/booking/booking.service.ts (update)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-exf`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-eay -s in_progress

# Add a comment
bd comment Fleet-Feast-eay 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-eay -p 1

# View full details
bd show Fleet-Feast-eay
```

</details>

---

## ✨ Fleet-Feast-dpx Create POST /api/inquiries endpoint for customer inquiry submission

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:55 |
| **Updated** | 2025-12-20 18:55 |
| **Labels** | agent:Ellis_Endpoints, category:enhancement, phase:2, type:post-completion |

### Description

Create new endpoint for customers to submit booking inquiries.

**Endpoint:** POST /api/inquiries

**Request Body:**
{
  vendorId: string,
  eventDate: string (YYYY-MM-DD),
  eventTime: string (HH:MM),
  eventType: EventType,
  location: string,
  guestCount: number,
  specialRequests?: string
}

**Response:** 
{
  id: string (booking ID),
  status: 'INQUIRY',
  createdAt: string
}

**Business Logic:**
- Creates Booking with status=INQUIRY
- Creates initial message thread
- Triggers INQUIRY_RECEIVED notification to vendor
- Validates vendor availability for date

**Acceptance Criteria:**
- [ ] Endpoint accepts inquiry data
- [ ] Booking created with INQUIRY status
- [ ] Message thread initialized
- [ ] Vendor notified
- [ ] Validation errors return 400

**Files:** 
- app/api/inquiries/route.ts (NEW)
- modules/booking/booking.service.ts (update)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-exf`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-dpx -s in_progress

# Add a comment
bd comment Fleet-Feast-dpx 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-dpx -p 1

# View full details
bd show Fleet-Feast-dpx
```

</details>

---

## 📋 Fleet-Feast-exf Create and run Prisma migration for inquiry-proposal schema

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:55 |
| **Updated** | 2025-12-20 18:55 |
| **Labels** | agent:Dana_Database, category:enhancement, phase:1, type:post-completion |

### Description

Create and apply Prisma migration for all schema changes.

**Migration Tasks:**
- Generate migration for enum changes
- Generate migration for new Booking fields  
- Handle data migration for existing bookings
- Map old statuses to new (PENDING→INQUIRY, etc.)

**Acceptance Criteria:**
- [ ] Migration created: npx prisma migrate dev --name inquiry-proposal-flow
- [ ] Existing data properly migrated
- [ ] Rollback strategy documented
- [ ] Prisma client regenerated

**Commands:**
npx prisma migrate dev --name inquiry-proposal-flow
npx prisma generate

**Files:** prisma/migrations/*/migration.sql

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-5vo`
- ⛔ **blocks**: `Fleet-Feast-y1r`
- ⛔ **blocks**: `Fleet-Feast-tp2`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-exf -s in_progress

# Add a comment
bd comment Fleet-Feast-exf 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-exf -p 1

# View full details
bd show Fleet-Feast-exf
```

</details>

---

## ✨ Fleet-Feast-tp2 Add proposal notification types to NotificationType enum

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:54 |
| **Updated** | 2025-12-20 18:54 |
| **Labels** | agent:Dana_Database, category:enhancement, phase:1, type:post-completion |

### Description

Add new notification types for proposal workflow.

**New NotificationTypes:**
- INQUIRY_RECEIVED: Vendor receives new inquiry
- PROPOSAL_SENT: Customer receives proposal
- PROPOSAL_ACCEPTED: Vendor notified of acceptance
- PROPOSAL_EXPIRING: Customer reminded proposal expires soon
- PROPOSAL_EXPIRED: Both parties notified of expiration

**Acceptance Criteria:**
- [ ] All 5 new notification types added
- [ ] NotificationPreferences model updated for new types
- [ ] Migration handles existing notification preferences

**Files:** prisma/schema.prisma

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-5vo`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-tp2 -s in_progress

# Add a comment
bd comment Fleet-Feast-tp2 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-tp2 -p 1

# View full details
bd show Fleet-Feast-tp2
```

</details>

---

## ✨ Fleet-Feast-y1r Add proposal fields to Booking model

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:54 |
| **Updated** | 2025-12-20 18:54 |
| **Labels** | agent:Dana_Database, category:enhancement, phase:1, type:post-completion |

### Description

Add new fields to Booking model to support proposal workflow.

**New Fields:**
- proposalAmount: Decimal - Vendor's proposed price
- proposalDetails: Json - Line items, inclusions, terms
- proposalSentAt: DateTime? - When vendor sent proposal
- proposalExpiresAt: DateTime? - Proposal expiration deadline
- platformFeeCustomer: Decimal - 50% of fee paid by customer
- platformFeeVendor: Decimal - 50% of fee deducted from vendor

**Acceptance Criteria:**
- [ ] All 6 new fields added to Booking model
- [ ] Proper types and optionality set
- [ ] Indexes added for proposal queries
- [ ] Migration file created and tested

**Files:** prisma/schema.prisma

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-5vo`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-y1r -s in_progress

# Add a comment
bd comment Fleet-Feast-y1r 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-y1r -p 1

# View full details
bd show Fleet-Feast-y1r
```

</details>

---

## ✨ Fleet-Feast-5vo Update BookingStatus enum with inquiry-proposal flow statuses

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:54 |
| **Updated** | 2025-12-20 18:54 |
| **Labels** | agent:Dana_Database, category:enhancement, phase:1, type:post-completion |

### Description

Update the BookingStatus enum in Prisma schema to support the new inquiry-to-proposal booking flow.

**New Statuses:**
- INQUIRY: Customer submitted inquiry, awaiting vendor proposal
- PROPOSAL_SENT: Vendor sent proposal, awaiting customer acceptance  
- ACCEPTED: Customer accepted proposal, awaiting payment
- PAID: Payment completed, pending confirmation
- CONFIRMED: Payment confirmed, booking active
- COMPLETED: Event occurred successfully
- DECLINED: Customer or vendor declined
- EXPIRED: Proposal or inquiry expired without action
- CANCELLED: Cancelled after confirmation

**Acceptance Criteria:**
- [ ] BookingStatus enum updated with all 9 new statuses
- [ ] Backward compatibility migration strategy documented
- [ ] Existing PENDING/ACCEPTED bookings handled gracefully
- [ ] Schema generates valid Prisma client

**Files:** prisma/schema.prisma

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-5vo -s in_progress

# Add a comment
bd comment Fleet-Feast-5vo 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-5vo -p 1

# View full details
bd show Fleet-Feast-5vo
```

</details>

---

## 📋 Fleet-Feast-jwyf Write tests for Helcim payment integration

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:13 |
| **Updated** | 2025-12-20 19:13 |
| **Labels** | agent:Taylor_Tester, category:enhancement, phase:4, type:post-completion |

### Description

Create comprehensive tests for Helcim payment and payout system.

**Unit Tests:**

1. **Payment Processing:**
   - Payment creation with valid token
   - Payment failure handling
   - Fee calculation (5% customer, 5% vendor)
   - Escrow ledger entries created

2. **Webhook Handler:**
   - Valid signature verification
   - Invalid signature rejection
   - Each event type handling
   - Idempotency (duplicate webhooks)

3. **Payout Scheduling:**
   - Payouts scheduled after 7 days
   - Disputes block payouts
   - Fee deduction correct
   - Batch payouts by vendor

4. **Bank Account:**
   - Encryption/decryption
   - Validation rules
   - Masking (last 4 only)

**Integration Tests:**

1. **Payment Flow:**
   - Token → API → Helcim (mocked)
   - Database state correct
   - Webhooks update status

2. **Payout Flow:**
   - Scheduler creates payouts
   - Processor updates status
   - Vendor notified

**Mock Setup:**
- Mock Helcim API responses
- Mock webhook payloads
- Test card tokens for Helcim sandbox

**Acceptance Criteria:**
- [ ] >90% coverage for payment code
- [ ] All payment states tested
- [ ] Webhook handling verified
- [ ] Payout scheduling tested
- [ ] Error cases covered

**Files:**
- __tests__/payment/helcim.test.ts
- __tests__/payment/webhook.test.ts
- __tests__/payout/scheduler.test.ts

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-rpi`
- ⛔ **blocks**: `Fleet-Feast-zt6`
- ⛔ **blocks**: `Fleet-Feast-f3y`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-jwyf -s in_progress

# Add a comment
bd comment Fleet-Feast-jwyf 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-jwyf -p 1

# View full details
bd show Fleet-Feast-jwyf
```

</details>

---

## ✨ Fleet-Feast-qemg Create admin payout management dashboard

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:12 |
| **Updated** | 2025-12-20 19:12 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:3, type:post-completion |

### Description

Create admin interface for managing vendor payouts.

**New Page:** /admin/payouts

**Features:**

**1. Payout Queue:**
- List of pending payouts
- Columns: Vendor, Amount, Bookings, Scheduled Date, Status
- Actions: Hold, Approve, Process Now
- Bulk actions for multiple payouts

**2. Payout History:**
- All processed payouts
- Filter by: Status, Date Range, Vendor
- Export to CSV for accounting

**3. Processing:**
- Manual trigger for payout processing
- Download ACH/EFT batch file
- Mark payouts as processed externally

**4. Analytics:**
- Total payouts this month
- Pending amount
- Failed payouts requiring attention
- Platform fees collected

**5. Individual Payout View:**
- Vendor details
- Bank account (masked)
- Included bookings
- Transaction history
- Notes/comments

**Admin Actions:**
- Hold payout (with reason)
- Release held payout
- Cancel payout
- Retry failed payout
- Add note to payout

**Acceptance Criteria:**
- [ ] Payout queue displays correctly
- [ ] Hold/release actions work
- [ ] Batch processing available
- [ ] Export functionality works
- [ ] Analytics display accurately
- [ ] Proper admin authorization

**Files:**
- app/admin/payouts/page.tsx (NEW)
- app/admin/payouts/[id]/page.tsx (NEW)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-f3y`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-qemg -s in_progress

# Add a comment
bd comment Fleet-Feast-qemg 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-qemg -p 1

# View full details
bd show Fleet-Feast-qemg
```

</details>

---

## ✨ Fleet-Feast-uvzu Create VendorBankAccountForm component for payout setup

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:11 |
| **Updated** | 2025-12-20 19:11 |
| **Labels** | agent:Casey_Components, category:enhancement, phase:3, type:post-completion |

### Description

Create form component for vendors to enter their bank account details.

**Component:** VendorBankAccountForm

**Props:**
{
  existingAccount?: BankAccountInfo,  // For editing
  onSuccess: () => void,
  onCancel?: () => void
}

**Form Fields:**
- Account Holder Name (text, required)
- Account Number (password field, required)
- Confirm Account Number (password field, required)
- Routing Number (text, required, validate format)
- Account Type (select: Checking/Savings)
- Bank Name (text, optional, for display)

**Validation:**
- Account numbers match
- Routing number format (9 digits for US)
- Account number format (varies)
- All required fields filled

**Features:**
- Show/hide account number toggle
- Auto-format routing number
- Bank name lookup by routing (optional enhancement)
- Confirmation step before submit
- Success/error toast messages

**Security Messaging:**
- Display security assurance (encryption, PCI)
- Show what info is stored securely
- Link to privacy policy

**Acceptance Criteria:**
- [ ] All fields validate correctly
- [ ] Account numbers match validation
- [ ] Confirmation before submit
- [ ] Success/error handling
- [ ] Accessible form controls
- [ ] Responsive design

**Files:**
- components/vendor/VendorBankAccountForm.tsx (NEW)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-602`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-uvzu -s in_progress

# Add a comment
bd comment Fleet-Feast-uvzu 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-uvzu -p 1

# View full details
bd show Fleet-Feast-uvzu
```

</details>

---

## ✨ Fleet-Feast-67o Create HelcimPaymentForm component with Helcim.js

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:11 |
| **Updated** | 2025-12-20 19:11 |
| **Labels** | agent:Casey_Components, category:enhancement, phase:3, type:post-completion |

### Description

Create payment form component using Helcim.js for PCI-compliant card collection.

**Component:** HelcimPaymentForm

**Helcim.js Integration:**
- Load Helcim.js script dynamically
- Initialize with HELCIM_JS_CONFIG_TOKEN
- Mount card input fields (number, expiry, CVV)
- Handle tokenization on submit

**Props:**
{
  amount: number,          // Display amount
  onSuccess: (token: string) => void,
  onError: (error: Error) => void,
  disabled?: boolean,
  buttonText?: string
}

**Features:**
- Embedded card fields (styled to match app)
- Real-time validation (card number, expiry, CVV)
- Loading state during tokenization
- Error display for validation/API failures
- Billing address fields (if required by Helcim)

**Helcim.js Flow:**
1. User enters card details in Helcim-hosted fields
2. On submit, call helcim.getToken()
3. Helcim returns cardToken
4. Pass token to parent via onSuccess
5. Parent submits token to /api/payments

**Styling:**
- Match existing form styling (Tailwind)
- Helcim fields can be styled via CSS
- Clear error states
- Accessible labels

**Acceptance Criteria:**
- [ ] Helcim.js loads and initializes
- [ ] Card fields render correctly
- [ ] Tokenization works
- [ ] Validation errors display
- [ ] Responsive design
- [ ] Loading states

**Files:**
- components/payment/HelcimPaymentForm.tsx (NEW)
- Remove: components/payment/StripePaymentForm.tsx (if exists)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-1p1`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-67o -s in_progress

# Add a comment
bd comment Fleet-Feast-67o 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-67o -p 1

# View full details
bd show Fleet-Feast-67o
```

</details>

---

## 📋 Fleet-Feast-1y0 Write E2E tests for complete inquiry-to-payment flow

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:01 |
| **Updated** | 2025-12-20 19:01 |
| **Labels** | agent:Quinn_QA, category:enhancement, phase:4, type:post-completion |

### Description

Create end-to-end Playwright tests for the complete booking flow.

**E2E Test Scenarios:**

1. **Happy Path - Complete Flow:**
   - Customer browses trucks, selects one
   - Customer fills inquiry form, submits
   - Vendor receives inquiry, opens messages
   - Vendor creates proposal, sends
   - Customer receives notification, opens messages
   - Customer views proposal, accepts
   - Customer redirected to payment
   - Payment completes (Stripe test mode)
   - Both parties see confirmed booking

2. **Customer Declines Proposal:**
   - Flow up to proposal sent
   - Customer declines with reason
   - Booking status shows declined
   - Vendor sees declined in their bookings

3. **Vendor Declines Inquiry:**
   - Customer submits inquiry
   - Vendor declines inquiry
   - Customer sees declined status

4. **Proposal Expires:**
   - Vendor sends proposal
   - Simulate time passing (or set short expiry in test)
   - Customer tries to accept expired
   - Appropriate error shown

5. **Mobile Responsive:**
   - Run key flows on mobile viewport
   - Forms work correctly
   - ProposalCard readable on mobile

**Playwright Setup:**
- Use test database
- Stripe test mode keys
- Create fixtures for test users

**Acceptance Criteria:**
- [ ] All 5 scenarios pass
- [ ] Mobile tests pass
- [ ] Screenshots captured for visual verification
- [ ] Tests can run in CI pipeline

**Files:**
- e2e/inquiry-proposal-flow.spec.ts (NEW)
- e2e/fixtures/booking-fixtures.ts

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-88e`
- ⛔ **blocks**: `Fleet-Feast-l33`
- ⛔ **blocks**: `Fleet-Feast-cyi`
- ⛔ **blocks**: `Fleet-Feast-fjp`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-1y0 -s in_progress

# Add a comment
bd comment Fleet-Feast-1y0 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-1y0 -p 1

# View full details
bd show Fleet-Feast-1y0
```

</details>

---

## 📋 Fleet-Feast-4ln Write integration tests for inquiry-proposal API endpoints

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:00 |
| **Updated** | 2025-12-20 19:00 |
| **Labels** | agent:Taylor_Tester, category:enhancement, phase:4, type:post-completion |

### Description

Create integration tests for all new and modified API endpoints.

**Endpoints to Test:**

1. **POST /api/inquiries:**
   - Authenticated customer can create inquiry
   - Unauthenticated returns 401
   - Invalid vendor returns 400
   - Missing fields returns 400
   - Past date returns 400

2. **POST /api/bookings/:id/proposal:**
   - Vendor can send proposal on their inquiry
   - Non-vendor returns 403
   - Wrong vendor returns 403
   - Non-INQUIRY status returns 400
   - Proposal fields saved correctly

3. **POST /api/bookings/:id/accept:**
   - Customer can accept proposal
   - Expired proposal returns 400
   - Already accepted returns 400
   - Fee split calculated and saved

4. **POST /api/bookings/:id/decline:**
   - Customer can decline proposal
   - Vendor can decline inquiry
   - Wrong status returns 400

**Test Setup:**
- Create test fixtures for users, vendors, bookings
- Mock Stripe for payment tests
- Mock notifications

**Acceptance Criteria:**
- [ ] All endpoints have passing tests
- [ ] Auth/authz properly tested
- [ ] Error responses validated
- [ ] Database state verified

**Files:**
- __tests__/api/inquiries.test.ts
- __tests__/api/bookings-proposal.test.ts

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-db3`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-4ln -s in_progress

# Add a comment
bd comment Fleet-Feast-4ln 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-4ln -p 1

# View full details
bd show Fleet-Feast-4ln
```

</details>

---

## 📋 Fleet-Feast-db3 Write unit tests for inquiry-proposal booking service

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:00 |
| **Updated** | 2025-12-20 19:00 |
| **Labels** | agent:Taylor_Tester, category:enhancement, phase:4, type:post-completion |

### Description

Create comprehensive unit tests for new booking service functions.

**Test Coverage:**

1. **createInquiry():**
   - Creates booking with INQUIRY status
   - Validates required fields
   - Checks vendor availability
   - Creates message thread
   - Triggers notification

2. **sendProposal():**
   - Only allows INQUIRY → PROPOSAL_SENT
   - Validates vendor ownership
   - Sets proposal fields correctly
   - Calculates expiration date
   - Creates proposal message

3. **acceptProposal():**
   - Only allows PROPOSAL_SENT → ACCEPTED
   - Validates customer ownership
   - Rejects expired proposals
   - Calculates 50/50 fee split correctly
   - Triggers notification

4. **declineProposal():**
   - Handles customer decline (PROPOSAL_SENT → DECLINED)
   - Handles vendor decline (INQUIRY → DECLINED)
   - Validates ownership

5. **Fee Calculation:**
   - 5% customer fee calculated correctly
   - 5% vendor fee calculated correctly
   - Total matches expected values
   - Edge cases: rounding, minimum amounts

**Acceptance Criteria:**
- [ ] > 90% code coverage for new functions
- [ ] All happy paths tested
- [ ] Edge cases covered
- [ ] Error cases return correct status codes
- [ ] Mock dependencies properly

**Files:**
- __tests__/booking.service.test.ts (or similar)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-dpx`
- ⛔ **blocks**: `Fleet-Feast-eay`
- ⛔ **blocks**: `Fleet-Feast-9ji`
- ⛔ **blocks**: `Fleet-Feast-cuk`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-db3 -s in_progress

# Add a comment
bd comment Fleet-Feast-db3 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-db3 -p 1

# View full details
bd show Fleet-Feast-db3
```

</details>

---

## ✨ Fleet-Feast-6ea Implement proposal notification triggers and email templates

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 19:00 |
| **Updated** | 2025-12-20 19:00 |
| **Labels** | agent:Morgan_Middleware, category:enhancement, phase:3, type:post-completion |

### Description

Implement notification triggers for inquiry-proposal flow.

**Notification Triggers:**

1. **INQUIRY_RECEIVED** (to vendor)
   - Trigger: Customer submits inquiry
   - Email subject: 'New Booking Inquiry from [Customer]'
   - Content: Event details, link to respond

2. **PROPOSAL_SENT** (to customer)
   - Trigger: Vendor sends proposal
   - Email subject: '[Vendor] sent you a proposal'
   - Content: Proposal amount, link to view/accept

3. **PROPOSAL_ACCEPTED** (to vendor)
   - Trigger: Customer accepts proposal
   - Email subject: 'Great news! [Customer] accepted your proposal'
   - Content: Booking details, awaiting payment notice

4. **PROPOSAL_EXPIRING** (to customer)
   - Trigger: Cron job, 24h before expiration
   - Email subject: 'Proposal expires tomorrow'
   - Content: Quick link to accept/decline

5. **PROPOSAL_EXPIRED** (to both)
   - Trigger: Cron job or on-access check
   - Email subject: 'Proposal has expired'
   - Content: Option to request new proposal (customer) / resubmit (vendor)

**Implementation:**
- Create notification service functions
- Create email templates (HTML)
- Wire triggers in API endpoints
- Setup cron for expiration checks

**Acceptance Criteria:**
- [ ] All 5 notifications trigger correctly
- [ ] Email templates match brand design
- [ ] In-app notifications created
- [ ] Respects user notification preferences
- [ ] Cron job for expiring proposals

**Files:**
- lib/notifications.ts (or modules/notification/)
- emails/proposal-*.tsx (if using react-email)
- app/api/cron/proposal-expiry/route.ts (NEW)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-tp2`
- ⛔ **blocks**: `Fleet-Feast-dpx`
- ⛔ **blocks**: `Fleet-Feast-eay`
- ⛔ **blocks**: `Fleet-Feast-9ji`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-6ea -s in_progress

# Add a comment
bd comment Fleet-Feast-6ea 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-6ea -p 1

# View full details
bd show Fleet-Feast-6ea
```

</details>

---

## ✨ Fleet-Feast-ea8 Update booking list pages to show new inquiry/proposal statuses

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:59 |
| **Updated** | 2025-12-20 18:59 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:3, type:post-completion |

### Description

Update customer and vendor booking list pages to display new statuses.

**Pages Affected:**
- /customer/bookings (app/customer/bookings/page.tsx)
- /vendor/bookings (app/vendor/bookings/page.tsx)

**New Status Badges:**
| Status | Badge Color | Label |
|--------|-------------|-------|
| INQUIRY | blue | 'Inquiry Sent' / 'New Inquiry' |
| PROPOSAL_SENT | yellow | 'Proposal Received' / 'Proposal Sent' |
| ACCEPTED | green | 'Accepted - Pay Now' / 'Accepted' |
| PAID | green | 'Payment Complete' |
| CONFIRMED | green | 'Confirmed' |
| COMPLETED | gray | 'Completed' |
| DECLINED | red | 'Declined' |
| EXPIRED | gray | 'Expired' |
| CANCELLED | red | 'Cancelled' |

**Additional Updates:**
- Show proposal amount where applicable
- Quick action links (View Messages, Pay Now, Send Proposal)
- Filter by new statuses
- Sort: newest inquiries first for vendors

**Acceptance Criteria:**
- [ ] All new statuses render with correct badges
- [ ] Customer sees appropriate labels
- [ ] Vendor sees appropriate labels
- [ ] Quick actions work correctly
- [ ] Filtering works with new statuses

**Files:**
- app/customer/bookings/page.tsx
- app/vendor/bookings/page.tsx
- components/booking/BookingStatusBadge.tsx (if exists)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-exf`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-ea8 -s in_progress

# Add a comment
bd comment Fleet-Feast-ea8 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-ea8 -p 1

# View full details
bd show Fleet-Feast-ea8
```

</details>

---

## ✨ Fleet-Feast-b4t Create InquiryForm component replacing price calculator

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:58 |
| **Updated** | 2025-12-20 18:58 |
| **Labels** | agent:Casey_Components, category:enhancement, phase:2, type:post-completion |

### Description

Create InquiryForm component for customers to submit booking inquiries (replacing direct booking form with price calculator).

**Component:** InquiryForm

**Props:**
{
  vendor: {
    id: string,
    businessName: string,
    cuisineType: CuisineType,
    capacityMin: number,
    capacityMax: number
  },
  onSubmit: (inquiry: InquiryData) => Promise<void>,
  isLoading?: boolean
}

**Form Fields:**
- Event Date (date picker, min tomorrow)
- Event Time (time picker)
- Event Type (select: Corporate, Wedding, Birthday, etc.)
- Location (address input with autocomplete)
- Guest Count (number, within vendor capacity)
- Special Requests (textarea, optional)

**Key Changes from Current BookingForm:**
- REMOVE: Price calculator section
- REMOVE: Total amount display
- REMOVE: Payment info collection
- ADD: Clear messaging this is an inquiry, not booking
- ADD: 'Vendor will respond with a proposal' explainer

**Visual Design:**
- Clean form layout
- Vendor info header
- Clear CTA: 'Request Quote' or 'Submit Inquiry'
- Success state: 'Inquiry sent! Vendor will respond soon'

**Acceptance Criteria:**
- [ ] All fields validate correctly
- [ ] No price/payment displayed
- [ ] Clear inquiry messaging
- [ ] Responsive design
- [ ] Accessible form controls

**Files:** components/booking/InquiryForm.tsx (NEW)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-coe`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-b4t -s in_progress

# Add a comment
bd comment Fleet-Feast-b4t 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-b4t -p 1

# View full details
bd show Fleet-Feast-b4t
```

</details>

---

## ✨ Fleet-Feast-skd Create ProposalBuilder component for vendors to create proposals

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:57 |
| **Updated** | 2025-12-20 18:57 |
| **Labels** | agent:Casey_Components, category:enhancement, phase:2, type:post-completion |

### Description

Create ProposalBuilder form component for vendors to create and send proposals.

**Component:** ProposalBuilder

**Props:**
{
  inquiry: {
    eventDate: string,
    eventTime: string,
    guestCount: number,
    eventType: EventType,
    location: string,
    specialRequests?: string
  },
  vendorMenu: MenuItem[], // For price suggestions
  onSubmit: (proposal: ProposalData) => Promise<void>,
  isLoading?: boolean
}

**Features:**
- Dynamic line item builder (add/remove rows)
- Per-line: name, quantity, unit price, calculated total
- Running total with platform fee preview
- Inclusions checklist (what's included)
- Optional terms/notes field
- Expiration picker (default 7 days)
- Preview mode before sending

**Fee Preview:**
- Show: 'Customer will pay: $X'
- Show: 'You will receive: $Y'
- Show: 'Platform fee: $Z (5% each)'

**Validation:**
- At least one line item required
- Total must be > 0
- Expiration must be future date

**Acceptance Criteria:**
- [ ] Line items can be added/removed
- [ ] Totals calculate correctly
- [ ] Fee preview accurate
- [ ] Form validates before submit
- [ ] Responsive design
- [ ] Loading state during submit

**Files:** components/booking/ProposalBuilder.tsx (NEW)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-coe`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-skd -s in_progress

# Add a comment
bd comment Fleet-Feast-skd 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-skd -p 1

# View full details
bd show Fleet-Feast-skd
```

</details>

---

## ✨ Fleet-Feast-vwa Create ProposalCard component for message thread display

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | 🟢 open |
| **Created** | 2025-12-20 18:57 |
| **Updated** | 2025-12-20 18:57 |
| **Labels** | agent:Casey_Components, category:enhancement, phase:2, type:post-completion |

### Description

Create ProposalCard component to display vendor proposals in message threads.

**Component:** ProposalCard

**Props:**
{
  proposal: {
    amount: number,
    details: {
      lineItems: [{name, quantity, unitPrice, total}],
      inclusions: string[],
      terms?: string
    },
    sentAt: string,
    expiresAt: string
  },
  status: BookingStatus,
  onAccept?: () => void,  // Customer only
  onDecline?: () => void, // Customer only
  isLoading?: boolean
}

**Visual Design:**
- Distinct card style (highlighted border/background)
- Clear price display with breakdown
- Line items table
- Inclusions list
- Expiration countdown if < 48 hours
- Accept/Decline buttons (customer view)
- 'Proposal Sent' badge (vendor view)

**States:**
- pending: Show accept/decline buttons
- accepted: Show 'Accepted' badge, payment link
- declined: Show 'Declined' badge
- expired: Show 'Expired' badge

**Acceptance Criteria:**
- [ ] Renders proposal details clearly
- [ ] Accept/Decline buttons work
- [ ] Expiration timer displays correctly
- [ ] Responsive on mobile
- [ ] Accessible (ARIA labels, keyboard nav)

**Files:** components/booking/ProposalCard.tsx (NEW)

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-coe`

<details>
<summary>📋 Commands</summary>

```bash
# Start working on this issue
bd update Fleet-Feast-vwa -s in_progress

# Add a comment
bd comment Fleet-Feast-vwa 'Your comment here'

# Change priority (0=Critical, 1=High, 2=Medium, 3=Low)
bd update Fleet-Feast-vwa -p 1

# View full details
bd show Fleet-Feast-vwa
```

</details>

---

## 🐛 Fleet-Feast-0fi Vendor Bookings page (/vendor/bookings) missing sidebar navigation - user stuck

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 17:49 |
| **Updated** | 2025-12-09 01:27 |
| **Closed** | 2025-12-09 01:27 |
| **Labels** | agent:Parker_Pages, category:bugfix, phase:4, type:post-completion |

### Description

**CRITICAL BUG**: Vendor Bookings page has NO navigation - user is completely stuck with no way to navigate except browser back button.

**URL:** /vendor/bookings

**Current State:**
- Page attempts to render but has runtime error (bookings.filter is not a function)
- Even without error, page has no sidebar, no header, no breadcrumbs
- User cannot navigate away without using browser back button

**Expected State:**
- Should have same DashboardLayout as /vendor/dashboard with sidebar navigation
- Also needs fix for bookings.filter error (separate issue but related)

**Root Cause:**
The /vendor/bookings page is NOT using the VendorDashboardLayout wrapper. The vendor dashboard at /vendor/dashboard uses a layout, but /vendor/bookings is at a different route level.

**Fix Options:**
1. Move bookings page to /vendor/dashboard/bookings route (inherits layout)
2. Wrap /vendor/bookings page with VendorDashboardLayout component explicitly
3. Create a shared layout.tsx for all /vendor/* routes

**Screenshot:** .playwright-mcp/vendor-bookings-no-nav.png

**Acceptance Criteria:**
- [ ] /vendor/bookings page has sidebar navigation visible
- [ ] User can navigate to other vendor pages from Bookings
- [ ] Mobile view has proper bottom nav and hamburger menu
- [ ] Runtime error fixed separately

---

## 🐛 Fleet-Feast-w98 Vendor Messages page (/vendor/messages) missing sidebar navigation - user stuck

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 17:49 |
| **Updated** | 2025-12-09 01:27 |
| **Closed** | 2025-12-09 01:27 |
| **Labels** | agent:Parker_Pages, category:bugfix, phase:4, type:post-completion |

### Description

**CRITICAL BUG**: Vendor Messages page has NO navigation - user is completely stuck with no way to navigate except browser back button.

**URL:** /vendor/messages

**Current State:**
- Page attempts to render but has runtime error (avatarUrl undefined)
- Even without error, page has no sidebar, no header, no breadcrumbs
- User cannot navigate away without using browser back button

**Expected State:**
- Should have same DashboardLayout as /vendor/dashboard with sidebar navigation
- Also needs fix for avatarUrl error (separate issue but related)

**Root Cause:**
The /vendor/messages page is NOT using the VendorDashboardLayout wrapper. The vendor dashboard at /vendor/dashboard uses a layout, but /vendor/messages is at a different route level.

**Fix Options:**
1. Move messages page to /vendor/dashboard/messages route (inherits layout)
2. Wrap /vendor/messages page with VendorDashboardLayout component explicitly
3. Create a shared layout.tsx for all /vendor/* routes

**Screenshot:** .playwright-mcp/vendor-messages-no-nav.png

**Acceptance Criteria:**
- [ ] /vendor/messages page has sidebar navigation visible
- [ ] User can navigate to other vendor pages from Messages
- [ ] Mobile view has proper bottom nav and hamburger menu
- [ ] Runtime error fixed separately

---

## 🐛 Fleet-Feast-bxz Customer Bookings page (/customer/bookings) missing sidebar navigation - user stuck

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 17:49 |
| **Updated** | 2025-12-09 01:27 |
| **Closed** | 2025-12-09 01:27 |
| **Labels** | agent:Parker_Pages, category:bugfix, phase:4, type:post-completion |

### Description

**CRITICAL BUG**: Customer Bookings page has NO navigation - user is completely stuck with no way to navigate except browser back button.

**URL:** /customer/bookings

**Current State:**
- Page renders only the content (My Bookings heading, search bar, empty state)
- No sidebar, no header, no breadcrumbs, no mobile nav
- User cannot navigate away without using browser back button

**Expected State:**
- Should have same DashboardLayout as /customer/dashboard with sidebar navigation

**Root Cause:**
Same as Fleet-Feast-822 - the /customer/bookings page is NOT using the DashboardLayout wrapper. Pages under /customer/dashboard/* inherit the layout, but /customer/bookings is at a different route level.

**Fix Options:**
1. Move bookings page to /customer/dashboard/bookings route (preferred - inherits layout)
2. Wrap /customer/bookings page with DashboardLayout component explicitly
3. Create a shared layout.tsx for all /customer/* routes

**Screenshot:** .playwright-mcp/customer-bookings-no-nav.png

**Acceptance Criteria:**
- [ ] /customer/bookings page has sidebar navigation visible
- [ ] User can navigate to other customer pages from Bookings
- [ ] Mobile view has proper bottom nav and hamburger menu

---

## 🐛 Fleet-Feast-822 Customer Messages page (/customer/messages) missing sidebar navigation - user stuck

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 17:48 |
| **Updated** | 2025-12-09 01:27 |
| **Closed** | 2025-12-09 01:27 |
| **Labels** | agent:Parker_Pages, category:bugfix, phase:4, type:post-completion |

### Description

**CRITICAL BUG**: Customer Messages page has NO navigation - user is completely stuck with no way to navigate except browser back button.

**URL:** /customer/messages

**Current State:**
- Page renders only the content (heading + empty state message)
- No sidebar, no header, no breadcrumbs, no mobile nav
- User cannot navigate away without using browser back button

**Expected State:**
- Should have same DashboardLayout as /customer/dashboard with sidebar navigation

**Root Cause:**
The /customer/messages page is NOT using the DashboardLayout wrapper that /customer/dashboard uses. Pages under /customer/dashboard/* inherit the layout, but /customer/messages is at a different route level.

**Fix Options:**
1. Move messages page to /customer/dashboard/messages route (preferred - inherits layout)
2. Wrap /customer/messages page with DashboardLayout component explicitly
3. Create a shared layout.tsx for all /customer/* routes

**Screenshot:** .playwright-mcp/customer-messages-no-nav.png

**Acceptance Criteria:**
- [ ] /customer/messages page has sidebar navigation visible
- [ ] User can navigate to other customer pages from Messages
- [ ] Mobile view has proper bottom nav and hamburger menu

---

## 🐛 Fleet-Feast-tet Mobile bottom nav Messages link goes to /dashboard/messages (404) instead of role-specific path

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 17:48 |
| **Updated** | 2025-12-09 01:27 |
| **Closed** | 2025-12-09 01:27 |
| **Labels** | agent:Casey_Components, category:bugfix, phase:4, type:post-completion |

### Description

**CRITICAL BUG**: Mobile bottom navigation Messages link goes to wrong URL.

**Affected Roles:**
- Admin mobile: Messages → /dashboard/messages → 404 (admins don't have messages page)
- Customer mobile: Messages → /dashboard/messages → 404 (should be /customer/messages)

**Root Cause:**
The MobileBottomNav component uses a hardcoded /dashboard/messages path instead of role-specific paths.

**Fix Required:**
1. For Admin: Either remove Messages from bottom nav OR create /admin/messages if needed
2. For Customer: Change to /customer/messages
3. For Vendor: Already correct at /vendor/messages

**Files:**
- components/navigation/MobileBottomNav.tsx (or similar)

**Screenshot:** .playwright-mcp/admin-desktop-nav.png shows admin has no messages in sidebar

**Acceptance Criteria:**
- [ ] Admin mobile nav either has no Messages link or links to valid page
- [ ] Customer mobile Messages link goes to /customer/messages
- [ ] No 404 errors when clicking Messages on mobile

---

## 🐛 Fleet-Feast-dsr Fix Dropdown being clipped inside MobileDrawer - overflow issue

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 00:47 |
| **Updated** | 2025-12-08 00:51 |
| **Closed** | 2025-12-08 00:51 |
| **Labels** | agent:Casey_Components, category:bugfix, phase:4, status:in-progress, type:post-completion |

### Description

**CRITICAL BUG**: User profile dropdown in mobile menu is clipped/hidden by MobileDrawer overflow.

**Problem**: When clicking user avatar in mobile drawer, the dropdown submenu opens but is constrained to the drawer's content area due to overflow-y-auto clipping.

**Root Cause**:
- MobileDrawer.tsx:131 has overflow-y-auto on content div
- Dropdown.tsx:155 uses absolute positioning with z-50
- Absolute elements are clipped by overflow:auto/hidden on ancestors

**Fix Options**:
1. BEST: Add Portal support to Dropdown component (render at body level like MobileDrawer)
2. ALT: Change overflow handling on mobile drawer
3. ALT: Use different UI pattern for mobile (inline expand instead of dropdown)

**Files**:
- components/ui/Dropdown.tsx

**Acceptance Criteria**:
- [ ] Dropdown menu appears fully visible when opened inside MobileDrawer
- [ ] Dropdown still works correctly in desktop header
- [ ] Proper positioning maintained

---

## 🐛 Fleet-Feast-p9n Fix MobileDrawer z-index - menu appears under HeroSection instead of on top

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 00:38 |
| **Updated** | 2025-12-08 00:45 |
| **Closed** | 2025-12-08 00:45 |
| **Labels** | agent:Casey_Components, category:bugfix, phase:4, status:in-progress, type:post-completion |

### Description

**CRITICAL BUG**: Mobile navigation drawer appears UNDER the HeroSection instead of on top of all content.

**Expected Behavior:**
- Mobile drawer should appear on TOP of all page content (including hero image)

**Actual Behavior:**
- Mobile drawer loads/appears under the hero section

**Likely Root Cause:**
Stacking context issue. The MobileDrawer uses `fixed` positioning with z-50, but:
- Header.tsx:58 has `sticky top-0 z-30` 
- MobileDrawer.tsx:80 overlay has `z-40`
- MobileDrawer.tsx:89 drawer has `z-50`
- HeroSection.tsx:34 has `relative` with content at `z-10`

The `sticky` positioning on Header may create a stacking context that limits the effective z-index of the MobileDrawer (even though it's `fixed`).

**Potential Fixes:**
1. Move MobileDrawer portal to render outside Header's DOM tree (via Portal/createPortal)
2. Increase z-index values significantly (z-[9999])
3. Ensure no parent elements create unwanted stacking contexts

**Files:**
- components/layout/Header.tsx
- components/navigation/MobileDrawer.tsx

**Acceptance Criteria:**
- [ ] MobileDrawer overlay covers entire viewport including HeroSection
- [ ] MobileDrawer drawer panel appears on top of ALL content
- [ ] Works consistently on mobile devices
- [ ] No visual glitches during open/close animation

---

## 🐛 Fleet-Feast-ded Fix MobileDrawer opening from wrong side - should open from RIGHT to match hamburger button position

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 00:37 |
| **Updated** | 2025-12-08 00:45 |
| **Closed** | 2025-12-08 00:45 |
| **Labels** | agent:Casey_Components, category:bugfix, phase:4, status:in-progress, type:post-completion |

### Description

**CRITICAL BUG**: Hamburger menu button is on the RIGHT side of header, but MobileDrawer slides in from the LEFT. This is poor UX - users expect the menu to appear where they clicked.

**Root Cause:**
- Header.tsx:118-139 - Hamburger button positioned on RIGHT (after desktop nav/user menu)
- MobileDrawer.tsx:89 - Drawer uses `left-0` and `-translate-x-full` (slides from LEFT)

**Fix Required:**
In MobileDrawer.tsx:
1. Change `left-0` to `right-0` (line 89)
2. Change `-translate-x-full` to `translate-x-full` (line 91) 
3. Change `border-r-3` to `border-l-3` (line 89)

**Files:**
- components/navigation/MobileDrawer.tsx

**Acceptance Criteria:**
- [ ] MobileDrawer slides in from RIGHT side
- [ ] Close button remains functional
- [ ] Drawer content displays correctly
- [ ] Overlay still covers full screen
- [ ] ESC key still closes drawer

---

## 🐛 Fleet-Feast-z9k Auth redirect loop - middleware getToken() fails to read valid session

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 22:57 |
| **Updated** | 2025-12-07 23:10 |
| **Closed** | 2025-12-07 23:10 |
| **Labels** | agent:Blake_Backend, category:bugfix, phase:4 |

### Description

CRITICAL BUG: Session exists but middleware redirects to login.

**Reproduction:**
1. Navigate to /login
2. Enter valid credentials (e.g., john.doe@example.com / Customer123!)
3. Click Sign in
4. Observe redirect back to /login instead of /customer/dashboard

**Evidence:**
- POST /api/auth/callback/credentials returns 200 OK
- GET /api/auth/session returns valid user: {name, email, id, role}
- But GET /customer/dashboard returns 307 redirect to /login

**Root Cause Analysis:**
- LoginClient.tsx uses signIn() from next-auth/react (line 57)
- Login succeeds and session is created
- middleware.ts uses getToken() from next-auth/jwt (line 10)
- getToken() is NOT finding the JWT token even though session exists
- Possible causes:
  1. Cookie name mismatch between NextAuth v5 config and middleware
  2. NEXTAUTH_SECRET not matching between middleware and auth handler
  3. NextAuth v5 stores session differently than getToken() expects

**Affected Accounts:**
- ALL roles affected: Admin, Vendor, Customer
- No protected pages accessible despite valid login

**Files:**
- middleware.ts:10 - getToken() call
- lib/auth.ts - NextAuth v5 config with custom cookie name
- app/(auth)/login/LoginClient.tsx - signIn flow

**Screenshot:** .playwright-mcp/auth-redirect-loop-issue.png

---

## 🐛 Fleet-Feast-bz5 Fix /api/trucks endpoint returning HTML instead of JSON

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 21:44 |
| **Updated** | 2025-12-07 22:39 |
| **Closed** | 2025-12-07 22:39 |
| **Labels** | agent:Ellis_Endpoints, category:bugfix, phase:4 |

### Description

The trucks API endpoint is returning HTML (likely a 404 page) instead of JSON data. Error: 'Unexpected token <, <\!DOCTYPE... is not valid JSON'. This breaks the search functionality completely - shows 0 results.

---

## 🐛 Fleet-Feast-rfr Fix Rating.tsx hydration error - button nested inside button

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 21:44 |
| **Updated** | 2025-12-07 22:42 |
| **Closed** | 2025-12-07 22:42 |
| **Labels** | agent:Casey_Components, category:bugfix, phase:4 |

### Description

The Rating component at components/ui/Rating.tsx:33 has a button nested inside another button, causing React hydration errors. This violates HTML spec and breaks the search page.

---

## ✨ Fleet-Feast-daa Restyle Layout Components (Header, Footer, Sidebar, Navigation)

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:00 |
| **Updated** | 2025-12-07 19:47 |
| **Closed** | 2025-12-07 19:47 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to layout components. Bold navigation, glass header/footer, chunky sidebar. Files: components/layout/Header.tsx, Footer.tsx, Sidebar.tsx, MainLayout.tsx, DashboardLayout.tsx, AdminLayout.tsx, AuthLayout.tsx, MobileNav.tsx, Breadcrumbs.tsx, components/navigation/NavLink.tsx, UserMenu.tsx, MobileDrawer.tsx, NavMenu.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-wo2`

---

## ✨ Fleet-Feast-hv0 Restyle Core UI Components (Button, Input, Card, Modal, Badge)

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:00 |
| **Updated** | 2025-12-07 19:47 |
| **Closed** | 2025-12-07 19:47 |
| **Labels** | agent:Casey_Components, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism style to all core UI components. Bold 3-4px borders, harsh shadows, glass effects on cards/modals. Files: components/ui/Button.tsx, Input.tsx, Card.tsx, Modal.tsx, Badge.tsx, Alert.tsx, Spinner.tsx, Avatar.tsx, Rating.tsx, Textarea.tsx, Tooltip.tsx, Dropdown.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-wo2`

---

## ✨ Fleet-Feast-wo2 Design System: Neo-Brutalist Glassmorphism Foundation

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:00 |
| **Updated** | 2025-12-07 19:40 |
| **Closed** | 2025-12-07 19:40 |
| **Labels** | agent:Sam_Styler, category:enhancement, phase:1, status:in-progress, type:post-completion |

### Description

Create foundational design system for pure red/white neo-brutalist glassmorphism style. Update globals.css with new design tokens (pure red/white colors, 3-4px bold borders, harsh offset shadows, subtle glass effects). Update tailwind.config.js with custom utilities. Files: app/globals.css, tailwind.config.js

---

## 🐛 Fleet-Feast-5oq HOTFIX: Rate limit middleware breaks auth session endpoint

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-05 12:37 |
| **Updated** | 2025-12-05 12:50 |
| **Closed** | 2025-12-05 12:50 |
| **Labels** | phase:hotfix, severity:blocker, status:in-progress, type:bug |

### Description

## Problem
Rate limit middleware throws 'handler is not a function' error on /api/auth/session endpoint.

## Error
TypeError: handler is not a function
at eval (lib/middleware/rate-limit.ts:150:36)

## Impact
- All /api/auth/session calls return 500
- Authentication broken
- Users cannot login or maintain sessions

## Root Cause
Rate limit middleware wrapper not passing handler function correctly.

## Agent: Blake_Backend
## Priority: CRITICAL - Blocks all auth

---

## 📋 Fleet-Feast-9iz Re-validate production readiness after blocker fixes

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-05 12:16 |
| **Updated** | 2025-12-05 12:36 |
| **Closed** | 2025-12-05 12:36 |
| **Labels** | phase:launch-fix, status:in-progress, validation |

### Description

## Objective
After route conflicts and Jest issues are fixed, re-run validation:

## Tasks
1. Verify production build succeeds (npm run build)
2. Run full integration test suite
3. Execute E2E tests with Playwright
4. Verify CI/CD pipeline is green
5. Smoke test critical user flows

## Dependencies
- Fleet-Feast-pe7 (route conflicts)
- Fleet-Feast-2c9 (Jest config)

## Acceptance Criteria
- Production build succeeds
- All tests passing (unit + integration + E2E)
- CI/CD pipeline green
- Launch approval granted

## Agent: Quinn_QA
## Estimated: 3 hours

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-pe7`
- ⛔ **blocks**: `Fleet-Feast-2c9`

---

## 🐛 Fleet-Feast-2c9 BLOCKER: Fix Jest configuration for Next.js 14 integration tests

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-05 12:16 |
| **Updated** | 2025-12-05 12:28 |
| **Closed** | 2025-12-05 12:28 |
| **Labels** | phase:launch-fix, severity:blocker, status:in-progress, type:bug |

### Description

## Problem
Integration tests fail with Jest configuration incompatible with Next.js 14.

## Errors
1. ReferenceError: Request is not defined
2. Jest encountered an unexpected token (NextAuth export error)

## Root Cause
- Next.js server components not properly mocked in Jest
- ESM module compatibility issues with NextAuth

## Solution
Update jest.config.js:
- Add proper testEnvironment
- Mock Next.js Request/Response objects
- Configure transformIgnorePatterns for NextAuth

## Acceptance Criteria
- All integration tests pass
- CI/CD pipeline test job succeeds
- No Request/Response reference errors

## Agent: Taylor_Tester
## Estimated: 2 hours

---

## 🐛 Fleet-Feast-pe7 BLOCKER: Fix route group conflicts preventing production build

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-05 12:15 |
| **Updated** | 2025-12-05 12:28 |
| **Closed** | 2025-12-05 12:28 |
| **Labels** | phase:launch-fix, severity:blocker, status:in-progress, type:bug |

### Description

## Problem
Next.js route group conflicts prevent production build. Multiple route groups map to identical URL paths.

## Error
Cannot have two parallel pages that resolve to the same path:
- /(admin)/analytics/page vs /(vendor)/analytics/page
- /(admin)/dashboard/page vs /(customer)/dashboard/page
- /(customer)/bookings/page vs /(vendor)/bookings/page

## Solution
Restructure route groups to use role-specific paths or middleware-based routing.

## Acceptance Criteria
- Production build succeeds (npm run build)
- All dashboard routes accessible by correct roles
- CI/CD pipeline passes build step

## Agent: Blake_Backend
## Estimated: 4 hours

---

## 📋 Fleet-Feast-me3 CRITICAL: Dynamic route conflict prevents server startup

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-05 04:57 |
| **Updated** | 2025-12-05 05:28 |
| **Closed** | 2025-12-05 05:28 |
| **Labels** | severity:blocker, type:bug |

### Description

Routes /api/quotes/[id]/accept and /api/quotes/[requestId]/submit use different parameter names at same hierarchy level, causing Next.js error: 'You cannot use different slug names for the same dynamic path'. Server cannot start until resolved.

---

## 🏔️ Fleet-Feast-eh7 Phase A: Foundation

| Property | Value |
|----------|-------|
| **Type** | 🏔️ epic |
| **Priority** | 🔥 Critical (P0) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:50 |
| **Updated** | 2025-12-05 05:39 |
| **Closed** | 2025-12-05 05:39 |

---

## 🐛 Fleet-Feast-uhr Fix sticky booking card getting cut off by header

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-16 20:10 |
| **Updated** | 2025-12-16 20:54 |
| **Closed** | 2025-12-16 20:54 |
| **Labels** | category:bugfix, phase:4, type:post-completion |

### Description

On the food truck detail page, the sticky booking card (desktop sidebar) gets cut off by the fixed header when scrolling.

## Root Cause
- Header is h-16 (64px) with sticky top-0
- Booking card has sticky top-4 (16px)
- When scrolling, card slides under the header

## Files to Fix
- app/(public)/trucks/[id]/page.tsx (lines 141, 196)

## Current (broken)
- Desktop: sticky top-4 (line 196)
- Mobile: sticky top-4 (line 141)

## Should be
- sticky top-20 (80px) or top-[72px] to account for header height + padding

## Acceptance Criteria
- [ ] Sticky booking card stays visible below header when scrolling
- [ ] Card does not overlap with or get cut off by header
- [ ] Works correctly on both desktop sidebar and mobile sticky CTA

---

## 🐛 Fleet-Feast-ztv Fix 404 error on Book This Truck button and calendar date clicks

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-16 20:10 |
| **Updated** | 2025-12-16 20:54 |
| **Closed** | 2025-12-16 20:54 |
| **Labels** | category:bugfix, phase:4, type:post-completion |

### Description

The Book This Truck button and calendar date clicks route to /booking but the actual booking page is at /customer/booking. This causes 404 errors.

## Files to Fix
- app/(public)/trucks/[id]/page.tsx (lines 142, 205)
- app/(public)/trucks/[id]/components/AvailabilityCalendar.tsx (line 134)

## Current (broken)
- /booking?vendorId=${id}
- /booking?vendorId=${vendorId}&date=${dateStr}

## Should be
- /customer/booking?vendorId=${id}
- /customer/booking?vendorId=${vendorId}&date=${dateStr}

## Acceptance Criteria
- [ ] Book This Truck button navigates to correct booking page
- [ ] Calendar date clicks navigate to correct booking page with date prefilled
- [ ] No 404 errors when clicking booking-related links

---

## 📋 Fleet-Feast-76i Update trucks service to include coverImageUrl in responses

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-16 12:16 |
| **Updated** | 2025-12-16 13:31 |
| **Closed** | 2025-12-16 13:31 |
| **Labels** | agent:Blake_Backend, category:enhancement, phase:2, type:post-completion |

### Description

Update modules/trucks/trucks.service.ts and trucks.types.ts to include coverImageUrl in TruckSearchResult and TruckProfileWithDetails types. Ensure searchTrucks and getTruckProfile return coverImageUrl field.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-3lk`

---

## 📋 Fleet-Feast-dhq Update FeaturedTrucks to fetch real vendors from API

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-16 12:15 |
| **Updated** | 2025-12-16 13:42 |
| **Closed** | 2025-12-16 13:42 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, type:post-completion |

### Description

Modify FeaturedTrucks.tsx to fetch 5 featured vendors from /api/trucks API instead of using hardcoded mock data. Use server-side data fetching or client-side SWR/fetch. Ensure truck IDs link correctly to truck detail pages. Display coverImageUrl from API response.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-0pq`
- ⛔ **blocks**: `Fleet-Feast-76i`

---

## 📋 Fleet-Feast-0pq Update seed data with coverImageUrl for 5 featured vendors

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-16 12:15 |
| **Updated** | 2025-12-16 13:35 |
| **Closed** | 2025-12-16 13:35 |
| **Labels** | agent:Dana_Database, category:enhancement, phase:2, type:post-completion |

### Description

Update prisma/seed.ts to set coverImageUrl for the first 5 approved vendors (Tacos Loco, BBQ Masters, Asian Fusion Express, Italian Delight, Seafood Shack). Use the generated image paths from public/images/generated/. Re-run seed: npx prisma db seed.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-3lk`
- ⛔ **blocks**: `Fleet-Feast-sh6`

---

## 📋 Fleet-Feast-sh6 Generate AI images for 5 featured food trucks

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-16 12:15 |
| **Updated** | 2025-12-16 13:31 |
| **Closed** | 2025-12-16 13:31 |
| **Labels** | agent:Casey_Components, category:enhancement, phase:2, type:post-completion |

### Description

Generate 10 AI images using fal.ai nano-banana-pro model: 5 food truck exterior images and 5 signature food dish images. Save to public/images/generated/ as webp files. Trucks: Mexican tacos, BBQ/smokehouse, Asian fusion, Italian pizza, and Seafood/lobster rolls.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-3lk`

---

## 📋 Fleet-Feast-3lk Add coverImageUrl field to Vendor model

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-16 12:15 |
| **Updated** | 2025-12-16 13:21 |
| **Closed** | 2025-12-16 13:21 |
| **Labels** | agent:Dana_Database, category:enhancement, phase:2, type:post-completion |

### Description

Add a coverImageUrl field (nullable String) to the Vendor model in schema.prisma to store AI-generated food truck cover images. Run prisma migrate dev. Field maps to cover_image_url in database.

---

## 📋 Fleet-Feast-dtb Homepage images don't load unless user is logged in

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-15 08:32 |
| **Updated** | 2025-12-15 08:57 |
| **Closed** | 2025-12-15 08:57 |
| **Labels** | agent:Blake_Backend, category:bugfix, status:in-progress, type:post-completion |

### Description

Homepage images (food truck photos, hero image) don't load for unauthenticated users. Images only appear after logging in. This is likely an auth middleware issue blocking public image assets or API endpoints.

---

## 📋 Fleet-Feast-4pk Missing /unauthorized page shows 404 instead of proper error message

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-15 08:26 |
| **Updated** | 2025-12-15 08:57 |
| **Closed** | 2025-12-15 08:57 |
| **Labels** | agent:Parker_Pages, category:bugfix, status:in-progress, type:post-completion |

### Description

When non-authorized users access protected routes like /admin, they get redirected to /unauthorized which returns a 404 page instead of a proper unauthorized message. Need to create an /unauthorized page.

---

## 🐛 Fleet-Feast-9pf Vendor messages page throws 'Cannot read properties of undefined (reading avatarUrl)'

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 17:50 |
| **Updated** | 2025-12-09 01:27 |
| **Closed** | 2025-12-09 01:27 |
| **Labels** | agent:Casey_Components, category:bugfix, phase:4, type:post-completion |

### Description

**BUG**: Vendor messages page throws runtime error when loading conversations.

**Error:** TypeError: Cannot read properties of undefined (reading 'avatarUrl')

**Location:** components/messages/ConversationCard.tsx:98

**Code:**
```tsx
<Avatar
  src={otherParty.avatarUrl}  // otherParty is undefined
  name={otherParty.name}
  size="md"
/>
```

**Root Cause:**
The ConversationCard component receives conversation data where otherParty is undefined. This happens when:
1. The conversation data doesn't include otherParty info
2. The API doesn't properly populate the other party's details

**Fix:**
1. Add null check: src={otherParty?.avatarUrl}
2. Ensure API populates otherParty data for conversations
3. Add fallback for missing avatar

**Acceptance Criteria:**
- [ ] Vendor messages page loads without error
- [ ] Conversations display properly with avatars
- [ ] Fallback shown if avatar is missing

---

## 🐛 Fleet-Feast-679 Vendor dashboard shows 'bookings.filter is not a function' error

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-08 17:50 |
| **Updated** | 2025-12-09 01:28 |
| **Closed** | 2025-12-09 01:28 |
| **Labels** | agent:Blake_Backend, category:bugfix, phase:4, type:post-completion |

### Description

**BUG**: Vendor dashboard and bookings page throw runtime error.

**Error:** TypeError: bookings.filter is not a function

**Location:** 
- app/vendor/dashboard (shows error alert)
- app/vendor/bookings/page.tsx:158

**Root Cause:**
The bookings data is not being returned as an array from the API or is undefined.

**Fix:**
1. Check API response for /api/vendor/bookings endpoint
2. Ensure bookings defaults to empty array [] if undefined
3. Add defensive check: const safeBookings = Array.isArray(bookings) ? bookings : []

**Acceptance Criteria:**
- [ ] Vendor dashboard loads without error
- [ ] Vendor bookings page loads without error
- [ ] Empty state shown when no bookings exist

---

## 🐛 Fleet-Feast-wuc Search page shows 0 results but API returns 8 trucks

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 22:59 |
| **Updated** | 2025-12-07 23:10 |
| **Closed** | 2025-12-07 23:10 |
| **Labels** | agent:Parker_Pages, category:bugfix, phase:4 |

### Description

The search page UI shows 'Found 0 food trucks' and 'No Results Found' but the API /api/trucks returns 8 valid trucks.

**Evidence:**
- GET /api/trucks returns: {data: [8 trucks], meta: {total: 8}}
- UI displays: 'Found 0 food trucks' and 'No Results Found'

**Screenshot:** .playwright-mcp/search-shows-zero-but-api-has-8.png

**Possible Causes:**
1. React state not updating after API fetch
2. Data transformation issue between API response and component state
3. Server-side rendering mismatch with client hydration
4. Filter state initialized incorrectly, filtering out all results

**Files to Investigate:**
- app/(public)/search/page.tsx
- app/(public)/search/SearchClient.tsx (if exists)
- lib/store/ - search-related stores

**API Response Sample:**
Trucks include: Artisan Coffee Cart, Asian Fusion Express, Dessert Dreams, Tacos Loco NYC, Vegan Vibes, BBQ Masters, Seafood Shack, Italian Delight Truck

---

## 🐛 Fleet-Feast-n5o C:/Program Files/Git/vendor/apply should be public but redirects to login

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 22:58 |
| **Updated** | 2025-12-07 23:10 |
| **Closed** | 2025-12-07 23:10 |
| **Labels** | agent:Blake_Backend, category:bugfix, phase:4 |

### Description

The /vendor/apply page should be public (for new vendors to sign up) but it redirects to /login.

**Issue:**
The middleware.ts protects ALL /vendor/* routes:
```javascript
if (pathname.startsWith('/vendor') && role !== 'VENDOR') {
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}
```

But /vendor/apply is the vendor application/signup page and should be accessible to unauthenticated users.

**Expected Behavior:**
- /vendor/apply should be accessible without login
- /vendor/dashboard, /vendor/bookings, etc. should require VENDOR role

**Fix Required:**
Add /vendor/apply to public routes in middleware.ts:
```javascript
const publicRoutes = ['/', '/search', '/vendors', '/about', '/contact', '/vendor/apply'];
```

Or add exception before the vendor route check:
```javascript
if (pathname === '/vendor/apply') {
  return NextResponse.next();
}
```

**Files:**
- middleware.ts:55-63

---

## 🐛 Fleet-Feast-dbr Fix mobile navigation menu not opening

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 21:45 |
| **Updated** | 2025-12-07 22:39 |
| **Closed** | 2025-12-07 22:39 |
| **Labels** | agent:Casey_Components, category:bugfix, phase:4 |

### Description

On mobile viewport (375px width), clicking the hamburger menu button does not open the navigation menu. The button shows 'active' state but no navigation links appear. Mobile users cannot navigate the site.

---

## 🐛 Fleet-Feast-6sb Make food truck profiles publicly accessible

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 21:45 |
| **Updated** | 2025-12-07 22:39 |
| **Closed** | 2025-12-07 22:39 |
| **Labels** | agent:Morgan_Middleware, category:bugfix, phase:4 |

### Description

The /trucks/[id] routes redirect to login, but per PRD requirement F4, food truck profiles should be publicly viewable without authentication. Need to update middleware to allow public access to truck profile pages.

---

## 📋 Fleet-Feast-8wp Accessibility Audit for New Design System

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:03 |
| **Updated** | 2025-12-07 20:17 |
| **Closed** | 2025-12-07 20:17 |
| **Labels** | agent:Avery_Audit, category:enhancement, phase:3, status:in-progress, type:post-completion |

### Description

Verify WCAG AA compliance for neo-brutalist glassmorphism design. Check color contrast (red on white), ensure glass effects don't reduce readability, verify focus states are visible with bold borders, test screen reader compatibility.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-d59`
- ⛔ **blocks**: `Fleet-Feast-cc2`
- ⛔ **blocks**: `Fleet-Feast-jma`
- ⛔ **blocks**: `Fleet-Feast-8gg`
- ⛔ **blocks**: `Fleet-Feast-0qv`
- ⛔ **blocks**: `Fleet-Feast-6of`
- ⛔ **blocks**: `Fleet-Feast-526`
- ⛔ **blocks**: `Fleet-Feast-4ce`
- ⛔ **blocks**: `Fleet-Feast-not`
- ⛔ **blocks**: `Fleet-Feast-eeu`

---

## 📋 Fleet-Feast-vr7 Responsive Testing & Mobile Optimization

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:03 |
| **Updated** | 2025-12-07 20:17 |
| **Closed** | 2025-12-07 20:17 |
| **Labels** | agent:Quinn_QA, category:enhancement, phase:3, status:in-progress, type:post-completion |

### Description

Test neo-brutalist glassmorphism design across all breakpoints. Verify glass effects work on mobile, ensure touch targets are adequate with chunky buttons, test bold borders at small sizes. Use Playwright MCP for visual regression testing.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-d59`
- ⛔ **blocks**: `Fleet-Feast-cc2`
- ⛔ **blocks**: `Fleet-Feast-jma`
- ⛔ **blocks**: `Fleet-Feast-8gg`
- ⛔ **blocks**: `Fleet-Feast-0qv`
- ⛔ **blocks**: `Fleet-Feast-6of`
- ⛔ **blocks**: `Fleet-Feast-526`
- ⛔ **blocks**: `Fleet-Feast-4ce`
- ⛔ **blocks**: `Fleet-Feast-not`
- ⛔ **blocks**: `Fleet-Feast-eeu`

---

## ✨ Fleet-Feast-eeu Restyle Static Pages (About, Contact, FAQ)

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:02 |
| **Updated** | 2025-12-07 20:01 |
| **Closed** | 2025-12-07 20:01 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to informational pages. Bold section headers, glass content cards, chunky FAQ accordion. Files: app/(public)/about/page.tsx, AboutClient.tsx, app/(public)/contact/page.tsx, layout.tsx, app/(public)/faq/page.tsx, layout.tsx, app/(public)/components/FAQAccordion.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## ✨ Fleet-Feast-not Restyle Messaging System

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:02 |
| **Updated** | 2025-12-07 19:59 |
| **Closed** | 2025-12-07 19:59 |
| **Labels** | agent:Casey_Components, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to messaging interface. Bold message bubbles, glass conversation cards, chunky composer. Files: app/customer/messages/page.tsx, [bookingId]/page.tsx, app/vendor/messages/page.tsx, [bookingId]/page.tsx, components/messages/MessageBubble.tsx, MessageThread.tsx, MessageComposer.tsx, ConversationCard.tsx, FlaggedWarning.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## ✨ Fleet-Feast-4ce Restyle Admin Dashboard & Management Pages

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:02 |
| **Updated** | 2025-12-07 20:01 |
| **Closed** | 2025-12-07 20:01 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to admin area. Bold data tables, glass stat cards, chunky action buttons. Files: app/admin/layout.tsx, dashboard/page.tsx, analytics/page.tsx, users/page.tsx, users/[id]/page.tsx, vendors/page.tsx, vendors/[id]/page.tsx, disputes/page.tsx, disputes/[id]/page.tsx, violations/page.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## ✨ Fleet-Feast-526 Restyle Vendor Application Flow

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:02 |
| **Updated** | 2025-12-07 20:03 |
| **Closed** | 2025-12-07 20:03 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to vendor onboarding. Bold step indicators, glass form sections, chunky file uploads. Files: app/vendor/apply/layout.tsx, page.tsx, success/page.tsx, components/ApplicationForm.tsx, ProgressIndicator.tsx, Step1BusinessInfo.tsx, Step2Documents.tsx, Step3Menu.tsx, Step4Availability.tsx, Step5Preview.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## ✨ Fleet-Feast-6of Restyle Vendor Dashboard & Management Pages

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:02 |
| **Updated** | 2025-12-07 20:02 |
| **Closed** | 2025-12-07 20:02 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to vendor area. Bold analytics cards, glass calendar, chunky booking management. Files: app/vendor/dashboard/layout.tsx, page.tsx, app/vendor/bookings/page.tsx, calendar/page.tsx, analytics/page.tsx, reviews/page.tsx, payouts/page.tsx, profile/page.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## ✨ Fleet-Feast-0qv Restyle Customer Dashboard & Booking Pages

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:01 |
| **Updated** | 2025-12-07 20:02 |
| **Closed** | 2025-12-07 20:02 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to customer area. Bold dashboard cards, glass booking forms, chunky status badges. Files: app/customer/dashboard/layout.tsx, page.tsx, favorites/page.tsx, settings/page.tsx, payments/page.tsx, reviews/page.tsx, app/customer/bookings/page.tsx, [id]/page.tsx, app/customer/booking/page.tsx, BookingClient.tsx, [id]/confirmation/page.tsx, [id]/payment/page.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## ✨ Fleet-Feast-8gg Restyle Authentication Pages

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:01 |
| **Updated** | 2025-12-07 20:02 |
| **Closed** | 2025-12-07 20:02 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to auth pages. Bold form containers with glass effects, chunky inputs, brutalist buttons. Files: app/(auth)/layout.tsx, login/page.tsx, LoginClient.tsx, register/page.tsx, forgot-password/page.tsx, reset-password/page.tsx, ResetPasswordClient.tsx, verify-email/page.tsx, VerifyEmailClient.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## ✨ Fleet-Feast-jma Restyle Food Truck Detail Pages

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:01 |
| **Updated** | 2025-12-07 20:02 |
| **Closed** | 2025-12-07 20:02 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to truck profile pages. Bold hero section, glass menu cards, chunky calendar, brutalist review section. Files: app/(public)/trucks/[id]/page.tsx, layout.tsx, components/TruckHero.tsx, PhotoGallery.tsx, MenuSection.tsx, AvailabilityCalendar.tsx, ReviewsSection.tsx, SimilarTrucks.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## ✨ Fleet-Feast-cc2 Restyle Search & Discovery Pages

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:01 |
| **Updated** | 2025-12-07 20:01 |
| **Closed** | 2025-12-07 20:01 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to search interface. Bold filter panels, chunky truck cards with glass effects, brutalist pagination. Files: app/(public)/search/page.tsx, SearchClient.tsx, components/SearchBar.tsx, FilterPanel.tsx, ResultsGrid.tsx, ResultsList.tsx, TruckCard.tsx, Pagination.tsx, SortDropdown.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## ✨ Fleet-Feast-d59 Restyle Homepage & Public Marketing Sections

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 00:00 |
| **Updated** | 2025-12-07 20:02 |
| **Closed** | 2025-12-07 20:02 |
| **Labels** | agent:Parker_Pages, category:enhancement, phase:2, status:in-progress, type:post-completion |

### Description

Apply neo-brutalist glassmorphism to homepage sections. Bold hero with glass overlays, chunky CTAs, brutalist testimonial cards. Files: app/page.tsx, app/(public)/components/HeroSection.tsx, FeaturedTrucks.tsx, HowItWorks.tsx, Testimonials.tsx, CTASection.tsx

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-hv0`
- ⛔ **blocks**: `Fleet-Feast-daa`

---

## 🐛 Fleet-Feast-pcn HOTFIX: Search sort dropdown component broken

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-05 12:37 |
| **Updated** | 2025-12-05 12:50 |
| **Closed** | 2025-12-05 12:50 |
| **Labels** | phase:hotfix, severity:major, status:in-progress, type:bug |

### Description

## Problem
Search page sort dropdown throws runtime error due to incorrect component usage.

## Error
Cannot read properties of undefined (reading 'filter')
SortDropdown passes children to Dropdown but Dropdown expects items prop.

## Impact
- Users cannot sort search results
- Degraded search UX

## Agent: Casey_Components
## Priority: HIGH - Core feature broken

---

## 📋 Fleet-Feast-ue6 Loyalty discount system not implemented

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-05 04:58 |
| **Updated** | 2025-12-05 05:28 |
| **Closed** | 2025-12-05 05:28 |
| **Labels** | severity:major, type:bug |

### Description

PRD F16 specifies 5% discount for repeat bookings with same vendor (platform absorbs cost, reduces commission from 15% to 10%). Loyalty check endpoint exists but discount not applied in payment flow or displayed in UI.

---

## 📋 Fleet-Feast-gm5 Cancellation policy refund calculation missing

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-05 04:57 |
| **Updated** | 2025-12-05 05:28 |
| **Closed** | 2025-12-05 05:28 |
| **Labels** | severity:major, type:bug |

### Description

PRD F11 specifies time-based refund percentages (100% at 7+ days, 50% at 3-6 days, 0% <3 days). Payment refund endpoint exists but no automatic calculation based on event date. Vendor penalty system also not automated.

---

## 📋 Fleet-Feast-016 Final Validation & Launch Checklist

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:03 |
| **Updated** | 2025-12-05 05:39 |
| **Closed** | 2025-12-05 05:39 |

### Description

Final launch validation: all features working, security verified, performance targets met, documentation complete, infrastructure ready, rollback plan documented. Agent: Quinn_QA.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-8sg`
- ⛔ **blocks**: `Fleet-Feast-2v4`
- ⛔ **blocks**: `Fleet-Feast-4f4`
- ⛔ **blocks**: `Fleet-Feast-uw2`

---

## 📋 Fleet-Feast-bgd Infrastructure Configuration

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:02 |
| **Updated** | 2025-12-04 20:16 |
| **Closed** | 2025-12-04 20:16 |
| **Labels** | status:in-progress |

### Description

Configure infrastructure: Vercel deployment, PostgreSQL (Railway/AWS RDS), Redis, S3/Cloudinary, environment variables, domain setup, SSL. Agent: Devon_DevOps.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-fja`

---

## 📋 Fleet-Feast-4cw CI/CD Pipeline Setup

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:02 |
| **Updated** | 2025-12-05 05:01 |
| **Closed** | 2025-12-05 05:01 |

### Description

Set up CI/CD pipeline: GitHub Actions for lint/test/build, automated testing on PR, preview deployments, production deployment workflow. Agent: Cameron_CICD.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-fja`
- ⛔ **blocks**: `Fleet-Feast-2tl`
- ⛔ **blocks**: `Fleet-Feast-es6`
- ⛔ **blocks**: `Fleet-Feast-2w3`

---

## 📋 Fleet-Feast-2v4 Security Fixes

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:01 |
| **Updated** | 2025-12-05 05:27 |
| **Closed** | 2025-12-05 05:27 |

### Description

Fix all vulnerabilities identified in security audit. Implement recommended security hardening measures. Verify fixes and document security controls. Agent: Sage_Security.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-04a`

---

## 📋 Fleet-Feast-4f4 Compliance Audit

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:00 |
| **Updated** | 2025-12-05 05:28 |
| **Closed** | 2025-12-05 05:28 |

### Description

Audit GDPR/CCPA compliance: data retention policies, consent mechanisms, data export/deletion, privacy policy, cookie consent. PCI compliance via Stripe verification. Agent: Avery_Audit.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-5cl`
- ⛔ **blocks**: `Fleet-Feast-3rw`

---

## 📋 Fleet-Feast-04a Security Audit

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:00 |
| **Updated** | 2025-12-05 05:01 |
| **Closed** | 2025-12-05 05:01 |

### Description

Comprehensive security audit: OWASP Top 10, authentication flows, payment security, input validation, XSS/CSRF/SQL injection checks, rate limiting verification. Agent: Sage_Security.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-5ey`
- ⛔ **blocks**: `Fleet-Feast-igb`
- ⛔ **blocks**: `Fleet-Feast-5cl`

---

## 📋 Fleet-Feast-8sg Bug Fixes from QA

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:00 |
| **Updated** | 2025-12-05 05:27 |
| **Closed** | 2025-12-05 05:27 |

### Description

Fix all bugs identified during QA validation. Priority: critical > high > medium. Verify fixes with regression tests. Agent: Blake_Backend.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-qjr`

---

## 📋 Fleet-Feast-c2q Payment Flow Testing

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:00 |
| **Updated** | 2025-12-05 05:01 |
| **Closed** | 2025-12-05 05:01 |

### Description

Test all payment scenarios: successful payment, failed payment, refunds, escrow release, commission calculation, loyalty discount application. Stripe test mode. Agent: Quinn_QA.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-5cl`
- ⛔ **blocks**: `Fleet-Feast-4tc`

---

## 📋 Fleet-Feast-qjr QA Validation - Feature Completeness

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:59 |
| **Updated** | 2025-12-05 05:01 |
| **Closed** | 2025-12-05 05:01 |

### Description

Manual QA validation of all features against PRD requirements. Test edge cases, error states, responsive design, cross-browser compatibility. Agent: Quinn_QA.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-yo3`
- ⛔ **blocks**: `Fleet-Feast-pgs`
- ⛔ **blocks**: `Fleet-Feast-6ir`
- ⛔ **blocks**: `Fleet-Feast-8hk`

---

## 📋 Fleet-Feast-6fo E2E Tests - Critical User Flows

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:59 |
| **Updated** | 2025-12-05 05:02 |
| **Closed** | 2025-12-05 05:02 |

### Description

Create Playwright E2E tests for critical flows: user registration, vendor onboarding, search to booking, payment, messaging, review submission. Agent: Quinn_QA.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-8ve`
- ⛔ **blocks**: `Fleet-Feast-r28`
- ⛔ **blocks**: `Fleet-Feast-v16`

---

## 📋 Fleet-Feast-2w3 Integration Tests - API Endpoints

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:59 |
| **Updated** | 2025-12-05 04:43 |
| **Closed** | 2025-12-05 04:43 |
| **Labels** | status:in-progress |

### Description

Create API integration tests: auth flows, booking lifecycle, payment processing, messaging. Test database interactions, external service mocks. Agent: Taylor_Tester.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-igb`
- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-5cl`
- ⛔ **blocks**: `Fleet-Feast-e63`

---

## 📋 Fleet-Feast-es6 Unit Test Suite - Frontend Components

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:59 |
| **Updated** | 2025-12-05 04:43 |
| **Closed** | 2025-12-05 04:43 |
| **Labels** | status:in-progress |

### Description

Create unit tests for UI components and hooks using Jest + React Testing Library. Test user interactions, state changes, accessibility. Agent: Taylor_Tester.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-2tl Unit Test Suite - Backend Services

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:59 |
| **Updated** | 2025-12-05 04:43 |
| **Closed** | 2025-12-05 04:43 |
| **Labels** | status:in-progress |

### Description

Create unit tests for all backend services: auth, booking, payment, messaging, dispute, violation. Jest + testing-library. 80% coverage target. Agent: Taylor_Tester.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-igb`
- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-5cl`
- ⛔ **blocks**: `Fleet-Feast-2f0`
- ⛔ **blocks**: `Fleet-Feast-mx9`

---

## 📋 Fleet-Feast-dw4 Code Review - Frontend Components

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:59 |
| **Updated** | 2025-12-05 04:43 |
| **Closed** | 2025-12-05 04:43 |
| **Labels** | status:in-progress |

### Description

Review UI components, layouts, pages for accessibility, performance, code patterns, consistency. Agent: Riley_Reviewer.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`
- ⛔ **blocks**: `Fleet-Feast-8ve`
- ⛔ **blocks**: `Fleet-Feast-zyk`
- ⛔ **blocks**: `Fleet-Feast-r28`

---

## 📋 Fleet-Feast-5ey Code Review - Auth & Core APIs

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:58 |
| **Updated** | 2025-12-05 04:25 |
| **Closed** | 2025-12-05 04:25 |
| **Labels** | status:in-progress |

### Description

Review authentication, vendor, search, booking, and payment APIs for security, patterns, error handling, code quality. Agent: Riley_Reviewer.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-igb`
- ⛔ **blocks**: `Fleet-Feast-ok7`
- ⛔ **blocks**: `Fleet-Feast-w6w`
- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-5cl`

---

## 📋 Fleet-Feast-v16 Messaging Interface

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:58 |
| **Updated** | 2025-12-05 04:06 |
| **Closed** | 2025-12-05 04:06 |
| **Labels** | status:in-progress |

### Description

Create messaging UI: conversation list, message thread view, message composer, attachment support, read receipts, flagged message indicators. Agent: Parker_Pages. PRD: F9.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-2f0`
- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-r28 Booking Flow Pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:57 |
| **Updated** | 2025-12-05 04:06 |
| **Closed** | 2025-12-05 04:06 |
| **Labels** | status:in-progress |

### Description

Create booking request form, payment checkout (Stripe Elements), booking confirmation, booking details page. Event details form, guest count, location, special requests. Agent: Parker_Pages. PRD: F7, F8.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-5cl`
- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-dxo Food Truck Profile Pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:57 |
| **Updated** | 2025-12-05 03:52 |
| **Closed** | 2025-12-05 03:52 |
| **Labels** | status:in-progress |

### Description

Create truck profile page: photos gallery, menu display, availability calendar, reviews section, booking CTA, similar trucks. Agent: Parker_Pages. PRD: F4, F6, F10.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-w6w`
- ⛔ **blocks**: `Fleet-Feast-bj4`
- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-zyk Food Truck Search & Discovery Pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:57 |
| **Updated** | 2025-12-05 03:38 |
| **Closed** | 2025-12-05 03:38 |
| **Labels** | status:in-progress |

### Description

Create search page with filters (cuisine, price, capacity, rating, date), results grid/list view, map integration, sorting options, pagination. Agent: Parker_Pages. PRD: F5.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-w6w`
- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-qm9 Vendor Application Pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:56 |
| **Updated** | 2025-12-05 03:25 |
| **Closed** | 2025-12-05 03:25 |
| **Labels** | status:in-progress |

### Description

Create multi-step vendor application form: business info, document uploads, menu setup, availability setup, preview and submit. Progress indicator, save draft. Agent: Parker_Pages. PRD: F2.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-ok7`
- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-8ve Authentication Pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:56 |
| **Updated** | 2025-12-05 03:25 |
| **Closed** | 2025-12-05 03:25 |
| **Labels** | status:in-progress |

### Description

Create login, register, email verification, password reset pages. Form validation, error states, redirect flows, role selection. Agent: Parker_Pages. PRD: F1.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-igb`
- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-9xc Violation & Penalty System

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:56 |
| **Updated** | 2025-12-05 04:06 |
| **Closed** | 2025-12-05 04:06 |
| **Labels** | status:in-progress |

### Description

Implement violation tracking, penalty progression (warning -> 30-day suspension -> permanent ban), circumvention monitoring flags, apply to both customers and vendors. Agent: Blake_Backend. PRD: F15, Anti-Circumvention Rules.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-2f0`
- ⛔ **blocks**: `Fleet-Feast-igb`

---

## 📋 Fleet-Feast-32i Dispute Resolution System

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:56 |
| **Updated** | 2025-12-05 04:06 |
| **Closed** | 2025-12-05 04:06 |
| **Labels** | status:in-progress |

### Description

Implement automated dispute rules (no-show, late arrival thresholds), manual escalation workflow, 7-day dispute window, fund hold during disputes, resolution outcomes. Agent: Blake_Backend. PRD: F13, Business Rules - Dispute Resolution.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-5cl`

---

## 📋 Fleet-Feast-2f0 Messaging System with Anti-Circumvention

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:55 |
| **Updated** | 2025-12-05 03:52 |
| **Closed** | 2025-12-05 03:52 |
| **Labels** | status:in-progress |

### Description

Implement in-app messaging tied to bookings, message history preservation, automated pattern detection for phone/email/social handles, flag suspicious content. NO external contact exchange. Agent: Blake_Backend. PRD: F9, F14.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-igb`

---

## 📋 Fleet-Feast-5cl Payment & Escrow System

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:55 |
| **Updated** | 2025-12-05 03:52 |
| **Closed** | 2025-12-05 03:52 |
| **Labels** | status:in-progress |

### Description

Implement Stripe Connect integration: marketplace payments, escrow hold until 7 days post-event, 15% commission calculation, vendor payouts, refund handling. Agent: Blake_Backend. PRD: F8, Business Rules - Commission Structure.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-ok7`

---

## 📋 Fleet-Feast-bj4 Review & Rating System

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:55 |
| **Updated** | 2025-12-05 03:38 |
| **Closed** | 2025-12-05 03:38 |
| **Labels** | status:in-progress |

### Description

Implement review submission tied to verified bookings only, 1-5 star ratings, written reviews, both customer and vendor can review each other. Calculate aggregate ratings. Agent: Ellis_Endpoints. PRD: F10.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-w6w`

---

## 📋 Fleet-Feast-wu8 Booking System API

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:55 |
| **Updated** | 2025-12-05 03:38 |
| **Closed** | 2025-12-05 03:38 |
| **Labels** | status:in-progress |

### Description

Implement request-to-book flow, booking CRUD, status management (pending/accepted/declined/completed), 48hr vendor response window, cancellation policy enforcement. Agent: Blake_Backend. PRD: F7, F11, F12.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-igb`
- ⛔ **blocks**: `Fleet-Feast-w6w`

---

## 📋 Fleet-Feast-5ub Navigation & Layout System

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:54 |
| **Updated** | 2025-12-05 03:12 |
| **Closed** | 2025-12-05 03:12 |
| **Labels** | status:in-progress |

### Description

Create responsive navigation (mobile hamburger, desktop sidebar), page layouts, header/footer components, breadcrumbs, role-based nav items. Agent: Casey_Components. PRD: Responsive Breakpoints.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-igb`

---

## 📋 Fleet-Feast-w6w Food Truck Profiles & Search API

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:54 |
| **Updated** | 2025-12-05 03:25 |
| **Closed** | 2025-12-05 03:25 |
| **Labels** | status:in-progress |

### Description

Implement food truck profile CRUD, menu management, availability calendar API, PostgreSQL full-text search with filters (cuisine, price, capacity, rating, location). Agent: Ellis_Endpoints. PRD: F4, F5, F6.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-3rw`
- ⛔ **blocks**: `Fleet-Feast-ok7`

---

## 📋 Fleet-Feast-e63 API Middleware & Rate Limiting

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:54 |
| **Updated** | 2025-12-05 03:12 |
| **Closed** | 2025-12-05 03:12 |
| **Labels** | status:in-progress |

### Description

Implement API middleware layer: authentication middleware, rate limiting per user/IP, request validation, error handling middleware, CORS configuration. Agent: Morgan_Middleware. PRD: Security Requirements.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-igb`
- ⛔ **blocks**: `Fleet-Feast-zjd`

---

## 📋 Fleet-Feast-ok7 Vendor Application & Onboarding API

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:54 |
| **Updated** | 2025-12-05 03:12 |
| **Closed** | 2025-12-05 03:12 |
| **Labels** | status:in-progress |

### Description

Implement vendor application submission API, document upload (S3/Cloudinary), admin approval workflow, vendor profile management. Agent: Blake_Backend. PRD: F2, F3.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-3rw`
- ⛔ **blocks**: `Fleet-Feast-igb`

---

## 📋 Fleet-Feast-bxt UI Component Library

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:53 |
| **Updated** | 2025-12-04 19:55 |
| **Closed** | 2025-12-04 19:55 |

### Description

Create reusable UI components: Button, Input, Card, Modal, Alert, Badge, Rating, Spinner, Avatar, Dropdown, Tabs, Form controls. Follow PRD design system. Agent: Casey_Components. PRD: Design Requirements.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-fja`
- ⛔ **blocks**: `Fleet-Feast-mx9`
- ⛔ **blocks**: `Fleet-Feast-nww`

---

## 📋 Fleet-Feast-igb Authentication System Implementation

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:53 |
| **Updated** | 2025-12-05 02:57 |
| **Closed** | 2025-12-05 02:57 |
| **Labels** | status:in-progress |

### Description

Implement NextAuth.js with JWT, email/password auth, email verification, password reset, role-based access (Customer, Vendor, Admin). Agent: Blake_Backend. PRD: F1, Security Requirements.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-3rw`
- ⛔ **blocks**: `Fleet-Feast-mx9`

---

## 📋 Fleet-Feast-nww Global Styles & Theme Implementation

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:53 |
| **Updated** | 2025-12-04 19:54 |
| **Closed** | 2025-12-04 19:54 |

### Description

Implement Tailwind theme with PRD colors (Primary #B91C1C, etc.), Inter font, responsive breakpoints, CSS variables for theming. Agent: Sam_Styler. PRD: Design Requirements.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-fja`

---

## 📋 Fleet-Feast-3rw Database Implementation & Migrations

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:53 |
| **Updated** | 2025-12-04 20:16 |
| **Closed** | 2025-12-04 20:16 |
| **Labels** | status:in-progress |

### Description

Implement Prisma schema, create migrations, set up seed data for development. All entities from schema design. Agent: Dana_Database. PRD: Data Entities.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-huc`
- ⛔ **blocks**: `Fleet-Feast-fja`

---

## 📋 Fleet-Feast-mx9 Design Patterns & Code Standards

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:52 |
| **Updated** | 2025-12-04 19:54 |
| **Closed** | 2025-12-04 19:54 |

### Description

Define coding standards, design patterns (repository, service layer, etc.), file naming conventions, component patterns, state management patterns, testing patterns. Create .claude/docs/standards/. Agent: Petra_Patterns.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-fja`

---

## 📋 Fleet-Feast-zjd API Design & Specification

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:52 |
| **Updated** | 2025-12-04 19:54 |
| **Closed** | 2025-12-04 19:54 |

### Description

Design RESTful API specification for all endpoints. Document request/response schemas, authentication flows, rate limiting rules, error responses. Create OpenAPI/Swagger spec. Agent: Ellis_Endpoints. PRD: All F1-F22 features.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-1kw`
- ⛔ **blocks**: `Fleet-Feast-huc`

---

## 📋 Fleet-Feast-fja Project Scaffolding & Configuration

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:52 |
| **Updated** | 2025-12-04 19:53 |
| **Closed** | 2025-12-04 19:53 |

### Description

Set up Next.js 14+ project structure, TypeScript config, Tailwind CSS, ESLint, Prettier, Prisma configuration, environment variables, folder structure per architecture design. Agent: Alex_Architect.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-1kw`

---

## 📋 Fleet-Feast-huc Database Schema Design

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:52 |
| **Updated** | 2025-12-04 19:53 |
| **Closed** | 2025-12-04 19:53 |

### Description

Design PostgreSQL database schema for all entities: User, Vendor, VendorDocument, VendorMenu, Availability, Booking, Payment, Message, Review, Violation, Dispute. Include indexes, constraints, relationships. Agent: Dana_Database. PRD: Data Entities section.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-1kw`

---

## 📋 Fleet-Feast-1kw System Architecture Design

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ⚡ High (P1) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:52 |
| **Updated** | 2025-12-04 19:37 |
| **Closed** | 2025-12-04 19:37 |

### Description

Design overall system architecture including tech stack (Next.js 14+, PostgreSQL, Redis, Stripe Connect), component structure, data flow, and deployment strategy. Create architecture diagrams and decision records. Agent: Alex_Architect. PRD Features: Foundation for all F1-F22.

---

## 📋 Fleet-Feast-9g2 Refactor: Verify build metrics and test coverage after refactoring

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:32 |
| **Updated** | 2025-12-18 13:17 |
| **Closed** | 2025-12-18 13:17 |
| **Labels** | agent:Taylor_Tester, category:refactor, phase:4, type:post-completion |

### Description

Final verification that refactoring tasks meet success criteria.

## Objective
Verify all refactoring tasks meet the defined success criteria

## Requirements
- Run full test suite (unit, integration, e2e)
- Measure bundle sizes before/after
- Check TypeScript strict mode passes
- Verify no regressions

## Acceptance Criteria
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E tests pass
- [ ] Bundle size same or smaller
- [ ] TypeScript compilation clean
- [ ] No console errors in browser

## Files
- package.json (scripts)
- Build output metrics

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-bdu`
- ⛔ **blocks**: `Fleet-Feast-m0d`
- ⛔ **blocks**: `Fleet-Feast-4xa`
- ⛔ **blocks**: `Fleet-Feast-y7c`
- ⛔ **blocks**: `Fleet-Feast-meq`
- ⛔ **blocks**: `Fleet-Feast-cps`
- ⛔ **blocks**: `Fleet-Feast-31d`
- ⛔ **blocks**: `Fleet-Feast-8kk`
- ⛔ **blocks**: `Fleet-Feast-eab`
- ⛔ **blocks**: `Fleet-Feast-dpj`

---

## 📋 Fleet-Feast-dpj Refactor: Review and optimize Prisma includes/selects

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:32 |
| **Updated** | 2025-12-18 13:06 |
| **Closed** | 2025-12-18 13:06 |
| **Labels** | agent:Dana_Database, category:perf, phase:4, status:in-progress, type:post-completion |

### Description

Audit Prisma queries across services for unnecessary data loading.

## Objective
Reduce over-fetching by reviewing Prisma include/select usage in services

## Requirements
- Audit all Prisma queries in modules/
- Replace include with select where possible
- Use optimized.ts patterns consistently

## Acceptance Criteria
- [ ] All services use selective field loading
- [ ] No unnecessary relation includes
- [ ] Query response sizes reduced
- [ ] All existing tests pass

## Files
- modules/**/*.service.ts
- lib/queries/optimized.ts

---

## 📋 Fleet-Feast-eab Refactor: Add React Query stale-time optimization

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:32 |
| **Updated** | 2025-12-18 13:06 |
| **Closed** | 2025-12-18 13:06 |
| **Labels** | agent:Jordan_Junction, category:perf, phase:4, status:in-progress, type:post-completion |

### Description

Optimize React Query configurations for better cache utilization.

## Objective
Review and optimize staleTime and cacheTime settings across React Query hooks

## Requirements
- Audit all useQuery hooks for appropriate stale times
- Add query key prefixes for better invalidation
- Ensure mutation invalidations are targeted

## Acceptance Criteria
- [ ] All queries have appropriate staleTime
- [ ] Query keys follow consistent pattern
- [ ] Mutations invalidate only affected queries
- [ ] Page load metrics improved

## Files
- Frontend components using useQuery
- lib/queries/index.ts (if exists)

---

## 📋 Fleet-Feast-8kk Refactor: Enhance database query caching layer

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:32 |
| **Updated** | 2025-12-18 13:13 |
| **Closed** | 2025-12-18 13:13 |
| **Labels** | agent:Dana_Database, category:perf, phase:4, type:post-completion |

### Description

Improve the caching layer for frequently accessed database queries.

## Objective
Enhance lib/cache.ts with smarter caching patterns for database queries

## Requirements
- Add cache invalidation hooks for Prisma operations
- Implement cache warming for common queries
- Add cache metrics/monitoring

## Acceptance Criteria
- [ ] Cache invalidation on mutations works correctly
- [ ] Common queries (truck list, reviews) are cached
- [ ] Cache hit/miss metrics available
- [ ] All existing tests pass

## Files
- lib/cache.ts
- lib/queries/optimized.ts

---

## 📋 Fleet-Feast-cps Refactor: Create shared API error handling utility

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:31 |
| **Updated** | 2025-12-18 13:06 |
| **Closed** | 2025-12-18 13:06 |
| **Labels** | agent:Blake_Backend, category:refactor, phase:4, status:in-progress, type:post-completion |

### Description

Create a shared error handling wrapper to standardize API error responses.

## Objective
Create a reusable error handling utility that can wrap API handlers

## Requirements
- Create withErrorHandling HOF in lib/middleware/error-handler.ts
- Handle unknown errors properly
- Log errors with sanitized details
- Return consistent ApiResponses

## Acceptance Criteria
- [ ] withErrorHandling wrapper created
- [ ] Handles Prisma errors appropriately
- [ ] Handles Zod validation errors
- [ ] Handles custom app errors
- [ ] All new code has tests

## Files
- lib/middleware/error-handler.ts

---

## 📋 Fleet-Feast-meq Refactor: Standardize error handling in violation API routes

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:31 |
| **Updated** | 2025-12-18 13:06 |
| **Closed** | 2025-12-18 13:06 |
| **Labels** | agent:Blake_Backend, category:refactor, phase:4, status:in-progress, type:post-completion |

### Description

Replace 'catch (error: any)' with proper typed error handling in violation routes.

## Objective
Improve error handling consistency and type safety in violation API routes

## Requirements
- Replace catch (error: any) with catch (error: unknown)
- Use getErrorMessage utility from api-response.ts
- Add proper error type guards where needed

## Acceptance Criteria
- [ ] Zero error: any catches in violation routes
- [ ] Error handling uses consistent patterns
- [ ] All existing tests pass

## Files
- app/api/violations/route.ts
- app/api/violations/user/[userId]/route.ts
- app/api/admin/violations/[id]/route.ts
- app/api/admin/violations/[id]/appeal/route.ts

---

## 📋 Fleet-Feast-y7c Refactor: Type-safe query filters in lib/queries/optimized.ts

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:31 |
| **Updated** | 2025-12-18 12:52 |
| **Closed** | 2025-12-18 12:52 |
| **Labels** | agent:Dana_Database, category:refactor, phase:4, status:in-progress, type:post-completion |

### Description

Replace 'as any' casts with proper Prisma enum types in optimized queries.

## Objective
Remove all 'as any' type casts from database queries by using proper Prisma types

## Requirements
- Import Prisma enums directly (CuisineType, PriceRange, BookingStatus)
- Use proper enum types in filter conditions
- Remove batchLoadVendorRatings 'prisma: any' parameter

## Acceptance Criteria
- [ ] Zero 'as any' casts in optimized.ts
- [ ] All Prisma enums properly imported
- [ ] batchLoadVendorRatings properly typed
- [ ] All existing tests pass

## Files
- lib/queries/optimized.ts

---

## 📋 Fleet-Feast-4xa Refactor: Add strict generics to lib/api-response.ts

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:30 |
| **Updated** | 2025-12-18 12:52 |
| **Closed** | 2025-12-18 12:52 |
| **Labels** | agent:Blake_Backend, category:refactor, phase:4, status:in-progress, type:post-completion |

### Description

Improve type safety of API response utilities with stricter generics.

## Objective
Replace Record<string, any> with stricter generic types in api-response.ts

## Requirements
- Remove Record<string, any> patterns
- Add proper generic constraints
- Improve isApiError type guard

## Acceptance Criteria
- [ ] Meta object typed with generics
- [ ] sanitizeErrorDetails properly typed
- [ ] isApiError uses unknown instead of any
- [ ] All existing tests pass

## Files
- lib/api-response.ts

---

## 📋 Fleet-Feast-m0d Refactor: Remove any types from lib/middleware/rate-limit.ts

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:30 |
| **Updated** | 2025-12-18 12:52 |
| **Closed** | 2025-12-18 12:52 |
| **Labels** | agent:Blake_Backend, category:refactor, phase:4, status:in-progress, type:post-completion |

### Description

Replace all 'any' types with proper TypeScript types in the rate limiting middleware.

## Objective
Improve type safety by removing all any types from lib/middleware/rate-limit.ts

## Requirements
- Replace ~6 instances of any with proper types
- Use proper generic constraints for handler wrappers
- Maintain backwards compatibility

## Acceptance Criteria
- [ ] Zero any types in rate-limit.ts
- [ ] Generic constraints properly typed
- [ ] All existing tests pass
- [ ] No breaking changes

## Files
- lib/middleware/rate-limit.ts

---

## 📋 Fleet-Feast-bdu Refactor: Remove any types from lib/middleware/validation.ts

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:30 |
| **Updated** | 2025-12-18 12:52 |
| **Closed** | 2025-12-18 12:52 |
| **Labels** | agent:Blake_Backend, category:refactor, phase:4, status:in-progress, type:post-completion |

### Description

Replace all 'any' types with proper TypeScript types in the validation middleware.

## Objective
Improve type safety by removing all any types from lib/middleware/validation.ts

## Requirements
- Replace ~10 instances of any with proper types
- Maintain backwards compatibility
- All tests must pass

## Acceptance Criteria
- [ ] Zero any types in validation.ts
- [ ] TypeScript strict mode passes
- [ ] All existing tests pass
- [ ] No breaking changes

## Files
- lib/middleware/validation.ts

---

## ✨ Fleet-Feast-hl5 Add vendor location and service radius settings

| Property | Value |
|----------|-------|
| **Type** | ✨ feature |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-16 20:11 |
| **Updated** | 2025-12-16 21:09 |
| **Closed** | 2025-12-16 21:09 |
| **Labels** | agent:Jordan_Junction, category:feature, phase:2, status:in-progress, type:post-completion |

### Description

Vendors need to be able to set their base location and service radius on their profile dashboard. This enables location-based search and filtering.

## Requirements
1. Add to Vendor Profile page (app/vendor/profile/page.tsx):
   - Location field (address with autocomplete or lat/lng)
   - Service radius field (in miles, e.g., 5, 10, 25, 50)
   
2. Database changes (if needed):
   - Add location fields to Vendor model
   - latitude, longitude, serviceRadius

3. API changes:
   - Update vendor profile PUT endpoint to save location
   - Update search API to filter by location/radius

4. Search integration:
   - Add location filter to search page
   - Filter results by vendor service area

## UI Design
- New 'Service Area' card in vendor profile
- Map preview showing service radius
- Radius dropdown: 5mi, 10mi, 25mi, 50mi, 100mi

## Acceptance Criteria
- [ ] Vendors can set their base location
- [ ] Vendors can set service radius (miles)
- [ ] Location saved to database
- [ ] Search can filter by customer location
- [ ] Trucks only shown if customer is within service radius

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-0aj`

---

## 📋 Fleet-Feast-0aj Remove NYC-specific references - make platform location-agnostic

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-16 20:11 |
| **Updated** | 2025-12-16 20:57 |
| **Closed** | 2025-12-16 20:57 |
| **Labels** | category:refactor, phase:4, type:post-completion |

### Description

The platform currently has hardcoded NYC references throughout. Need to make it location-agnostic to support vendors in any location.

## Files to Update (15+ files)
1. app/layout.tsx - metadata (lines 19, 23, 34, 40)
2. app/(public)/components/HeroSection.tsx - '100+ Food Trucks Available in NYC' (line 86)
3. app/(public)/components/FeaturedTrucksClient.tsx - 'NYC's most popular' (line 66)
4. app/(public)/about/AboutClient.tsx - Multiple NYC refs (lines 56, 84, 95, 202, 282)
5. app/(public)/about/page.tsx - metadata keywords (line 12)
6. app/(public)/search/SearchClient.tsx - 'NYC Food Truck Marketplace' (line 259)
7. app/(public)/contact/page.tsx - 'New York, NY 10001' address (line 315)
8. app/(public)/contact/layout.tsx - metadata keywords (line 12)
9. app/(public)/faq/page.tsx - NYC service area FAQ (line 103)
10. app/customer/booking/BookingClient.tsx - 'New York' placeholder (line 435)
11. prisma/seed.ts - If has NYC data

## Changes to Make
- Replace 'NYC' with 'your area' or remove specific location
- Update metadata to be location-agnostic
- Change 'NYC's #1' to 'The #1' or similar
- Update FAQ to mention multi-location support
- Remove hardcoded address or make configurable

## Acceptance Criteria
- [ ] No hardcoded NYC/New York references in user-facing content
- [ ] Metadata describes platform generically (not NYC-specific)
- [ ] About page updated to reflect multi-location vision
- [ ] FAQ updated to reflect current service area model
- [ ] Seed data updated if location-specific

---

## 📋 Fleet-Feast-mz4 Mobile menu missing public navigation links for authenticated users

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-15 08:27 |
| **Updated** | 2025-12-15 08:57 |
| **Closed** | 2025-12-15 08:57 |
| **Labels** | agent:Casey_Components, category:bugfix, status:in-progress, type:post-completion |

### Description

When authenticated users (vendors/customers) open mobile menu, only role-specific navigation is shown. Public links (Home, Search, How It Works, For Vendors) are missing, limiting navigation options.

---

## 📋 Fleet-Feast-cbj Dashboard sidebar FOIC - customer nav flashes before vendor nav loads

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-15 08:26 |
| **Updated** | 2025-12-15 08:57 |
| **Closed** | 2025-12-15 08:57 |
| **Labels** | agent:Jordan_Junction, category:bugfix, status:in-progress, type:post-completion |

### Description

On vendor dashboard pages, the sidebar initially shows customer navigation links before updating to vendor navigation. This is a hydration/SSR issue causing flash of incorrect content.

---

## 🐛 Fleet-Feast-0id Investigate Invalid or unexpected token JS error

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 21:45 |
| **Updated** | 2025-12-07 22:43 |
| **Closed** | 2025-12-07 22:43 |
| **Labels** | agent:Blake_Backend, category:bugfix, phase:4 |

### Description

Console shows 'Invalid or unexpected token' error on page load. Source is unknown - needs investigation to identify the problematic code causing this JavaScript syntax error.

---

## 🐛 Fleet-Feast-43x Add missing favicon.ico

| Property | Value |
|----------|-------|
| **Type** | 🐛 bug |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 21:45 |
| **Updated** | 2025-12-07 22:44 |
| **Closed** | 2025-12-07 22:44 |
| **Labels** | agent:Sam_Styler, category:bugfix, phase:4 |

### Description

The favicon.ico file is missing, causing a 404 error on every page load. Need to add a Fleet Feast branded favicon to the public directory.

---

## 📋 Fleet-Feast-b3m Add main landmark to page layouts

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 20:15 |
| **Updated** | 2025-12-07 20:26 |
| **Closed** | 2025-12-07 20:26 |
| **Labels** | domain:accessibility, phase:post-launch, status:in-progress, type:gap-important |

### Description

Screen reader users cannot quickly navigate to main content region. Wrap page content in semantic main element. WCAG 4.1.2 Level A compliance.

---

## 📋 Fleet-Feast-25p Add skip navigation link for keyboard users

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 20:15 |
| **Updated** | 2025-12-07 20:26 |
| **Closed** | 2025-12-07 20:26 |
| **Labels** | domain:accessibility, phase:post-launch, status:in-progress, type:gap-important |

### Description

Keyboard users must tab through entire header on every page. Add skip link to jump to main content. WCAG 2.4.1 Level A compliance.

---

## 📋 Fleet-Feast-egj Verify calendar cell touch targets meet 44px minimum

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 20:13 |
| **Updated** | 2025-12-07 20:27 |
| **Closed** | 2025-12-07 20:27 |
| **Labels** | area:testing, status:in-progress, type:task |

### Description

Calendar date cells in AvailabilityCalendar and vendor calendar should be verified to meet 44x44px minimum touch target for mobile users. Verify minimum size constraints and tap accuracy on actual devices.

---

## 📋 Fleet-Feast-3ar Small button touch targets below WCAG 44px minimum

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 20:13 |
| **Updated** | 2025-12-07 20:25 |
| **Closed** | 2025-12-07 20:25 |
| **Labels** | area:accessibility, status:in-progress, type:bug |

### Description

WCAG 2.1 requires minimum 44x44px touch targets. Small buttons (btn-sm) currently use py-2 padding which results in ~40px height. Increase to py-2.5 to meet accessibility requirements.

---

## 📋 Fleet-Feast-k8d Monitoring & Alerting Setup

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:03 |
| **Updated** | 2025-12-04 20:16 |
| **Closed** | 2025-12-04 20:16 |
| **Labels** | status:in-progress |

### Description

Set up monitoring: Sentry error tracking, Vercel Analytics, uptime monitoring, performance monitoring, alerting rules, on-call setup. Agent: Devon_DevOps.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-fja`

---

## 📋 Fleet-Feast-oo4 Developer Documentation

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:02 |
| **Updated** | 2025-12-04 20:16 |
| **Closed** | 2025-12-04 20:16 |
| **Labels** | status:in-progress |

### Description

Create developer documentation: architecture overview, setup guide, code conventions, deployment guide, environment configuration. Agent: Drew_Docs.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-1kw`
- ⛔ **blocks**: `Fleet-Feast-fja`

---

## 📋 Fleet-Feast-gr1 User Documentation

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:02 |
| **Updated** | 2025-12-05 05:28 |
| **Closed** | 2025-12-05 05:28 |

### Description

Create user documentation: customer guide (search, book, pay, review), vendor guide (onboarding, calendar, bookings), admin guide (approvals, disputes). Agent: Drew_Docs.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-qjr`

---

## 📋 Fleet-Feast-fmh API Documentation

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:02 |
| **Updated** | 2025-12-05 04:43 |
| **Closed** | 2025-12-05 04:43 |
| **Labels** | status:in-progress |

### Description

Create comprehensive API documentation: endpoint reference, request/response examples, authentication guide, error codes, rate limits. OpenAPI/Swagger spec + developer portal. Agent: Drew_Docs.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-zjd`
- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-5cl`

---

## 📋 Fleet-Feast-1ez Accessibility Fixes

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:01 |
| **Updated** | 2025-12-05 05:27 |
| **Closed** | 2025-12-05 05:27 |

### Description

Fix all accessibility issues from audit. Implement ARIA labels, keyboard navigation, color contrast fixes, focus management. Verify WCAG AA compliance. Agent: Casey_Components.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-8pt`

---

## 📋 Fleet-Feast-8pt Accessibility Audit

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:01 |
| **Updated** | 2025-12-05 05:01 |
| **Closed** | 2025-12-05 05:01 |

### Description

Audit WCAG AA compliance: color contrast, keyboard navigation, screen reader compatibility, focus indicators, form labels, alt text. Agent: Avery_Audit.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-dw4`

---

## 📋 Fleet-Feast-2ui Load Testing

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:01 |
| **Updated** | 2025-12-05 05:28 |
| **Closed** | 2025-12-05 05:28 |

### Description

Conduct load testing: simulate 1000 concurrent users, identify bottlenecks, stress test payment flow, verify API rate limits under load. Document capacity limits. Agent: Logan_Load.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-qjr`

---

## 📋 Fleet-Feast-uw2 Performance Optimization

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:01 |
| **Updated** | 2025-12-05 05:28 |
| **Closed** | 2025-12-05 05:28 |

### Description

Optimize performance: database query optimization, caching (Redis), image optimization, bundle size reduction, lazy loading. Meet PRD performance targets (LCP <2.5s, TTI <3.5s). Agent: Peyton_Performance.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-qjr`

---

## 📋 Fleet-Feast-4h6 Quote Request System

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:58 |
| **Updated** | 2025-12-05 04:24 |
| **Closed** | 2025-12-05 04:24 |
| **Labels** | status:in-progress |

### Description

Implement quote request for large/complex events: multi-truck RFQ, custom quote submission form, vendor response interface, quote comparison view. Agent: Ellis_Endpoints. PRD: F21.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-w6w`
- ⛔ **blocks**: `Fleet-Feast-wu8`

---

## 📋 Fleet-Feast-yo3 Homepage & Landing Pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:58 |
| **Updated** | 2025-12-05 03:38 |
| **Closed** | 2025-12-05 03:38 |
| **Labels** | status:in-progress |

### Description

Create marketing homepage: hero section, featured trucks, how it works, testimonials, CTA sections. About, FAQ, contact pages. SEO optimized. Agent: Parker_Pages.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-8hk Admin Dashboard Pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:57 |
| **Updated** | 2025-12-05 04:24 |
| **Closed** | 2025-12-05 04:24 |
| **Labels** | status:in-progress |

### Description

Create admin dashboard: vendor application review, dispute management, violation handling, platform analytics (GMV, revenue, users), user management. Agent: Parker_Pages. PRD: F3, F13, F15, F22.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-ok7`
- ⛔ **blocks**: `Fleet-Feast-32i`
- ⛔ **blocks**: `Fleet-Feast-9xc`
- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-6ir Vendor Dashboard Pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:57 |
| **Updated** | 2025-12-05 04:24 |
| **Closed** | 2025-12-05 04:24 |
| **Labels** | status:in-progress |

### Description

Create vendor dashboard: booking management, availability calendar, analytics (revenue, popular items), reviews, payout history, profile management. Agent: Parker_Pages. PRD: F17, F19.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-w6w`
- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-5cl`
- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-pgs Customer Dashboard Pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:57 |
| **Updated** | 2025-12-05 04:24 |
| **Closed** | 2025-12-05 04:24 |
| **Labels** | status:in-progress |

### Description

Create customer dashboard: upcoming/past bookings, messages inbox, favorites list, review submissions, payment history, account settings. Agent: Parker_Pages. PRD: F17, F20.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-2f0`
- ⛔ **blocks**: `Fleet-Feast-bxt`
- ⛔ **blocks**: `Fleet-Feast-5ub`

---

## 📋 Fleet-Feast-4tc Loyalty Discount System

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:56 |
| **Updated** | 2025-12-05 04:25 |
| **Closed** | 2025-12-05 04:25 |
| **Labels** | status:in-progress |

### Description

Implement 5% loyalty discount for repeat customer-vendor bookings, platform absorbs cost (commission reduced to 10%), track repeat booking patterns. Agent: Blake_Backend. PRD: F16, Business Rules - Commission Structure.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-wu8`
- ⛔ **blocks**: `Fleet-Feast-5cl`

---

## 📋 Fleet-Feast-zft Notification System

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:56 |
| **Updated** | 2025-12-05 04:24 |
| **Closed** | 2025-12-05 04:24 |
| **Labels** | status:in-progress |

### Description

Implement email notifications (SendGrid) and in-app notifications for: booking requests, acceptances, payment confirmations, messages, event reminders, review prompts. Agent: Jordan_Junction. PRD: F18.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-igb`
- ⛔ **blocks**: `Fleet-Feast-wu8`

---

## 📋 Fleet-Feast-3j3 Frontend State Management

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 🔹 Medium (P2) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 18:53 |
| **Updated** | 2025-12-04 19:55 |
| **Closed** | 2025-12-04 19:55 |

### Description

Set up Zustand stores for auth, booking, UI, search state. Define store patterns, selectors, actions. Agent: Jordan_Junction.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-fja`
- ⛔ **blocks**: `Fleet-Feast-mx9`

---

## 📋 Fleet-Feast-31d Refactor: Type-safe lib/utils.ts debounce function

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ☕ Low (P3) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-18 12:31 |
| **Updated** | 2025-12-18 12:52 |
| **Closed** | 2025-12-18 12:52 |
| **Labels** | agent:Blake_Backend, category:refactor, phase:4, status:in-progress, type:post-completion |

### Description

Improve type safety of debounce utility function.

## Objective
Replace '(...args: any[]) => any' with proper generic constraints

## Requirements
- Use TypeScript Parameters and ReturnType utilities
- Maintain full type inference for wrapped functions
- No any types

## Acceptance Criteria
- [ ] debounce function fully typed with generics
- [ ] Type inference works for wrapped functions
- [ ] All existing usages still work

## Files
- lib/utils.ts

---

## 📋 Fleet-Feast-dwa Login page has pre-filled demo credentials

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ☕ Low (P3) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-15 08:27 |
| **Updated** | 2025-12-15 09:15 |
| **Closed** | 2025-12-15 09:15 |
| **Labels** | agent:Parker_Pages, category:enhancement, status:in-progress, type:post-completion |

### Description

Login page has pre-filled demo credentials (moderator@fleetfeast.com / Admin123!). Review if this is intentional for development or should be removed for security.

---

## 📋 Fleet-Feast-vhl Verify heading hierarchy across all pages

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ☕ Low (P3) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 20:16 |
| **Updated** | 2025-12-07 20:35 |
| **Closed** | 2025-12-07 20:35 |
| **Labels** | domain:accessibility, phase:post-launch, status:in-progress, type:gap-important |

### Description

Run automated accessibility audit to verify heading hierarchy has no skipped levels (e.g., H1 to H3). Use axe DevTools or Lighthouse. WCAG 1.3.1 Level A.

---

## 📋 Fleet-Feast-2xv Knowledge Base Setup

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | ☕ Low (P3) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-04 19:02 |
| **Updated** | 2025-12-05 05:28 |
| **Closed** | 2025-12-05 05:28 |

### Description

Set up customer-facing knowledge base: FAQ, how-to guides, troubleshooting, contact support. Search functionality, categorization. Agent: Kendall_Knowledge.

### Dependencies

- ⛔ **blocks**: `Fleet-Feast-qjr`

---

## 📋 Fleet-Feast-s2t Optimize for mobile landscape orientation

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 💤 Backlog (P4) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 20:14 |
| **Updated** | 2025-12-07 20:35 |
| **Closed** | 2025-12-07 20:35 |
| **Labels** | area:responsive, status:in-progress, type:enhancement |

### Description

Test and optimize all pages for mobile landscape orientation. Add orientation media queries where needed and adjust min-height values for landscape viewports. Test particularly on forms and dashboards.

---

## 📋 Fleet-Feast-2za Add horizontal scroll indicators for mobile

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 💤 Backlog (P4) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 20:14 |
| **Updated** | 2025-12-07 20:35 |
| **Closed** | 2025-12-07 20:35 |
| **Labels** | area:ux, status:in-progress, type:enhancement |

### Description

Add visual indicators (shadows/gradients) when content is horizontally scrollable to improve mobile UX. Implement using mask-image linear gradients on scrollable containers.

---

## 📋 Fleet-Feast-280 Add slide-in animation for mobile filter drawer

| Property | Value |
|----------|-------|
| **Type** | 📋 task |
| **Priority** | 💤 Backlog (P4) |
| **Status** | ⚫ closed |
| **Created** | 2025-12-07 20:14 |
| **Updated** | 2025-12-07 20:35 |
| **Closed** | 2025-12-07 20:35 |
| **Labels** | area:ux, status:in-progress, type:enhancement |

### Description

Add slide-in animation for mobile filter drawer to improve user experience. Suggested implementation: transition-transform duration-300 with translate-x-full for hidden state.

---

