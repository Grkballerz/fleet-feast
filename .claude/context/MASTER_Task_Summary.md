# MASTER Task Summary - Fleet Feast
Generated: 2025-12-20
Source: Beads Issue Tracker

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Issues | 170 |
| Open | 37 |
| Closed | 133 |
| Blocked | 35 |
| Ready to Work | 2 |

---

## Enhancement #1: Inquiry-Proposal Booking Flow (22 tasks)

**Summary:** Replace direct booking with inquiry-to-proposal messaging flow.

### New Booking Flow
1. Customer submits inquiry (no price)
2. Vendor sends proposal with pricing
3. Customer accepts/declines
4. If accepted, customer pays

---

## Enhancement #2: Helcim Payment Integration (15 tasks)

**Summary:** Replace Stripe with Helcim payment processor. Internal escrow ledger with manual vendor payouts.

### New Payment Architecture
- **Customer Payments:** Helcim.js embedded fields
- **Escrow:** Internal ledger tracking (no Stripe Connect)
- **Vendor Payouts:** Manual ACH/EFT to vendor bank accounts
- **Fee Split:** 5% customer + 5% vendor = 10% platform fee

---

## Phase Overview

### Phase 1: Database Schema (7 tasks)

| ID | Title | Agent | Priority | For |
|----|-------|-------|----------|-----|
| Fleet-Feast-5vo | Update BookingStatus enum | Dana_Database | P0 | Proposal |
| Fleet-Feast-y1r | Add proposal fields to Booking | Dana_Database | P0 | Proposal |
| Fleet-Feast-tp2 | Add proposal notification types | Dana_Database | P0 | Proposal |
| Fleet-Feast-exf | Create Prisma migration | Dana_Database | P0 | Proposal |
| Fleet-Feast-bb0 | Remove Stripe dependencies | Blake_Backend | P0 | Helcim |
| Fleet-Feast-0jt | Add vendor bank account fields | Dana_Database | P0 | Helcim |
| Fleet-Feast-ndn | Create escrow ledger models | Dana_Database | P0 | Helcim |

### Phase 2: API & Backend (12 tasks)

| ID | Title | Agent | Priority | For |
|----|-------|-------|----------|-----|
| Fleet-Feast-dpx | POST /api/inquiries | Ellis_Endpoints | P0 | Proposal |
| Fleet-Feast-eay | POST /api/bookings/:id/proposal | Ellis_Endpoints | P0 | Proposal |
| Fleet-Feast-9ji | POST /api/bookings/:id/accept | Ellis_Endpoints | P0 | Proposal |
| Fleet-Feast-cuk | POST /api/bookings/:id/decline | Ellis_Endpoints | P0 | Proposal |
| Fleet-Feast-coe | Update booking types/validation | Blake_Backend | P0 | Proposal |
| Fleet-Feast-fjp | 50/50 payment fee split | Blake_Backend | P0 | Both |
| Fleet-Feast-1p1 | Install Helcim SDK | Blake_Backend | P0 | Helcim |
| Fleet-Feast-rpi | Helcim payment API endpoints | Ellis_Endpoints | P0 | Helcim |
| Fleet-Feast-zt6 | Helcim webhook handler | Ellis_Endpoints | P0 | Helcim |
| Fleet-Feast-602 | Vendor bank account API | Ellis_Endpoints | P0 | Helcim |
| Fleet-Feast-f3y | Vendor payout scheduling system | Blake_Backend | P0 | Helcim |

### Phase 3: Components & Pages (13 tasks)

| ID | Title | Agent | Priority | For |
|----|-------|-------|----------|-----|
| Fleet-Feast-vwa | ProposalCard component | Casey_Components | P1 | Proposal |
| Fleet-Feast-skd | ProposalBuilder component | Casey_Components | P1 | Proposal |
| Fleet-Feast-b4t | InquiryForm component | Casey_Components | P1 | Proposal |
| Fleet-Feast-88e | Update /customer/booking page | Parker_Pages | P0 | Proposal |
| Fleet-Feast-l33 | Update /customer/messages page | Parker_Pages | P0 | Proposal |
| Fleet-Feast-cyi | Update /vendor/messages page | Parker_Pages | P0 | Proposal |
| Fleet-Feast-ea8 | Update booking list pages | Parker_Pages | P1 | Proposal |
| Fleet-Feast-6ea | Notification triggers & emails | Morgan_Middleware | P1 | Proposal |
| Fleet-Feast-67o | HelcimPaymentForm component | Casey_Components | P1 | Helcim |
| Fleet-Feast-uvzu | VendorBankAccountForm component | Casey_Components | P1 | Helcim |
| Fleet-Feast-u0h3 | Update payment page for Helcim | Parker_Pages | P0 | Helcim |
| Fleet-Feast-mnxj | Vendor payout settings page | Parker_Pages | P0 | Helcim |
| Fleet-Feast-qemg | Admin payout dashboard | Parker_Pages | P1 | Helcim |

### Phase 4: Testing & Integration (5 tasks)

| ID | Title | Agent | Priority | For |
|----|-------|-------|----------|-----|
| Fleet-Feast-db3 | Unit tests for booking service | Taylor_Tester | P1 | Proposal |
| Fleet-Feast-4ln | Integration tests for APIs | Taylor_Tester | P1 | Proposal |
| Fleet-Feast-1y0 | E2E tests for booking flow | Quinn_QA | P1 | Proposal |
| Fleet-Feast-wsl | Integration verification (proposal) | Jordan_Junction | P0 | Proposal |
| Fleet-Feast-jwyf | Tests for Helcim integration | Taylor_Tester | P1 | Helcim |
| Fleet-Feast-azl4 | Integration verification (Helcim) | Jordan_Junction | P0 | Helcim |

---

## Ready to Start (No Blockers)

```
1. [P0] Fleet-Feast-5vo: Update BookingStatus enum with inquiry-proposal flow statuses
2. [P0] Fleet-Feast-bb0: Remove Stripe dependencies and clean up Stripe-specific code
```

Both can be worked on in **parallel** as they're independent.

---

## Dependency Graph

```
                    PROPOSAL FLOW                          HELCIM INTEGRATION
                    ─────────────                          ──────────────────
                         │                                        │
                        5vo                                      bb0
                    (BookingStatus)                       (Remove Stripe)
                    ┌────┴────┐                          ┌────┴────┐
                   y1r      tp2                        0jt       ndn      1p1
                (Fields)  (Notif)                    (Bank)   (Escrow)  (SDK)
                    └────┬────┘                         │         │       │
                        exf                             └────┬────┘       │
                    (Migration)                              │            │
           ┌────┬────┬────┴────┐                           602           │
         dpx  eay  cuk      coe                        (Bank API)        │
        (API) (API)(API)  (Types)                            │      ┌────┴────┐
           │    │    │       │                               │     rpi      zt6
           │    │    └───────┤                               │   (Pay API) (Webhook)
           │    │            │                               │       │
           │   9ji ──────► fjp ◄──────────────────────────── │ ──────┘
           │  (Accept)    (Fee Split)                        │
           │                 │                               │
           │    ┌────────────┴─────────────┐                f3y
           │   vwa  skd  b4t              67o  uvzu      (Payouts)
           │ (Card)(Build)(Form)        (Helcim)(Bank)       │
           │    │    │     │               │     │           │
           └────┴────┴─────┤               │     │           │
                           │               └─────┼───────────┤
              ┌────────────┴───────────┐         │           │
             88e  l33  cyi  ea8  6ea  u0h3     mnxj        qemg
           (Pages for Proposal)      (Payment) (Settings) (Admin)
                    │                    │         │         │
                    │                    └─────────┴─────────┤
              ┌─────┴─────┐                                  │
            db3  4ln  1y0                                  jwyf
            (Tests)                                    (Helcim Tests)
                │                                            │
               wsl ◄─────────────────────────────────────► azl4
        (Proposal Verify)                           (Helcim Verify)
```

---

## Live Queries

```bash
# Ready to work (no blockers)
bd ready

# All open tasks
bd list --status open

# By enhancement
bd list --label type:post-completion --status open

# By agent
bd list --label agent:Dana_Database --status open
bd list --label agent:Blake_Backend --status open
bd list --label agent:Ellis_Endpoints --status open

# Show dependencies for a task
bd show Fleet-Feast-<id>
```

---

## Execution Recommendation

**Parallel Track Approach:**

1. **Track A (Proposal Flow):** Start with `Fleet-Feast-5vo`
2. **Track B (Helcim Integration):** Start with `Fleet-Feast-bb0`

Both tracks converge at `Fleet-Feast-fjp` (50/50 fee split) which depends on both.

---

*Last Updated: 2025-12-20 | 37 new tasks total (22 proposal + 15 Helcim)*
