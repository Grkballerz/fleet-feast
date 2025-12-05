# Fleet Feast Admin Guide

Welcome to the Fleet Feast administrative system. This guide covers all platform management functions.

---

## Table of Contents

1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [Vendor Management](#vendor-management)
3. [User Management](#user-management)
4. [Booking Oversight](#booking-oversight)
5. [Dispute Resolution](#dispute-resolution)
6. [Violation Management](#violation-management)
7. [Platform Analytics](#platform-analytics)
8. [Platform Settings](#platform-settings)
9. [Reports and Exports](#reports-and-exports)
10. [Admin Best Practices](#admin-best-practices)

---

## Admin Dashboard Overview

### Accessing the Admin Panel

1. Log in with your admin credentials
2. You'll automatically land on the admin dashboard
3. Different view from customer/vendor dashboards

### Dashboard Layout

**Key Metrics (Top Cards)**
- Active Users (customers + vendors)
- Total Bookings (this month)
- Platform Revenue (GMV and commission)
- Pending Actions (items requiring admin attention)

**Quick Actions**
- Pending vendor applications
- Open disputes
- Flagged violations
- Recent escalations

**Activity Feed**
- Recent bookings
- New user registrations
- Vendor approvals/rejections
- Dispute resolutions
- System alerts

### Navigation Menu

**Main Sections:**
- **Dashboard**: Overview and metrics
- **Vendors**: Application queue, vendor management
- **Users**: Customer and vendor user management
- **Bookings**: All platform bookings
- **Disputes**: Active and resolved disputes
- **Violations**: Flagged anti-circumvention attempts
- **Analytics**: Platform-wide reports
- **Settings**: Platform configuration

---

## Vendor Management

### Vendor Application Queue

**Accessing Applications:**
1. Go to **Vendors** → **Pending Applications**
2. See list of vendors awaiting approval

**Application Details View:**
Each application shows:
- Vendor business name
- Submission date
- Application status (new, under review, needs info)
- Completeness indicator

### Reviewing Applications

**Step-by-Step Review:**

1. Click on a pending application
2. Review submitted information:

**Business Information**
- Legal business name
- DBA name
- Tax ID / EIN
- Business address
- Years in operation
- Business description

**Required Documents**
Review each document for:

| Document | What to Check |
|----------|--------------|
| Business License | Valid, current, matches business name |
| Health Permit | Current, not expired, correct jurisdiction |
| Liability Insurance | Minimum $1M coverage, current, names business |
| Food Handler Certs | Valid, covers all food handlers |
| Truck Photos | Clear, shows truck exterior and condition |

**Red Flags:**
- Expired permits or licenses
- Insufficient insurance coverage
- Blurry or unreadable documents
- Mismatched business names
- Missing required documents
- Evidence of prior violations

**Menu and Pricing**
- Menu is complete and appropriate
- Pricing is reasonable
- Clear cuisine categorization
- Appropriate for target market

**Capacity and Service Area**
- Realistic capacity ranges
- Service area matches NYC/approved zones

### Approving Vendors

**If Application is Complete and Valid:**

1. Click **Approve Application**
2. Optionally add welcome note to vendor
3. Confirm approval
4. Vendor receives approval email
5. Vendor profile goes live immediately

**Post-Approval:**
- Vendor can start receiving bookings
- Profile appears in customer search
- Vendor added to active vendor list

### Requesting Additional Information

**If Documents are Missing or Unclear:**

1. Click **Request More Information**
2. Select which items need clarification:
   - Specific documents to resubmit
   - Information to clarify
   - Issues to address
3. Write clear message explaining what's needed
4. Click **Send Request**

**Vendor Receives:**
- Email with your request
- Notification in their dashboard
- Ability to resubmit

**When Vendor Resubmits:**
- Application returns to your queue
- Review the new/updated information
- Approve or request additional info again

### Rejecting Applications

**Valid Reasons for Rejection:**
- Fraudulent information
- Business not properly licensed
- Insurance insufficient
- Operating outside approved service area
- Failed background check
- Prior platform ban

**How to Reject:**

1. Click **Reject Application**
2. Select rejection reason (required)
3. Write detailed explanation
4. Check if vendor can reapply (usually yes, once issues resolved)
5. Confirm rejection

**Vendor Receives:**
- Email with rejection reason
- Explanation of what needs to be fixed
- Reapplication eligibility information

### Managing Active Vendors

**Vendor List:**
- All approved vendors
- Search and filter capabilities
- Sort by: join date, rating, booking volume, status

**Vendor Actions:**

**View Vendor Profile**
- See their public-facing profile
- Check ratings and reviews
- View booking history
- See violation history

**Edit Vendor Information**
- Update contact details (if needed)
- Correct profile information
- Adjust service area
- Modify status

**Suspend Vendor**
- Temporarily disable account
- Prevents new bookings
- Existing bookings remain active
- Vendor notified of suspension
- Used for: investigations, policy violations, quality issues

**Reactivate Vendor**
- Restore suspended account
- Re-enable booking acceptance
- Vendor notified of reactivation

**Permanently Ban Vendor**
- Disable account permanently
- Prevent all future access
- Used for: severe violations, fraud, repeated offenses
- Cannot be undone (creates new account block)

**Handling Violations**
See [Violation Management](#violation-management) section

---

## User Management

### User Overview

**User Types:**
- **Customers**: Book food trucks
- **Vendors**: Provide catering services
- **Admins**: Platform administrators

### Viewing Users

**User List:**
1. Go to **Users** → **All Users**
2. See complete user directory
3. Filter by:
   - User type (customer, vendor, admin)
   - Account status (active, suspended, banned)
   - Join date
   - Activity level

**User Details:**
Click any user to view:
- Account information
- Booking history (customers)
- Vendor profile (vendors)
- Violation history
- Account status
- Recent activity

### Customer Management

**Customer Profile View:**
- Full name and email
- Join date and verification status
- Total bookings
- Favorite vendors
- Review history
- Violation history

**Customer Actions:**

**Reset Password**
- Generate password reset link
- Send to customer's email
- Use for: forgotten passwords, account recovery

**Verify Email**
- Manually verify email if verification email failed
- Use rarely; customer should verify themselves

**Suspend Account**
- Temporarily disable account
- Prevent new bookings
- Used for: violations, investigation, disputes
- Can be reversed

**Ban Account**
- Permanently disable
- Prevent all access
- Used for: fraud, severe violations, abuse
- Cannot be reversed

### Vendor User Management

Vendors have both a **user account** and a **vendor profile**.

**Managing Vendor Users:**
- Same capabilities as customer management
- Actions affect login access
- Separate from vendor profile suspension

**Coordinating Actions:**
- Suspending vendor profile = can't receive bookings
- Suspending user account = can't log in
- Usually suspend both together

### Role Management

**Admin Roles:**
Different permission levels for admin staff:

| Role | Permissions |
|------|-------------|
| Super Admin | All permissions, platform settings |
| Admin | Vendor approval, dispute resolution, user management |
| Support | View only, message users, basic assistance |
| Analytics | View reports, export data, no user actions |

**Adding Admins:**
1. Go to **Settings** → **Admin Users**
2. Click **Add Admin**
3. Enter email address
4. Assign role
5. Admin receives invitation email

**Removing Admins:**
1. Find admin in list
2. Click **Revoke Access**
3. Admin loses permissions immediately

---

## Booking Oversight

### Viewing All Bookings

**Booking List:**
1. Go to **Bookings** → **All Bookings**
2. See platform-wide bookings
3. Filter by:
   - Status (pending, confirmed, completed, cancelled, disputed)
   - Date range
   - Vendor
   - Customer
   - Amount

**Booking Statuses:**
- **Pending**: Awaiting vendor acceptance
- **Confirmed**: Accepted and paid
- **In Progress**: Event happening today
- **Completed**: Event finished, no issues
- **Disputed**: Issue reported
- **Cancelled**: Cancelled by customer or vendor

### Booking Details

Click any booking to see:
- Customer and vendor information
- Event details (date, time, location, guest count)
- Booking amount and commission
- Payment status
- Message thread between customer and vendor
- Timeline of actions
- Any disputes or issues

### Intervention Procedures

**When to Intervene:**
Admins rarely need to intervene in bookings, but situations include:
- Customer or vendor requests help
- Dispute escalation
- Payment issues
- Vendor cancellation requiring replacement
- Emergencies

**Intervention Actions:**

**Message Participants**
- Contact customer or vendor
- Provide assistance
- Mediate communication

**Cancel Booking**
- Force cancellation if needed
- Issue appropriate refunds
- Apply or waive penalties
- Document reason

**Find Replacement Vendor**
- Used when vendor cancels
- Search for available similar vendors
- Coordinate replacement
- Ensure customer satisfaction

**Adjust Payment**
- Issue partial refunds
- Add credits
- Waive platform fees (rare)
- Adjust vendor payout

**Escalate Issue**
- Flag for senior admin review
- Document situation
- Assign to specialist

### Monitoring for Issues

**Red Flags:**
- Vendor frequently late to events
- Customer frequently disputes
- Multiple cancellations
- Poor ratings trend
- Suspicious message patterns

**Proactive Monitoring:**
- Review high-value bookings
- Check new vendor first bookings
- Monitor vendors with recent violations
- Watch for pattern anomalies

---

## Dispute Resolution

### Dispute Queue

**Accessing Disputes:**
1. Go to **Disputes** → **Active Disputes**
2. See all unresolved disputes
3. Filter by:
   - Dispute type
   - Filed date
   - Amount involved
   - Priority

**Dispute Types:**
- Vendor no-show
- Late arrival
- Food quality issues
- Wrong/missing menu items
- Quantity disputes
- Professionalism issues
- Other

### Reviewing Disputes

**Dispute Details:**
- Filing party (customer or vendor)
- Opposing party
- Related booking details
- Dispute reason and description
- Evidence submitted (photos, messages)
- Timeline of events
- Automated resolution (if applicable)

**Automated Resolutions:**
Some disputes resolve automatically:
- **Vendor no-show**: 100% refund + $100 credit + $500 vendor penalty
- **30-60 min late**: 10% refund
- **60+ min late**: 25% refund

**Manual Review Required:**
- Food quality complaints
- Menu disputes
- Quantity issues
- Professionalism concerns
- Conflicting accounts

### Making Decisions

**Investigation Steps:**

1. **Review Evidence**
   - Read both parties' accounts
   - Examine message history
   - Review photos/documentation
   - Check booking details
   - Look at past history

2. **Gather Additional Information** (if needed)
   - Message customer for clarification
   - Ask vendor for explanation
   - Request additional evidence
   - Check timestamps and timelines

3. **Determine Fault**
   - Was vendor at fault?
   - Was customer unreasonable?
   - Was it miscommunication?
   - Were expectations clear?
   - What's fair resolution?

4. **Decide Resolution**

**Resolution Options:**

| Resolution | When to Use |
|------------|-------------|
| Full refund to customer | Vendor clear fault, no service provided |
| Partial refund (25-50%) | Service provided but below expectations |
| Minimal refund (10-25%) | Minor issues, service mostly acceptable |
| No refund | Customer unreasonable, vendor did nothing wrong |
| Credit instead of refund | Goodwill gesture, encourage platform usage |
| Vendor penalty | Vendor violated policies or standards |
| No penalty | Vendor not at fault or extenuating circumstances |

5. **Document Decision**
   - Write clear explanation
   - Cite evidence
   - Explain reasoning
   - Note any patterns

### Processing Resolutions

**How to Resolve:**

1. On dispute page, click **Resolve Dispute**
2. Select resolution:
   - Refund amount (0-100%)
   - Customer credit amount
   - Vendor penalty (if applicable)
   - Vendor payout adjustment
3. Write resolution explanation (both parties will see)
4. Attach any relevant notes
5. Click **Submit Resolution**

**What Happens:**
- Both parties receive notification
- Refunds/credits process automatically
- Penalties deducted from vendor payout
- Dispute marked as resolved
- Resolution logged for reference

### Communicating Decisions

**Resolution Message Template:**

```
Resolution: [Refund Amount / Credit / No Action]

After reviewing the evidence submitted by both parties:

[Summary of the situation]

[What we found]

[Why we made this decision]

[Action taken: refund/credit/penalty details]

[Any recommendations for future bookings]

This decision is final. Thank you for your understanding.

- Fleet Feast Support Team
```

**Be:**
- Professional and neutral
- Clear and specific
- Fair and evidence-based
- Consistent with past decisions

### Dispute Patterns

**Track Trends:**
- Vendors with frequent disputes
- Customers who dispute often
- Common issues by event type
- Seasonal patterns

**Use Data To:**
- Identify problem vendors
- Update policies
- Improve vendor training
- Enhance platform features

---

## Violation Management

### Anti-Circumvention System

Fleet Feast automatically scans all in-app messages for contact information sharing attempts.

**Detection Patterns:**

| Type | Examples Detected | Severity |
|------|------------------|----------|
| Phone Numbers | 123-456-7890, (123) 456-7890, 123.456.7890 | HIGH |
| Email Addresses | user@example.com, user [at] example [dot] com | HIGH |
| Social Media | @username, "find me on Instagram" | MEDIUM |
| External URLs | mywebsite.com, www.example.com | MEDIUM |
| Coded Language | "call me", "my number is", "text me" | LOW |

### Violation Queue

**Accessing Violations:**
1. Go to **Violations** → **Flagged Messages**
2. See all flagged messages requiring review

**Violation Details:**
- Message sender (customer or vendor)
- Message recipient
- Full message text
- Detected pattern(s)
- Severity level
- Timestamp
- Related booking
- Sender's violation history

### Reviewing Flagged Messages

**Review Process:**

1. **Read Full Context**
   - View entire message thread
   - Understand the conversation
   - Check if detection is accurate

2. **Determine Intent**
   - **Accidental**: Innocent mention (e.g., "call off the event")
   - **Intentional**: Clear attempt to share contact info
   - **False Positive**: System error, no violation

3. **Check History**
   - Is this user's first violation?
   - Pattern of attempts?
   - Previous warnings?

**Violation Actions:**

**False Positive (No Violation)**
- Click **Mark as False Positive**
- Message allowed through
- No penalty to user
- System learns from correction

**First Offense (Warning)**
- Click **Issue Warning**
- User receives warning notification
- Violation logged
- No suspension

**Second Offense (Suspension)**
- Click **Suspend User**
- Select duration: typically 30 days
- User account suspended
- Cannot book (customers) or accept bookings (vendors)
- Notification sent

**Third Offense (Permanent Ban)**
- Click **Ban User**
- Account permanently disabled
- All platform access revoked
- Outstanding bookings handled appropriately

### Managing Suspended Accounts

**Suspension Details:**
- Suspension start date
- Suspension end date
- Reason for suspension
- Violation history

**During Suspension:**
- User cannot create new bookings
- Existing bookings must be honored
- User can view account (read-only)
- Payouts still process

**Ending Suspension:**
- Automatic: Account reactivates after duration
- Manual: Admin can reactivate early
  - Go to user profile
  - Click **End Suspension Early**
  - Add note explaining why
  - Confirm reactivation

### Appeal Process

**When Users Appeal:**
Users can appeal violations and suspensions.

**Appeal Queue:**
1. Go to **Violations** → **Appeals**
2. See pending appeals

**Appeal Review:**
1. Read user's appeal explanation
2. Review original violation
3. Check evidence
4. Assess if decision should change

**Appeal Decisions:**

**Approve Appeal (Overturn)**
- Violation was incorrect
- Extenuating circumstances
- System error
- Click **Approve Appeal**
- Restore account
- Remove violation record
- Notify user

**Deny Appeal (Uphold)**
- Violation was correct
- Evidence is clear
- Policy was violated
- Click **Deny Appeal**
- Suspension/ban remains
- Notify user with explanation

### Violation Trends

**Analytics to Monitor:**
- Violation rate over time
- Users with multiple violations
- Common violation types
- False positive rate

**Use Insights To:**
- Improve detection accuracy
- Update violation policies
- Enhance user education
- Refine messaging features

---

## Platform Analytics

### Overview Dashboard

**Key Metrics:**

**User Metrics**
- Total registered users
- Active users (last 30 days)
- New user growth rate
- User retention rate

**Vendor Metrics**
- Total approved vendors
- Active vendors (taking bookings)
- Average vendor rating
- Vendor churn rate

**Booking Metrics**
- Total bookings
- Booking volume trend
- Average booking value
- Booking completion rate

**Revenue Metrics**
- Gross Merchandise Value (GMV)
- Platform commission earned
- Average commission per booking
- Revenue growth rate

**Quality Metrics**
- Average vendor rating
- Average customer rating
- Dispute rate
- Cancellation rate

### Detailed Reports

**Revenue Reports**

1. Go to **Analytics** → **Revenue**
2. View:
   - Daily/weekly/monthly revenue
   - Commission breakdown (15% vs 10% loyalty)
   - Revenue by vendor
   - Revenue by cuisine type
   - Seasonal trends

**Booking Reports**

1. Go to **Analytics** → **Bookings**
2. Analyze:
   - Booking volume over time
   - Popular event types
   - Busy vs slow seasons
   - Average guest count
   - Booking lead time

**User Analytics**

1. Go to **Analytics** → **Users**
2. Review:
   - User acquisition sources
   - User engagement metrics
   - Customer lifetime value
   - User demographics
   - Retention cohorts

**Vendor Performance**

1. Go to **Analytics** → **Vendors**
2. Assess:
   - Top vendors by bookings
   - Top vendors by revenue
   - Top vendors by rating
   - Vendor acceptance rates
   - Vendor cancellation rates

**Platform Health**

1. Go to **Analytics** → **Health**
2. Monitor:
   - Dispute rate trends
   - Violation rate trends
   - Customer satisfaction
   - Vendor satisfaction
   - Platform stability metrics

### Custom Reports

**Creating Custom Reports:**

1. Go to **Analytics** → **Custom Reports**
2. Click **New Report**
3. Select:
   - Data source (bookings, users, vendors, revenue)
   - Date range
   - Filters (cuisine type, event type, location)
   - Metrics to include
   - Grouping (by day, week, month)
4. Generate report
5. Save for future use

**Scheduled Reports:**
- Set reports to run automatically
- Email to stakeholders
- Daily, weekly, or monthly cadence

---

## Platform Settings

### Commission Settings

**Configure Commission Rates:**

1. Go to **Settings** → **Payments**
2. Set:
   - **Standard Commission**: Default 15%
   - **Loyalty Commission**: Default 10%
   - **Minimum Booking Amount**: e.g., $100
   - **Maximum Booking Amount**: e.g., $10,000

**Changing Rates:**
- Updates apply to new bookings only
- Existing bookings use rate at time of booking
- Document reason for changes

### Cancellation Policy Settings

**Configure Cancellation Rules:**

1. Go to **Settings** → **Cancellation Policy**
2. Set refund percentages:
   - **7+ days before**: Default 100%
   - **3-6 days before**: Default 50%
   - **< 3 days before**: Default 0%

3. Set vendor penalties:
   - **7+ days before**: Default $0
   - **3-6 days before**: Default $100
   - **< 3 days before**: Default $200
   - **No-show**: Default $500

**Customer Credits:**
- Set credit amount for vendor cancellations within 3 days
- Default: $100

### Message Filtering Settings

**Configure Anti-Circumvention Detection:**

1. Go to **Settings** → **Message Filtering**
2. Enable/disable pattern types:
   - Phone number detection
   - Email detection
   - Social media detection
   - URL detection
   - Coded language detection

3. Set sensitivity levels:
   - **Strict**: More false positives, catches more violations
   - **Moderate**: Balanced (recommended)
   - **Lenient**: Fewer false positives, might miss some violations

4. Configure whitelist:
   - Allowed domains (e.g., fleetfeast.com)
   - Exception patterns

### Notification Settings

**Platform-Wide Notifications:**

1. Go to **Settings** → **Notifications**
2. Configure:
   - Email templates
   - Notification timing
   - Default opt-in/opt-out settings

**Email Templates:**
- Customize transactional emails
- Booking confirmations
- Payment receipts
- Dispute notifications
- Violation warnings

### Feature Toggles

**Enable/Disable Platform Features:**

1. Go to **Settings** → **Features**
2. Toggle:
   - New user registration (can pause signups)
   - Vendor applications (can pause new vendors)
   - Loyalty discount program
   - Quote request system
   - Review system
   - Message filtering

**Use Cases:**
- Maintenance mode
- Limiting growth during capacity constraints
- Testing new features with subset of users
- Emergency shutdowns

### Service Area Management

**Configure Geographic Coverage:**

1. Go to **Settings** → **Service Areas**
2. Manage:
   - Approved NYC boroughs
   - Surrounding areas
   - Expansion zones

**Adding New Areas:**
- Research local regulations
- Verify vendor interest
- Update service area list
- Enable for vendor selection

---

## Reports and Exports

### Exporting Data

**Available Exports:**

**User Data**
- User list with details
- Customer booking history
- Vendor performance metrics

**Booking Data**
- All bookings (filterable)
- Booking details
- Payment records

**Financial Data**
- Revenue reports
- Commission earned
- Vendor payouts
- Refund history

**Compliance Data**
- Violation records
- Dispute resolutions
- Vendor documents
- Audit logs

### Export Process

1. Navigate to relevant section (Users, Bookings, etc.)
2. Apply desired filters
3. Click **Export**
4. Select format:
   - CSV (for spreadsheets)
   - JSON (for data processing)
   - PDF (for reports)
5. Download file

### Scheduled Exports

**Automate Regular Reports:**

1. Go to **Settings** → **Scheduled Exports**
2. Click **New Scheduled Export**
3. Configure:
   - Data type
   - Filters
   - Frequency (daily, weekly, monthly)
   - Email recipients
   - Format
4. Save schedule

**Use Cases:**
- Daily booking summaries
- Weekly revenue reports
- Monthly vendor performance
- Quarterly financial statements

### Data Retention

**Retention Policies:**

| Data Type | Retention Period |
|-----------|------------------|
| User accounts | Until deletion + 30 days |
| Bookings | 7 years (tax compliance) |
| Payments | 7 years (tax compliance) |
| Messages | 3 years |
| Reviews | Indefinite (while accounts active) |
| Violations | 5 years |
| Disputes | 5 years |

**Data Deletion:**
- Automated per retention policy
- Manual deletion for GDPR/CCPA requests
- Anonymization vs full deletion

---

## Admin Best Practices

### Decision-Making Framework

**Consistency is Key:**
- Treat similar situations similarly
- Document decisions for reference
- Review past cases before deciding
- Build precedents

**Fairness:**
- Consider both parties equally
- Base decisions on evidence
- Remove personal bias
- Explain reasoning clearly

**Platform Health:**
- Prioritize user trust
- Maintain quality standards
- Balance vendor and customer needs
- Think long-term impact

### Vendor Application Review

**Quality Over Quantity:**
- Thoroughly verify documents
- Don't rush approvals
- Better to request more info than approve questionable applications
- Protect platform reputation

**Communication:**
- Be clear in information requests
- Provide specific examples
- Be professional and helpful
- Give vendors clear path to approval

### Dispute Resolution

**Investigation Thoroughness:**
- Review all evidence carefully
- Don't make snap judgments
- Ask clarifying questions
- Consider context

**Communication:**
- Explain decisions clearly
- Be empathetic but firm
- Provide specific reasons
- Remain professional

**Timeliness:**
- Resolve disputes within 3-5 business days
- Longer delays frustrate both parties
- Communicate if investigation needs more time

### Violation Management

**Proportional Response:**
- First offenses: educate and warn
- Repeated offenses: progressive penalties
- Severe offenses: immediate action
- Consider intent and history

**False Positives:**
- Review carefully before penalizing
- Better to err on side of caution
- Improve detection algorithms based on false positives

**Pattern Recognition:**
- Watch for repeat violators
- Identify new evasion tactics
- Update detection rules
- Share patterns with team

### User Communication

**Tone:**
- Professional but friendly
- Clear and concise
- Empathetic when appropriate
- Firm when necessary

**Response Time:**
- Acknowledge within 24 hours
- Resolve within appropriate timeframe
- Set expectations if delay needed

**Documentation:**
- Log all communications
- Track promises made
- Follow up on commitments

### Data Security

**Access Control:**
- Only access data you need
- Don't share admin credentials
- Log out when not in use
- Report suspicious activity

**Privacy:**
- Respect user privacy
- Don't share personal information externally
- Follow GDPR/CCPA requirements
- Handle data requests properly

**Compliance:**
- Follow data retention policies
- Process deletion requests promptly
- Maintain audit trails
- Document compliance actions

---

## Common Scenarios

### Scenario 1: Vendor Cancels Last Minute

**Situation:** Vendor cancels 2 days before event due to truck breakdown.

**Steps:**
1. Verify vendor's claim (request evidence of breakdown)
2. Apply $200 cancellation penalty to vendor
3. Search for replacement vendors with similar cuisine
4. Contact customer with options:
   - Accept replacement vendor (no charge)
   - Full refund + $100 credit
5. If customer accepts replacement:
   - Coordinate with replacement vendor
   - Ensure pricing matches or is better
   - Monitor to ensure successful fulfillment
6. If customer declines replacement:
   - Process full refund
   - Apply $100 credit to account
7. Document incident on vendor's record
8. Monitor vendor for pattern of cancellations

### Scenario 2: Customer Reports Food Quality Issue

**Situation:** Customer complains food was cold and undercooked.

**Steps:**
1. Review dispute filing details
2. Check if customer has photos/evidence
3. Review message thread for prior complaints during event
4. Contact vendor for their account
5. Check vendor's recent reviews for similar issues
6. If vendor confirms issue:
   - Issue 25-50% refund based on severity
   - No vendor penalty if isolated incident
   - Encourage vendor to improve
7. If vendor disputes:
   - Weigh evidence from both sides
   - Check if customer has history of false claims
   - Decide based on credibility and evidence
8. Issue decision within 3 business days
9. Monitor vendor's future events for quality

### Scenario 3: Multiple Contact Info Sharing Attempts

**Situation:** Customer flagged 3 times trying to share phone number with different vendors.

**Steps:**
1. Review all flagged messages
2. Confirm intentional attempts (not false positives)
3. Check customer's booking history
4. First offense: Issue warning via email and dashboard
5. Second offense: 30-day suspension
6. Third offense: Permanent ban
7. Document in customer's record
8. If customer appeals:
   - Review evidence
   - Uphold unless strong reason to overturn
9. Communicate decision clearly

### Scenario 4: Vendor With Declining Ratings

**Situation:** Previously 4.8-star vendor now at 4.1 stars with recent negative reviews.

**Steps:**
1. Review recent reviews for common themes
2. Check recent booking dispute rate
3. Message vendor to discuss concerns:
   - Share specific feedback
   - Ask what's changed
   - Offer support to improve
4. Monitor next 5-10 bookings closely
5. If issues continue:
   - Consider temporary suspension
   - Require vendor to address issues
   - Create improvement plan
6. If vendor improves:
   - Acknowledge improvement
   - Continue monitoring
7. If vendor doesn't improve:
   - Consider permanent removal
   - Protect platform quality

### Scenario 5: Suspected Fraud

**Situation:** New vendor application with documents that seem falsified.

**Steps:**
1. Do NOT approve application
2. Research business name and address
3. Cross-check business license number with city records
4. Verify insurance policy with carrier
5. Check if phone number/email matches business
6. Look for red flags:
   - Stock photos instead of real truck
   - Generic email address
   - Inconsistent information
7. If fraud confirmed:
   - Reject application
   - Document reason
   - Block email/phone from future applications
   - Report to authorities if appropriate
8. If legitimate but unclear:
   - Request additional verification
   - Video call with applicant
   - Require additional documentation

---

## Emergency Procedures

### Platform-Wide Issues

**If Platform is Down:**
1. Assess the issue
2. Notify technical team
3. Post status update on status page
4. Monitor user reports
5. Communicate ETA for resolution
6. Follow up when resolved

**If Payment Processing Fails:**
1. Identify scope (all payments or specific transactions)
2. Contact Stripe support
3. Prevent new bookings until resolved
4. Communicate with affected users
5. Process payments manually if needed
6. Document incident

### User Safety Issues

**If Event Safety Concern Reported:**
1. Immediately contact parties involved
2. Assess severity
3. If imminent danger:
   - Advise to contact local authorities
   - Escalate to senior management
4. Document incident thoroughly
5. Follow up after resolution
6. Review vendor if safety violation

### Data Breach

**If User Data Compromised:**
1. Immediately isolate affected systems
2. Notify technical and legal teams
3. Assess scope of breach
4. Document everything
5. Follow incident response plan
6. Notify affected users per legal requirements
7. Implement fixes to prevent recurrence

### Legal Issues

**If Served Legal Notice:**
1. Do not respond directly
2. Forward immediately to legal team
3. Preserve all relevant records
4. Do not delete any data
5. Follow legal team's instructions
6. Document chain of custody

---

## Support Resources

### Internal Documentation

- **Policy Manual**: Detailed platform policies
- **Decision Database**: Past dispute resolutions for reference
- **FAQ**: Common questions and answers
- **Vendor Onboarding Guide**: Vendor application standards

### Team Communication

**Admin Slack/Teams Channels:**
- #admin-general: Daily communication
- #disputes: Dispute discussion and decisions
- #vendor-approvals: Application review coordination
- #urgent: Time-sensitive issues

**Weekly Admin Meetings:**
- Review metrics and trends
- Discuss challenging cases
- Share learnings
- Policy updates

### Escalation Process

**When to Escalate:**
- Legal concerns
- High-value disputes (>$5,000)
- Platform-wide issues
- Fraud or safety concerns
- PR/reputation risks

**Who to Escalate To:**
- Senior Admin: Complex disputes
- Legal: Legal issues
- Technical: Platform bugs
- Management: Policy decisions

---

## Quick Reference

### Admin Permissions

| Action | Admin | Super Admin | Support |
|--------|-------|-------------|---------|
| Approve vendors | ✓ | ✓ | ✗ |
| Resolve disputes | ✓ | ✓ | ✗ |
| Ban users | ✓ | ✓ | ✗ |
| View analytics | ✓ | ✓ | ✓ |
| Change settings | ✗ | ✓ | ✗ |
| Export data | ✓ | ✓ | ✗ |
| Message users | ✓ | ✓ | ✓ |

### Response Time Targets

- **Vendor applications**: 3-5 business days
- **Disputes**: 3-5 business days
- **Violation appeals**: 5 business days
- **User support**: 24 hours
- **Urgent issues**: Same day

### Key Policies

- Standard commission: 15%
- Loyalty commission: 10%
- Vendor cancellation penalty: $100-$500
- Violation progression: Warning → 30-day suspension → Permanent ban
- Dispute window: 7 days post-event
- Payout delay: 7 days post-event

### Contact Information

- **Technical Support**: tech@fleetfeast.com
- **Legal Team**: legal@fleetfeast.com
- **Management**: management@fleetfeast.com
- **Emergency**: emergency@fleetfeast.com

---

Thank you for maintaining the Fleet Feast platform with professionalism and integrity.

*Last updated: December 2025*
