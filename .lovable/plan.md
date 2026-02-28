
## Plan: Full-Scope Platform Document on `/platform-overview`

The user wants the existing `/platform-overview` page to be a comprehensive, no-limit full-scope document — deeply detailed on every feature, the complete dashboard breakdown, and commercial benefits. No new page or rewrite approach — enhance the existing `PlatformOverview.tsx` by **adding new sections** and **expanding existing ones** in-place.

### What to add/expand in `src/pages/PlatformOverview.tsx`

**1. Executive Summary section** (new, before hero content on the page)
- What GHKonect is, market it serves (Ghana SMEs across 16 regions), core value proposition
- "One platform replaces 6+ separate tools" statement

**2. Expand every benefits card** — 8–10 detailed bullet points each (currently 5):
- Verified Profile: add map GPS, Registrar General verification, social handles, open/closed live status, cover image, gallery up to 20 photos, video URL, response to reviews shown
- Online Shop: add cart drawer, slide-out checkout, Paystack PRD-prefix orders, product video (Cloudflare Stream), drag-and-drop image reordering, stock management, featured product badge
- Restaurant: add dietary tags, real-time toggle availability, table reservation fee collection, category groupings, featured dish spotlight
- Hotel: add room type CRUD, seasonal pricing, availability calendar, deposit vs full payment options, amenities categorised, guest special requests, enquiry handling
- Events: add QR ticket generation, capacity limits, calendar view, check-in tracking, EVT/TKT payment prefix
- Jobs: add AI job description generator, Kanban pipeline (Applied→Screened→Interview→Offer→Hired), video applications, resume database, job alerts, job boosting, applicant notes, cover letter AI
- CRM/Leads: add exit-intent popup, embedded form (copy-paste), AI lead scoring 0–100, Kanban board stages, activity timeline per lead, lead notes, email notification on new lead
- Ad Campaigns: add A/B testing variants, ROI calculator, competitor benchmarks, smart AI recommendations, CTR/impression charts, sponsored listing placement, ad alert notifications
- Reviews: add AI authenticity score per review, flag review option, public reply, sentiment breakdown, trust score
- Analytics: add 30/60/90 day view filters, line charts, traffic source breakdown, job performance chart, export CSV

**3. Complete Dashboard Deep-Dive section** (new, much more detailed than current icon grid):
Pulled directly from `BusinessDashboard.tsx`:

**Header Card:**
- Business logo (click-to-upload), name, category badge, region badge, verified badge, description preview, "View Public Page" + "Settings" buttons

**4 KPI Stat Cards (each with details):**
- Profile Views: views this month, % growth vs last month, TrendingUp/Down icon coloured green/red
- Total Leads: lifetime count + leads this month sub-stat
- Active Jobs: count of active listings + total applications received
- Rating: average star rating (e.g. 4.7) + total review count

**Quick Actions Grid (type-specific):**
- Restaurant: Manage Menu, Reservations + base actions
- Hotel: Manage Rooms, Bookings + base actions
- Retail: Manage Shop + base actions
- Services/Healthcare: Services edit + base actions
- Base actions (all types): Edit Profile, Set Hours, Post a Job, Run Ads, View Leads, Analytics, View Public Page

**Views Trend Chart:**
- 7-day line chart with cyan-to-blue gradient, XAxis dates, YAxis count, hover tooltip

**Profile Completeness Tracker:**
- % bar (cyan-to-blue gradient)
- 10 checklist items: Business logo, Cover image, Description, Phone number, Email address, Website, Business hours, Gallery images, Video, Verification badge
- "Complete Profile" CTA if < 100%

**Recent Leads Feed:**
- Avatar initial circle, name, email, status badge (new = cyan, others = grey), time ago

**Recent Reviews Feed:**
- 5-star rating row, comment preview, time ago

**Active Campaigns Panel:**
- Shows count of running ads with orange gradient icon
- "Create Your First Ad" CTA when empty
- "Manage Ads" link when active

**4. Commercial Benefits section** (new):
- Tool consolidation table: what GHKonect replaces (CRM → Leads module, Job Board → Jobs module, Booking System → Hotels/Reservations, E-commerce → Shop, Ad Platform → Campaigns, Review Platform → Reviews)
- Revenue streams unlocked: product sales 24/7, ticket sales, table reservation fees, hotel booking deposits
- Trust & discovery: verified badge = higher conversion, map listing = foot traffic, 16-region reach
- Hiring efficiency: Kanban pipeline, AI descriptions, video interviews
- Marketing ROI: A/B tested ads, competitor benchmarks, ROI calculator with revenue attribution

**5. Who Is It For section** (new):
- Restaurants, Hotels, Retail Shops, Service Businesses, Healthcare Providers, Event Organisers, Employers/Recruiters
- Each with 3–4 specific use-case bullet points

**6. Expand Pricing table** — add feature comparison rows (currently just bullet lists per plan):
- Full feature matrix: checkmarks per tier for each capability

**7. Print stylesheet update:**
- Add page breaks before each new major section
- Ensure new tables and grids render cleanly on A4

### Files to modify
- `src/pages/PlatformOverview.tsx` — add all new sections and expand benefits data array
