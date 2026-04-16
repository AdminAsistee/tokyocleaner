# Native Booking Flow — Implementation Plan

## Goal

Build a complete, in-house booking flow directly inside the TokyoCleaner Customer Portal (Next.js) that replaces Calendly entirely. When a logged-in customer clicks **"Book a Cleaning"**, they are guided through a multi-step wizard that collects all the information currently captured via the AppSheet admin view — and submits a Stripe payment — without ever leaving `tokyocleaner.com`.

---

## Background & Context

### What the AppSheet Admin View Currently Captures

Based on the screenshot shared, every booking record contains:

| Field | Source | Notes |
|-------|--------|-------|
| Name | Customer profile | Auto-filled from logged-in user |
| Service | Dropdown | e.g. "Recurring Client", "Express Cleaning" |
| Date | Calendar picker | e.g. 4/2/2026 |
| Time | Time picker | e.g. 9:00 AM |
| Address | Property profile | e.g. "Shinjuku-ku 3-6-5 Nishiwaseda Weave place" |
| Room Number | Property profile | e.g. 1102 |
| Google Link | Property profile | Maps URL |
| Building Photo | Property profile | Uploaded image |
| Phone | Customer profile | e.g. 81 70-9071-1376 |
| Email | Customer profile | e.g. anastasia@gmail.com |
| Payment Type | Stripe checkout | "Credit Card" |
| Custom Price | Stripe / backend | e.g. ¥9,768 |
| Status | System-managed | Pending → Confirmed → Completed |
| Is Complete | System-managed | Yes / No |
| Notes | Free text | e.g. "2 hours" |
| Booking Date | Auto-generated | Date the booking was created |
| Assigned Cleaner | Admin-only | Staff ID, Date, Day, Hours, Payout, Transportation |

### Existing Database Schema (Supabase/PostgreSQL)

**`bookings` table columns:**
`id`, `source`, `customer_id`, `client_id`, `property_id`, `service_type`, `scheduled_date`, `scheduled_time`, `hours`, `cleaning_price`, `linen_price`, `custom_price`, `payment_type`, `status`, `is_complete`, `email_sent`, `line_sent`, `notes`, `booking_date`, `updated_at`, `customer_email`

**`properties` table columns:**
`id`, `client_id`, `customer_id`, `name`, `address`, `room_number`, `google_maps_url`, `building_photo_url`, `property_active`, ... `access_code`, `key_box_location`, `building_entrance`, `vacuum_available`, `access_notes`, ...

**`staff` table columns:**
`id`, `display_name`, `full_name`, `email`, `phone`, `is_active`, `base_payout`, `base_transport`, ...

### Existing Frontend Pages

| Route | Status | Notes |
|-------|--------|-------|
| `/login` | ✅ Done | Magic link auth via Supabase |
| `/dashboard` | ✅ Done | Welcome card, upcoming cleaning, recent orders |
| `/dashboard/orders` | ✅ Done | Full order history table with status badges |
| `/dashboard/orders/[id]` | ✅ Done | Order detail with photos, staff, contact form |
| `/dashboard/property` | ✅ Done | Property list (currently mock data) |
| `/dashboard/property/register` | ✅ Done | Multi-section registration form |
| `/dashboard/settings` | ✅ Done | Account name & phone editing |
| `/dashboard/book` | ❌ NEW | **This is what we are building** |

---

## User Review Required

> [!IMPORTANT]
> **Stripe Integration Scope:** This plan includes the full Stripe Checkout flow (credit card collection + payment confirmation). Your backend engineers will need a **Stripe account** with API keys. Do you already have a Stripe account set up for TokyoCleaner, or should we plan for that setup?

> [!IMPORTANT]
> **Service Types & Pricing:** The booking form needs a list of available services and their prices. Based on the CSV data, services include "Express Cleaning", "Recurring Client", etc. Should pricing be:
> - **Fixed per service type** (e.g. Express = ¥8,000, Recurring = ¥6,500)?
> - **Calculated by hours** (e.g. ¥4,000/hour)?
> - **Custom quote** (admin sets price after booking)?

> [!WARNING]
> **Available Time Slots:** The native calendar needs to know which dates/times are available. Currently there is no "availability" table in the database. Options:
> - **Option A:** Show all time slots (9AM–5PM) and let admin confirm/reject.
> - **Option B:** Build an availability system where admin blocks out dates (more complex, adds ~1 week).
> - **Recommendation:** Start with Option A for the MVP.

---

## Proposed Changes

### 1. Booking Wizard UI (Frontend — Next.js)

A new multi-step booking page at `/dashboard/book` with 4 steps:

#### [NEW] [page.tsx](file:///c:/Users/admin/OneDrive/Documents/tokyocleaner-customer/portal/src/app/dashboard/book/page.tsx)
Server component that fetches the user's properties from Supabase and passes them to the client component.

#### [NEW] [BookingClient.tsx](file:///c:/Users/admin/OneDrive/Documents/tokyocleaner-customer/portal/src/app/dashboard/book/BookingClient.tsx)
Client component implementing a 4-step wizard:

**Step 1 — Select Property**
- Shows list of user's registered properties (fetched from `properties` table)
- Each property card shows: Name, Address, Room Number
- "Add New Property" button links to `/dashboard/property/register`
- If user has only 1 property, auto-select it

**Step 2 — Select Service & Schedule**
- Service type dropdown (Express Cleaning, Regular Cleaning, Deep Cleaning)
- Calendar date picker (blocks past dates)
- Time slot selector (morning: 9AM/10AM/11AM, afternoon: 1PM/2PM/3PM)
- Estimated hours selector (1h, 2h, 3h, 4h)
- Notes textarea for special instructions

**Step 3 — Review & Price**
- Summary card showing all selections
- Price breakdown (service fee + any add-ons)
- Customer info auto-filled (name, email, phone from profile)
- Property info auto-filled (address, room, building photo)
- Edit buttons to go back to any step

**Step 4 — Payment (Stripe)**
- Stripe Elements embedded credit card form
- "Pay ¥X,XXX" button
- On success: creates booking record in `bookings` table with `status: 'pending'`
- Redirects to confirmation page

---

### 2. Stripe Integration (Backend — FastAPI / Next.js API Route)

#### [NEW] [route.ts](file:///c:/Users/admin/OneDrive/Documents/tokyocleaner-customer/portal/src/app/api/create-checkout/route.ts)
Next.js API route that creates a Stripe PaymentIntent:
- Receives: `property_id`, `service_type`, `scheduled_date`, `scheduled_time`, `hours`, `notes`
- Calculates price based on service type and hours
- Creates a Stripe PaymentIntent with the calculated amount
- Returns `client_secret` to the frontend for Stripe Elements

#### [NEW] [route.ts](file:///c:/Users/admin/OneDrive/Documents/tokyocleaner-customer/portal/src/app/api/confirm-booking/route.ts)
Next.js API route called after successful Stripe payment:
- Receives: `payment_intent_id` + booking details
- Verifies payment status with Stripe API
- Inserts a new row into `bookings` table with all fields populated
- Sets `status: 'pending'`, `payment_type: 'Credit Card'`, `booking_date: NOW()`
- Returns the new booking ID

> [!NOTE]
> For the MVP, these API routes live inside Next.js. When the backend team builds the FastAPI server, these routes can be migrated to FastAPI endpoints. The Stripe logic is identical — just a different HTTP framework.

---

### 3. Confirmation Page

#### [NEW] [page.tsx](file:///c:/Users/admin/OneDrive/Documents/tokyocleaner-customer/portal/src/app/dashboard/book/confirmation/page.tsx)
A beautiful confirmation screen shown after successful booking:
- Large green checkmark animation
- "Booking Confirmed!" heading
- Summary of what was booked (date, time, property, service)
- Booking reference number (TC-XXXXXX)
- "View My Orders" button → `/dashboard/orders`
- "Back to Dashboard" button → `/dashboard`

---

### 4. Navigation Updates

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/admin/OneDrive/Documents/tokyocleaner-customer/portal/src/components/Sidebar.tsx)
- Add a prominent "Book Now" button/nav item to the sidebar
- Style it with the teal accent color to make it stand out

#### [MODIFY] [DashboardClient.tsx](file:///c:/Users/admin/OneDrive/Documents/tokyocleaner-customer/portal/src/app/dashboard/DashboardClient.tsx)
- Update the existing "Book a Cleaning" card to link to `/dashboard/book` instead of opening Calendly
- Remove all Calendly URL references

---

### 5. Database Changes

#### Supabase SQL Migration
```sql
-- Add a service_prices table for configurable pricing
CREATE TABLE IF NOT EXISTS service_prices (
  id SERIAL PRIMARY KEY,
  service_type TEXT NOT NULL UNIQUE,
  base_price INTEGER NOT NULL,        -- in JPY
  price_per_hour INTEGER DEFAULT 0,   -- additional hourly rate
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial pricing
INSERT INTO service_prices (service_type, base_price, price_per_hour) VALUES
  ('Express Cleaning', 8000, 4000),
  ('Regular Cleaning', 6500, 3500),
  ('Deep Cleaning', 12000, 5000);

-- Add stripe_payment_id to bookings for payment tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;
```

---

## File Summary

| Action | File | Purpose |
|--------|------|---------|
| NEW | `/dashboard/book/page.tsx` | Server component — fetches user properties |
| NEW | `/dashboard/book/BookingClient.tsx` | 4-step booking wizard UI |
| NEW | `/dashboard/book/confirmation/page.tsx` | Post-payment success page |
| NEW | `/api/create-checkout/route.ts` | Stripe PaymentIntent creation |
| NEW | `/api/confirm-booking/route.ts` | Payment verification + DB insert |
| MODIFY | `Sidebar.tsx` | Add "Book Now" nav item |
| MODIFY | `DashboardClient.tsx` | Replace Calendly link with `/dashboard/book` |
| SQL | Supabase migration | `service_prices` table + `stripe_payment_id` column |

---

## Open Questions

> [!IMPORTANT]
> 1. **Do you have a Stripe account?** We need API keys (publishable + secret) to integrate payments.
> 2. **How should pricing work?** Fixed per service, hourly rate, or admin-set custom quotes?
> 3. **Should we show all time slots or only available ones?** Option A (all slots, admin confirms) is faster to build.
> 4. **Should this be built now as a mockup** (like the rest of the portal, with simulated payments) **or as a fully functional flow** with real Stripe integration?

---

## Verification Plan

### Automated Tests
- Navigate through all 4 steps of the wizard via browser testing
- Verify form validation (no empty property, no past dates, required fields)
- Confirm booking record appears in Supabase `bookings` table after submission
- Verify the new booking shows up in `/dashboard/orders`

### Manual Verification
- Complete a full booking flow end-to-end using Stripe test mode
- Confirm the booking appears identically to existing bookings in the orders list
- Verify mobile responsiveness of the booking wizard
- Test JP/EN language toggle across all steps
