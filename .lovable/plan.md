
## Plan: Business Benefits Page + Downloadable PDF Brochure

### What we're building
1. A new public-facing page `/platform-overview` with a polished brochure-style layout covering all platform benefits & dashboard features for businesses
2. A "Download PDF" button that generates and downloads a formatted PDF using the browser's print-to-PDF API (no extra library needed)
3. Add a link to this page from the homepage and navbar

---

### Content to include (pulled from codebase)

**Benefits for Businesses:**
- Verified business profile with logo, gallery, hours, map location
- Product/shop catalog with online orders and payment (Paystack)
- Menu management (restaurants) with item categories and pricing
- Room management & booking system (hotels)
- Event creation, ticketing, and calendar view
- Job posting, applicant tracking, and hiring pipeline
- Lead capture forms, CRM kanban board, and activity timeline
- Ad campaigns with A/B testing, ROI tracking, and smart recommendations
- Customer reviews with authenticity scoring and public responses
- Analytics dashboard: profile views, leads, ratings, view trends
- Business verification badge (trust signal for customers)
- Subscription plans: Free → Pro (GHS 99) → Business (GHS 299)

**Dashboard features:**
- Profile views this month (vs. last month trend)
- Total leads & leads this month
- Active job listings & total applications
- Average star rating & total reviews
- 7-day views trend chart
- Quick Actions: Edit Profile, Run Ads, Post Job, View Leads, Manage Shop/Menu/Rooms, Analytics
- Recent leads list
- Recent reviews list
- Profile completeness score

---

### Files to create/modify

**Create `src/pages/PlatformOverview.tsx`:**
- Hero section: "Everything Your Business Needs to Grow in Ghana"
- Benefits section with bullet lists (Business, Customers, Government)
- Dashboard features section with icon grid
- Pricing tiers summary
- "Download Brochure (PDF)" button using `window.print()` with a `@media print` stylesheet
- Print-specific CSS via a `<style>` tag injected into `<head>` (hide navbar/footer, format cleanly)
- "Register Your Business" and "View Pricing" CTAs

**Modify `src/App.tsx`:**
- Add route `/platform-overview`

**Modify `src/components/Navbar.tsx`:**
- Add "Why GHKonect" link pointing to `/platform-overview`

**Modify `src/index.css` or inline in component:**
- `@media print` styles: hide nav, footer, buttons; show full content; page breaks; A4 layout

---

### PDF Generation approach
Use `window.print()` — no external library needed. The page will have a dedicated print stylesheet that:
- Hides navbar, footer, download button, and all interactive elements
- Formats content as a clean A4 brochure with the GHKonect logo and brand colors
- Adds page headers and footers with platform URL

This works in all browsers and produces a professional PDF via "Save as PDF" in the print dialog, which we'll auto-trigger.
