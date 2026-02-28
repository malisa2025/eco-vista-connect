import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Download, Building2, ShoppingBag, UtensilsCrossed, Hotel, CalendarDays,
  Briefcase, Users, BarChart3, Star, Shield, CreditCard,
  LayoutDashboard, TrendingUp, Eye, Zap,
  Globe, Phone, MapPin, Award, Target, LineChart, Megaphone,
  ArrowRight, X, Check, Layers,
  Banknote, Video, Activity, BarChart2, Mail, Image,
  ChevronRight
} from "lucide-react";
import logoImage from "@/assets/logo-ghkonect.jpg";

const PRINT_STYLES = `
@media print {
  .no-print { display: none !important; }
  nav, footer, .navbar, header, .no-print { display: none !important; }

  @page {
    size: A4;
    margin: 2.5cm 2.5cm 3cm 2.5cm;
    @bottom-center {
      content: "GHKonect Business Platform  ·  Page " counter(page) " of " counter(pages);
      font-size: 8pt;
      color: #888;
    }
  }

  body {
    margin: 0;
    padding: 0;
    font-size: 10pt;
    line-height: 1.6;
    color: #1a1a1a;
    background: #fff;
    font-family: Georgia, 'Times New Roman', serif;
    counter-reset: page;
  }

  .doc-body {
    max-width: 100%;
    background: #fff;
    color: #1a1a1a;
  }

  /* Cover page */
  .cover-page {
    page-break-after: always;
    height: 24cm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0;
  }

  /* Section breaks */
  .doc-section { page-break-before: always; }
  .doc-section:first-of-type { page-break-before: avoid; }
  .print-avoid { page-break-inside: avoid; }

  /* TOC */
  .toc-entry { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc; }

  /* Section headings */
  .section-number { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 4px; }
  .section-title { font-size: 16pt; font-weight: bold; color: #1a1a1a; margin: 0 0 6px 0; }
  .section-divider { border: none; border-top: 2px solid #1a1a1a; margin: 8px 0 18px 0; }
  .subsection-title { font-size: 12pt; font-weight: bold; color: #1a1a1a; margin: 14px 0 6px 0; border-bottom: 1px solid #ccc; padding-bottom: 3px; }

  /* Tables */
  table { border-collapse: collapse; width: 100%; font-size: 9pt; margin: 10px 0; }
  th { background: #f0f0f0 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; font-weight: bold; }
  th, td { border: 1px solid #bbb; padding: 5px 8px; text-align: left; vertical-align: top; }
  tr:nth-child(even) td { background: #fafafa; print-color-adjust: exact; -webkit-print-color-adjust: exact; }

  /* Bullet lists */
  .doc-list { margin: 6px 0; padding-left: 0; list-style: none; }
  .doc-list li { padding: 2px 0 2px 16px; position: relative; font-size: 9.5pt; color: #333; }
  .doc-list li::before { content: "•"; position: absolute; left: 4px; color: #555; }

  /* Prose */
  p { font-size: 10pt; color: #333; margin: 6px 0; }

  /* Stat grid print */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
  .stat-box { border: 1px solid #bbb; padding: 8px; text-align: center; }
  .stat-value { font-size: 18pt; font-weight: bold; display: block; }
  .stat-label { font-size: 8pt; color: #666; }

  /* Feature columns */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

  /* KPI cards print */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .kpi-card { border: 1px solid #bbb; padding: 8px; }
  .kpi-title { font-weight: bold; font-size: 9pt; }
  .kpi-detail { font-size: 8pt; color: #333; }
  .kpi-sub { font-size: 8pt; color: #666; }

  /* Checklist */
  .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
}
`;

const benefits = [
  {
    num: "2.1",
    icon: Shield,
    title: "Verified Business Profile",
    points: [
      "Official GHKonect Verified Badge — builds instant customer trust",
      "Upload business logo (click-to-upload, displayed in search results)",
      "Hero/cover image with full-width banner display on profile",
      "Photo gallery — up to 20 high-resolution images in a lightbox",
      "Intro video showcase — Cloudflare Stream-powered, plays on profile",
      "GPS map pin with precise latitude/longitude coordinates for foot traffic",
      "Registrar General document upload for government-backed verification",
      "Business hours editor — per-day open/close, holidays, special hours",
      "Live open/closed status badge shown in real-time to all visitors",
      "Social handles, website URL, phone, and email contact details",
      "Public response to customer reviews visible on your profile",
      "Verification tier badge: Standard, Premium, or Government-issued",
    ],
  },
  {
    num: "2.2",
    icon: ShoppingBag,
    title: "Online Shop & Product Catalog",
    points: [
      "Unlimited product listings with name, description, price, and category",
      "Multiple product images — drag-and-drop reordering, up to 10 per product",
      "Product video uploads via Cloudflare Stream (auto-thumbnail extraction)",
      "Featured product badge — highlight key items at top of shop",
      "Stock/inventory toggle — mark items in stock or sold out",
      "Slide-out cart drawer with quantity selector and order summary",
      "Paystack-powered checkout — all transactions carry PRD- prefix reference",
      "Order management dashboard with payment status tracking",
      "Product categories — organise catalog for easy customer navigation",
      "Product detail modal with image gallery, video, price, and Buy Now CTA",
      "Share links for individual products on social media",
      "Customer order notifications via email on successful payment",
    ],
  },
  {
    num: "2.3",
    icon: UtensilsCrossed,
    title: "Restaurant Menu Management",
    points: [
      "Full digital menu with unlimited items across multiple categories",
      "Category groupings: Starters, Mains, Desserts, Drinks, Specials, etc.",
      "Per-item availability toggle — hide sold-out dishes in real-time",
      "Dietary tags per item: Vegetarian, Vegan, Gluten-Free, Halal, Dairy-Free",
      "Featured dish spotlight — pinned to top with prominent image display",
      "Item images for every menu entry — improves order conversion rates",
      "Price display with optional description and allergen notes",
      "Online table reservation system — guests select date, time, party size",
      "Reservation fee collection via Paystack — reduces no-shows significantly",
      "Reservation management dashboard: Pending, Confirmed, Completed, Cancelled",
      "Email notification to business on new reservation received",
      "Sort order control — drag-and-drop items within categories",
    ],
  },
  {
    num: "2.4",
    icon: Hotel,
    title: "Hotel & Accommodation",
    points: [
      "Room type CRUD — create Standard, Deluxe, Suite, Family, etc.",
      "Per room type: name, description, max occupancy, bed type, images",
      "Seasonal pricing — set different rates per date range or season",
      "Availability calendar — visual monthly grid with blocked-out dates",
      "Online booking widget on public profile — guests select dates & room",
      "Deposit vs. full payment options configurable per property",
      "Booking reference with HOT- prefix for easy tracking",
      "Guest management: name, email, phone, number of guests, special requests",
      "Booking pipeline: Pending → Confirmed → Checked-In → Checked-Out",
      "Categorised amenities showcase: Rooms, Food, Wellness, Accessibility, etc.",
      "Hotel enquiry inbox for guests to ask questions before booking",
      "Payment status tracking: deposit paid, balance due, fully paid",
    ],
  },
  {
    num: "2.5",
    icon: CalendarDays,
    title: "Events & Ticketing",
    points: [
      "Create events with title, description, date/time, location, and cover image",
      "Ticket types: General Admission, VIP, Early Bird — each with own price",
      "Capacity limits per ticket type — automatic sold-out status",
      "Paystack-powered ticket sales — reference prefix EVT-/TKT-",
      "QR code generation per ticket — scannable at venue entry",
      "Attendee check-in tracking — mark attendees as checked-in at the door",
      "Monthly calendar view — overlay all events across the platform",
      "Event detail modal — full description, ticket tiers, and purchase form",
      "Ticket confirmation email sent automatically after purchase",
      "Attendee list export for event organisers",
      "My Tickets page — attendees can view and download all their tickets",
      "Capacity progress bar shown on event card (e.g. 47/100 tickets sold)",
    ],
  },
  {
    num: "2.6",
    icon: Briefcase,
    title: "Jobs & Hiring Pipeline",
    points: [
      "Post unlimited job vacancies with full description, salary, location",
      "AI job description generator — one-click professional JD creation",
      "AI cover letter generator for applicants — increases application quality",
      "Kanban hiring pipeline: Applied → Screened → Interview → Offer → Hired",
      "Applicant cards with CV download, cover letter view, and status move",
      "Applicant notes — internal comments visible only to hiring team",
      "Applicant tags — colour-coded labels like Shortlisted, Strong Candidate",
      "Video application support — candidates record video introductions",
      "Interview reminder emails — automated alerts sent before scheduled time",
      "Resume database access (Pro/Business) — search CVs without posting a job",
      "Job alerts for candidates — email notification on matching new listings",
      "Job boost / sponsored listing — increase visibility in search results",
      "Job performance analytics — views, applications, interview conversion rates",
      "Application timeline — full history of each candidate's journey",
      "Hiring digest email — weekly summary of pipeline activity",
    ],
  },
  {
    num: "2.7",
    icon: Users,
    title: "Lead Capture & CRM",
    points: [
      "Custom lead form builder — choose fields, labels, and required/optional",
      "Embeddable form — copy-paste HTML snippet to add to any external website",
      "Exit-intent popup — triggers when visitor moves mouse to close the tab",
      "Floating contact button — persistent bottom-right CTA on your profile",
      "CRM Kanban board — stages: New, Contacted, Qualified, Proposal, Won, Lost",
      "Drag-and-drop lead cards between stages on the Kanban board",
      "AI lead scoring 0–100 — based on engagement, source, and profile completeness",
      "Activity timeline per lead — all interactions, notes, status changes logged",
      "Lead detail modal — full contact info, source, UTM parameters, score",
      "Internal notes on leads — team comments visible only to business",
      "Email notification to business owner on every new lead received",
      "Lead source tracking — organic, direct, social, UTM campaign attribution",
      "Lead status badges — New (cyan), Contacted, Qualified, Won (green), Lost (red)",
      "Lead export to CSV — download full lead database for offline use",
    ],
  },
  {
    num: "2.8",
    icon: Megaphone,
    title: "Ad Campaigns & Marketing",
    points: [
      "Ad spot placements: Homepage Hero, Business Listings, Sidebar, Category pages",
      "Ad creation wizard: title, image, description, CTA link, date range",
      "A/B test variants — create multiple versions and split traffic allocation",
      "Variant performance comparison chart — impressions, CTR, conversions side-by-side",
      "AI-declared winner — system auto-flags best-performing variant",
      "ROI calculator — enter ad spend, calculate revenue attribution and return",
      "ROI trend chart — 30-day daily ROI percentage line graph",
      "Competitor benchmark comparisons — CTR vs. industry average for your category",
      "Smart AI recommendations — prioritised action cards to improve campaign",
      "CTR and impression charts — 30/60/90 day selectable view windows",
      "Conversion tracking — track enquiries, purchases, and bookings from ads",
      "Ad alert notifications — email/in-app alert if CTR drops below threshold",
      "Sponsored listing badge on business cards in directory search results",
      "Ad performance PDF export for reporting",
    ],
  },
  {
    num: "2.9",
    icon: Star,
    title: "Reviews & Reputation Management",
    points: [
      "Verified customer star ratings (1–5 stars) with written review text",
      "AI authenticity score per review — detects bot/fake submissions 0–100%",
      "Flag review button — submit suspicious reviews for admin moderation",
      "Public business reply — respond to any review, visible to all visitors",
      "Review summary card — average rating with star distribution bar chart",
      "Sentiment breakdown — Positive / Neutral / Negative categorisation",
      "Trust score on business profile — composite of rating, authenticity, and volume",
      "Recent reviews feed in business dashboard — latest 5 at a glance",
      "Review authenticity indicator shown on each card (AI confidence badge)",
      "Admin review moderation queue — flagged reviews reviewed by GHKonect team",
      "Review count displayed on search card and map pin",
      "Email notification to business on new review posted",
    ],
  },
  {
    num: "2.10",
    icon: BarChart3,
    title: "Analytics & Business Intelligence",
    points: [
      "Profile views this month vs. prior month with % growth indicator",
      "7-day views trend line chart with cyan-to-blue gradient fill",
      "30/60/90-day date range selector for all analytics charts",
      "Traffic source breakdown — direct, search, referral, social",
      "Total leads, leads this month, lead conversion rate percentage",
      "Active job listings count and total applications received",
      "Average star rating and total review count with trend",
      "Job performance chart — views to applications funnel per listing",
      "Ad campaign impressions and CTR daily chart with comparison period",
      "Export all data to CSV — profiles, leads, applications, ad stats",
      "Profile completeness score — 10-point checklist with missing item hints",
      "Notification centre — bell icon with unread count, real-time updates",
    ],
  },
];

const toolConsolidation = [
  { standalone: "CRM Software (e.g. HubSpot, Zoho)", ghkonect: "Lead Capture & CRM module", saving: "GHS 200–500/mo" },
  { standalone: "Job Board Subscription", ghkonect: "Jobs & Hiring Pipeline module", saving: "GHS 150–400/mo" },
  { standalone: "Online Booking System", ghkonect: "Hotel / Restaurant Reservations", saving: "GHS 100–300/mo" },
  { standalone: "E-commerce Platform", ghkonect: "Online Shop & Product Catalog", saving: "GHS 100–250/mo" },
  { standalone: "Ad Management Platform", ghkonect: "Ad Campaigns & A/B Testing", saving: "GHS 200–600/mo" },
  { standalone: "Review Management Tool", ghkonect: "Reviews & Reputation module", saving: "GHS 80–200/mo" },
  { standalone: "Analytics / Reporting Tool", ghkonect: "Analytics & Business Intelligence", saving: "GHS 100–300/mo" },
];

const revenueStreams = [
  { stream: "Product Sales (Online Shop)", method: "Paystack checkout, PRD- reference", timing: "24/7, instant payment" },
  { stream: "Event Ticket Sales", method: "Paystack, EVT-/TKT- references, QR delivery", timing: "On event creation" },
  { stream: "Table Reservation Fees", method: "Upfront deposit via Paystack on booking", timing: "Per reservation" },
  { stream: "Hotel Booking Deposits", method: "Configurable deposit or full payment", timing: "On booking confirmation" },
  { stream: "Job Post Boosting", method: "Sponsored listing fee, visibility upgrade", timing: "Per job listing" },
  { stream: "Ad Campaign Revenue", method: "Self-serve ad spend tracked with ROI", timing: "Per campaign period" },
];

const featureMatrix = [
  { feature: "Business Profile Listing", free: true, pro: true, business: true },
  { feature: "GPS Map Pin + Business Hours", free: true, pro: true, business: true },
  { feature: "Gallery (photos + video)", free: "5 photos", pro: "20 photos + video", business: "20 photos + video" },
  { feature: "Customer Reviews & Replies", free: true, pro: true, business: true },
  { feature: "Verified Badge (Standard)", free: false, pro: true, business: true },
  { feature: "Verified Badge (Government)", free: false, pro: false, business: true },
  { feature: "Online Shop (products)", free: "5 products", pro: "Unlimited", business: "Unlimited" },
  { feature: "Product Video (Cloudflare)", free: false, pro: true, business: true },
  { feature: "Restaurant Menu Management", free: "10 items", pro: "Unlimited", business: "Unlimited" },
  { feature: "Table Reservation System", free: false, pro: true, business: true },
  { feature: "Hotel Room & Booking System", free: false, pro: true, business: true },
  { feature: "Seasonal Pricing", free: false, pro: false, business: true },
  { feature: "Events & Ticketing", free: "1 event", pro: "10 events", business: "Unlimited" },
  { feature: "QR Code Ticket Generation", free: false, pro: true, business: true },
  { feature: "Job Postings", free: "1 active", pro: "5 active", business: "Unlimited" },
  { feature: "AI Job Description Generator", free: false, pro: false, business: true },
  { feature: "Kanban Hiring Pipeline", free: false, pro: true, business: true },
  { feature: "Video Applications", free: false, pro: true, business: true },
  { feature: "Resume Database Access", free: false, pro: true, business: true },
  { feature: "Job Boost / Sponsored Listing", free: false, pro: true, business: true },
  { feature: "Lead Capture Forms (embeddable)", free: false, pro: true, business: true },
  { feature: "CRM Kanban Board", free: false, pro: true, business: true },
  { feature: "Exit-Intent Popup", free: false, pro: true, business: true },
  { feature: "AI Lead Scoring (0–100)", free: false, pro: false, business: true },
  { feature: "Activity Timeline per Lead", free: false, pro: true, business: true },
  { feature: "Ad Campaign Creation", free: false, pro: true, business: true },
  { feature: "A/B Testing Variants", free: false, pro: false, business: true },
  { feature: "ROI Calculator & Trend Chart", free: false, pro: false, business: true },
  { feature: "Competitor Benchmarks", free: false, pro: false, business: true },
  { feature: "AI Ad Recommendations", free: false, pro: false, business: true },
  { feature: "Analytics Dashboard", free: "Basic", pro: "Advanced", business: "Full + Export" },
  { feature: "30/60/90-Day Date Filters", free: false, pro: true, business: true },
  { feature: "CSV Export (leads, analytics)", free: false, pro: true, business: true },
  { feature: "AI Review Authenticity Score", free: false, pro: false, business: true },
  { feature: "Priority Support", free: false, pro: false, business: true },
  { feature: "Verification Fast-Track", free: false, pro: false, business: true },
];

const whoIsItFor = [
  {
    type: "Restaurants & Cafés",
    points: [
      "Publish a digital menu with category groupings and dietary tags",
      "Accept online table reservations with deposit fee to reduce no-shows",
      "Showcase featured dishes and promotions with rich images",
      "Build credibility with verified profile and customer reviews",
    ],
  },
  {
    type: "Hotels & Guesthouses",
    points: [
      "Manage multiple room types with seasonal pricing and amenities",
      "Accept online bookings with deposit or full payment options",
      "Display a photo gallery and categorised amenities showcase",
      "Handle guest enquiries and special requests via inbox",
    ],
  },
  {
    type: "Retail Shops",
    points: [
      "Launch a 24/7 online shop with Paystack-powered checkout",
      "Showcase products with images, video, and featured badges",
      "Manage stock levels and receive orders with notifications",
      "Run sponsored ads to drive traffic from the GHKonect directory",
    ],
  },
  {
    type: "Service Businesses",
    points: [
      "Capture leads via embeddable forms and exit-intent popups",
      "Score and manage leads through CRM Kanban stages",
      "Showcase service packages with a digital services catalog",
      "Get discovered via category search across all 16 Ghana regions",
    ],
  },
  {
    type: "Healthcare Providers",
    points: [
      "Verified profile builds patient confidence instantly",
      "Publish specialties, staff credentials, and facilities gallery",
      "Capture appointment enquiries via custom lead forms",
      "Display business hours with live open/closed status",
    ],
  },
  {
    type: "Event Organisers",
    points: [
      "Sell tickets online for concerts, conferences, workshops, or sports events",
      "QR code tickets with automatic check-in scanning at venue",
      "Manage capacity, attendee lists, and multiple ticket tiers",
      "Promote events with sponsored placements on the directory",
    ],
  },
  {
    type: "Employers & Recruiters",
    points: [
      "Post jobs and manage applicants through a full Kanban pipeline",
      "Access resume database of Ghanaian job seekers without posting",
      "Use AI job description and cover letter generation tools",
      "Boost listings for greater visibility; set job alerts for candidates",
    ],
  },
];

const profileChecklist = [
  "Business logo uploaded",
  "Cover / hero image uploaded",
  "Business description written",
  "Phone number added",
  "Email address added",
  "Website URL added",
  "Business hours configured",
  "Gallery images (3+ photos)",
  "Intro video uploaded",
  "Verification badge obtained",
];

function MatrixCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-primary mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />;
  return <span className="text-xs text-center block text-muted-foreground">{value}</span>;
}

/* ── Reusable document primitives ─────────────────── */
function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-6 print-avoid">
      <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase section-number">Section {num}</span>
      <h2 className="text-2xl font-bold mt-1 section-title">{title}</h2>
      <hr className="mt-3 border-t-2 border-foreground section-divider" />
    </div>
  );
}

function SubSection({ num, title }: { num: string; title: string }) {
  return (
    <h3 className="font-bold text-base mt-8 mb-2 pb-1 border-b border-border subsection-title">
      {num} &mdash; {title}
    </h3>
  );
}

export default function PlatformOverview() {
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = PRINT_STYLES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleDownload = () => { window.print(); };

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print"><Navbar /></div>

      {/* ── DOCUMENT BODY ─────────────────────────────── */}
      <div className="doc-body bg-white">

        {/* ══════════════════════════════════════════════
            COVER PAGE
        ══════════════════════════════════════════════ */}
        <div className="cover-page min-h-screen flex flex-col justify-between px-16 pt-24 pb-16 border-b border-border bg-white print-avoid">
          {/* Logo + org */}
          <div>
            <img src={logoImage} alt="GHKonect" className="w-20 h-20 rounded-2xl mb-8 shadow-sm object-cover" />
            <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-3">GHKonect · Ghana Business Platform</p>
            <hr className="border-t border-border mb-8 w-24" />
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground mb-6 max-w-2xl">
              GHKonect Business Platform
            </h1>
            <h2 className="text-xl font-normal text-muted-foreground mb-2 max-w-2xl">
              Full Product &amp; Commercial Scope
            </h2>
            <p className="text-sm text-muted-foreground mt-2">A comprehensive reference document for business owners, partners, and commercial teams.</p>
          </div>

          {/* Meta block */}
          <div>
            <hr className="border-t border-border mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground text-xs uppercase tracking-widest mb-1">Document Version</p>
                <p>v2.0 — {new Date().getFullYear()}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground text-xs uppercase tracking-widest mb-1">Issued By</p>
                <p>GHKonect Platform Team</p>
              </div>
              <div>
                <p className="font-semibold text-foreground text-xs uppercase tracking-widest mb-1">Classification</p>
                <p>Confidential — Business Use</p>
              </div>
              <div>
                <p className="font-semibold text-foreground text-xs uppercase tracking-widest mb-1">Contact</p>
                <p>ghkonect.com</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-6 italic">
              This document is intended for authorised recipients only. All specifications are subject to change. © {new Date().getFullYear()} GHKonect. All rights reserved.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            TABLE OF CONTENTS
        ══════════════════════════════════════════════ */}
        <div className="doc-section max-w-4xl mx-auto px-8 md:px-16 py-16 print-avoid">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">GHKonect Platform Document</p>
          <h2 className="text-2xl font-bold mb-1">Table of Contents</h2>
          <hr className="border-t-2 border-foreground mt-3 mb-8" />
          <ol className="space-y-3 text-sm">
            {[
              ["1", "Executive Summary"],
              ["2", "Platform Modules — Full Feature Breakdown"],
              ["2.1", "Verified Business Profile", true],
              ["2.2", "Online Shop & Product Catalog", true],
              ["2.3", "Restaurant Menu Management", true],
              ["2.4", "Hotel & Accommodation", true],
              ["2.5", "Events & Ticketing", true],
              ["2.6", "Jobs & Hiring Pipeline", true],
              ["2.7", "Lead Capture & CRM", true],
              ["2.8", "Ad Campaigns & Marketing", true],
              ["2.9", "Reviews & Reputation Management", true],
              ["2.10", "Analytics & Business Intelligence", true],
              ["3", "Business Dashboard — Complete Specification"],
              ["3.1", "Header Card", true],
              ["3.2", "KPI Stat Cards", true],
              ["3.3", "Quick Actions Grid", true],
              ["3.4", "7-Day Views Trend Chart", true],
              ["3.5", "Profile Completeness Tracker", true],
              ["3.6", "Recent Leads & Reviews Feeds", true],
              ["3.7", "Active Campaigns Panel", true],
              ["4", "Commercial Benefits"],
              ["4.1", "Tool Consolidation Analysis", true],
              ["4.2", "Revenue Streams Unlocked", true],
              ["4.3", "Trust, Hiring & Marketing ROI", true],
              ["5", "Who Is GHKonect For?"],
              ["6", "Subscription Plans & Feature Matrix"],
            ].map(([num, label, indent]) => (
              <li key={num as string} className={`flex justify-between items-baseline border-b border-dashed border-border pb-1 toc-entry ${indent ? "pl-6 text-muted-foreground" : "font-semibold text-foreground"}`}>
                <span>{indent ? `${num} — ${label}` : <><span className="font-bold">Section {num}.</span> {label}</>}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 1 — EXECUTIVE SUMMARY
        ══════════════════════════════════════════════ */}
        <div className="doc-section max-w-4xl mx-auto px-8 md:px-16 py-14">
          <SectionHeader num="1" title="Executive Summary" />

          <p className="text-base leading-relaxed text-foreground mb-4">
            GHKonect is Ghana's comprehensive business directory and commerce platform — purpose-built for Ghanaian SMEs across all 16 administrative regions. It unifies more than ten standalone business tools into a single, integrated dashboard, eliminating the need for multiple subscriptions, fragmented data, and complex third-party integrations.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground mb-8">
            The platform is structured around a verified business profile at its core, upon which businesses can activate any combination of the following modules: an online shop, restaurant menu and reservation system, hotel room and booking management, event ticketing, job posting and hiring pipeline, CRM lead management, advertising campaigns, customer review management, and full analytics reporting. Each module is purpose-designed for the Ghanaian business environment, with Paystack-native payment processing, Cloudflare-powered media delivery, and AI-assisted tools for content creation, lead scoring, and ad optimisation.
          </p>

          <div className="stat-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 print-avoid">
            {[
              { value: "10+", label: "Integrated Modules" },
              { value: "16", label: "Ghana Regions Covered" },
              { value: "3", label: "Subscription Tiers" },
              { value: "100%", label: "Ghana-Focused" },
            ].map((stat) => (
              <div key={stat.label} className="stat-box border border-border rounded-lg p-4 text-center bg-muted/20">
                <span className="stat-value text-3xl font-bold text-primary block">{stat.value}</span>
                <span className="stat-label text-xs text-muted-foreground mt-1 block">{stat.label}</span>
              </div>
            ))}
          </div>

          <SubSection num="1.1" title="Core Value Proposition" />
          <ul className="doc-list space-y-1.5 text-sm text-muted-foreground list-none pl-0">
            {[
              "One platform replaces seven or more separate paid tools, yielding potential savings of GHS 930–2,550 per month.",
              "All payments processed via Paystack — Ghana's leading payment infrastructure — with structured reference prefixes per module.",
              "Government-backed verification via Registrar General document upload, enabling a GHKonect Verified Badge.",
              "AI-powered tools built into the platform: job description generation, lead scoring, ad recommendations, and review authenticity detection.",
              "Full 16-region discoverability: GPS-mapped profiles, region-filtered search, and category-based browse.",
              "Media delivery powered by Cloudflare Stream — video playback for product showcases and job video applications.",
              "No-code lead capture: embeddable HTML forms, exit-intent popups, and floating contact buttons require zero developer effort.",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2 — PLATFORM MODULES
        ══════════════════════════════════════════════ */}
        <div className="doc-section max-w-4xl mx-auto px-8 md:px-16 py-14">
          <SectionHeader num="2" title="Platform Modules — Full Feature Breakdown" />
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            This section provides a complete specification of every module available on the GHKonect platform. Each sub-section corresponds to a discrete functional area within the business dashboard. Modules are available independently or in combination depending on the active subscription tier.
          </p>

          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.num} className="print-avoid mb-8">
                <SubSection num={benefit.num} title={benefit.title} />
                <ul className="doc-list space-y-1.5 text-sm text-muted-foreground list-none pl-0">
                  {benefit.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 3 — DASHBOARD SPECIFICATION
        ══════════════════════════════════════════════ */}
        <div className="doc-section max-w-4xl mx-auto px-8 md:px-16 py-14">
          <SectionHeader num="3" title="Business Dashboard — Complete Specification" />
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            The Business Dashboard is the central control interface for every registered business on GHKonect. It aggregates real-time data from all active modules into a single screen, providing at-a-glance performance metrics and direct navigation to every operational function. The dashboard adapts its quick-action grid based on the business type registered.
          </p>

          <SubSection num="3.1" title="Header Card" />
          <ul className="doc-list space-y-1.5 text-sm text-muted-foreground list-none pl-0 mb-4">
            {[
              "Business logo — click-to-upload, displayed in search results and on the public profile",
              "Business name, category badge, and region badge displayed in header",
              "GHKonect Verified Badge shown when verification has been approved by admin",
              "Description preview — first 150 characters of the business description",
              "\"View Public Page\" button — opens the live public profile in a new browser tab",
              "\"Edit\" / \"Settings\" button — direct link to the business profile edit form",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <SubSection num="3.2" title="KPI Stat Cards" />
          <p className="text-sm text-muted-foreground mb-3">Four key performance indicator cards are displayed below the header, each with a primary metric and a contextual sub-statistic.</p>
          <div className="kpi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 print-avoid">
            {[
              { title: "Profile Views", detail: "Views this calendar month", sub: "Percentage growth vs. prior month shown with TrendingUp (green) / TrendingDown (red) colour indicator" },
              { title: "Total Leads", detail: "Lifetime lead count (all time)", sub: "Sub-stat: leads captured this month shown below main figure" },
              { title: "Active Jobs", detail: "Count of live job listings", sub: "Sub-stat: total applications received across all postings" },
              { title: "Rating", detail: "Average star rating (e.g. 4.7 ★)", sub: "Sub-stat: total review count shown below" },
            ].map((kpi) => (
              <div key={kpi.title} className="kpi-card border border-border rounded-lg p-4 bg-muted/10 print-avoid">
                <p className="kpi-title font-semibold text-sm mb-1">{kpi.title}</p>
                <p className="kpi-detail text-xs text-foreground font-medium mb-1">{kpi.detail}</p>
                <p className="kpi-sub text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <SubSection num="3.3" title="Quick Actions Grid (Business-Type Specific)" />
          <p className="text-sm text-muted-foreground mb-3">The quick actions grid adapts to the registered business type. Base actions are available to all business types; additional type-specific actions are appended.</p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-semibold text-xs">Business Type</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-xs">Actions Available</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: "All business types (base)", actions: "Edit Business Profile · Set Business Hours · Post a Job · Run Ad Campaign · View Leads · Business Analytics · View Public Page" },
                  { type: "Restaurant", actions: "Manage Menu Items · View Reservations (+ all base actions)" },
                  { type: "Hotel", actions: "Manage Room Types · View Bookings (+ all base actions)" },
                  { type: "Retail", actions: "Manage Shop & Products (+ all base actions)" },
                  { type: "Services / Healthcare", actions: "Edit Services Catalog (+ all base actions)" },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2.5 font-medium text-xs">{row.type}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.actions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SubSection num="3.4" title="7-Day Views Trend Chart" />
          <ul className="doc-list space-y-1.5 text-sm text-muted-foreground list-none pl-0 mb-4">
            {[
              "Recharts line chart with cyan-to-blue gradient fill area under the curve",
              "X-axis: day abbreviations (Mon, Tue, Wed, Thu, Fri, Sat, Sun)",
              "Y-axis: view count with automatic scale based on data range",
              "Hover tooltip showing exact view count per day",
              "Data fetched live from the business_views table (last 7 calendar days)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <SubSection num="3.5" title="Profile Completeness Tracker" />
          <p className="text-sm text-muted-foreground mb-3">A cyan-to-blue gradient progress bar displays the profile completeness percentage (0–100%). Completeness is calculated from the following ten checklist items:</p>
          <div className="checklist-grid grid grid-cols-2 md:grid-cols-5 gap-2 mb-3 print-avoid">
            {profileChecklist.map((item, i) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 rounded px-2 py-1.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-2 italic">
            A "Complete Profile" call-to-action is displayed when the score falls below 100%, linking directly to the business profile edit form.
          </p>

          <SubSection num="3.6" title="Recent Leads & Reviews Feeds" />
          <div className="two-col grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 print-avoid">
            {[
              {
                title: "Recent Leads Feed",
                items: [
                  "Avatar circle displaying lead's initial character",
                  "Lead name and email address displayed",
                  "Status badge: New (cyan), Contacted, Qualified",
                  "Time ago indicator (e.g. 2 hours ago, 3 days ago)",
                  "Latest 5 leads shown; link to full CRM board",
                ],
              },
              {
                title: "Recent Reviews Feed",
                items: [
                  "Five-star rating row with yellow filled stars",
                  "Review comment text preview (truncated at 100 chars)",
                  "Reviewer name and time since submission",
                  "Latest 5 reviews shown",
                  "\"View All Reviews\" link to full reviews list",
                ],
              },
            ].map((panel) => (
              <div key={panel.title} className="border border-border rounded-lg p-4 bg-muted/10">
                <p className="font-semibold text-sm mb-2">{panel.title}</p>
                <ul className="space-y-1 text-xs text-muted-foreground list-none pl-0">
                  {panel.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <SubSection num="3.7" title="Active Campaigns Panel" />
          <ul className="doc-list space-y-1.5 text-sm text-muted-foreground list-none pl-0">
            {[
              "Displays orange gradient icon with count of currently active ad campaigns",
              "\"Create Your First Ad\" call-to-action displayed when no campaigns are running",
              "\"Manage Ads\" link button shown when one or more campaigns are active",
              "Active ad titles listed with current status badge (Active, Pending, Ended)",
              "Impression count shown per individual ad listing",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 4 — COMMERCIAL BENEFITS
        ══════════════════════════════════════════════ */}
        <div className="doc-section max-w-4xl mx-auto px-8 md:px-16 py-14">
          <SectionHeader num="4" title="Commercial Benefits" />
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            GHKonect delivers measurable commercial value through three mechanisms: tool consolidation (replacing multiple paid subscriptions), revenue stream activation (enabling new income channels directly on the platform), and trust amplification (verified credentials that increase customer conversion).
          </p>

          <SubSection num="4.1" title="Tool Consolidation Analysis" />
          <p className="text-sm text-muted-foreground mb-4">The following table maps each GHKonect module to its nearest standalone commercial equivalent and provides an indicative monthly cost saving for Ghanaian SMEs.</p>
          <div className="overflow-x-auto mb-8 print-avoid">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-xs">Standalone Tool Replaced</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs">GHKonect Module</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs">Est. Monthly Saving</th>
                </tr>
              </thead>
              <tbody>
                {toolConsolidation.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.standalone}</td>
                    <td className="px-4 py-2.5 font-medium text-xs">{row.ghkonect}</td>
                    <td className="px-4 py-2.5 text-primary font-semibold text-xs">{row.saving}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-foreground bg-muted/20">
                  <td className="px-4 py-3 font-bold text-xs" colSpan={2}>Total potential saving vs. purchasing all tools independently</td>
                  <td className="px-4 py-3 text-primary font-bold text-sm">GHS 930–2,550/mo</td>
                </tr>
              </tbody>
            </table>
          </div>

          <SubSection num="4.2" title="Revenue Streams Unlocked" />
          <p className="text-sm text-muted-foreground mb-4">GHKonect enables businesses to collect revenue directly through the platform via Paystack-integrated payment flows. The following revenue channels become available upon activation of the corresponding module.</p>
          <div className="overflow-x-auto mb-8 print-avoid">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-xs">Revenue Stream</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs">Payment Method</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs">Availability</th>
                </tr>
              </thead>
              <tbody>
                {revenueStreams.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2.5 font-medium text-xs">{row.stream}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.method}</td>
                    <td className="px-4 py-2.5 text-xs text-primary">{row.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SubSection num="4.3" title="Trust, Hiring & Marketing ROI" />
          <div className="three-col grid grid-cols-1 md:grid-cols-3 gap-4 print-avoid">
            {[
              {
                title: "Trust & Discovery",
                items: [
                  "Verified badge increases customer conversion rate",
                  "GPS map pin drives in-person foot traffic",
                  "Coverage across all 16 Ghana regions",
                  "Trust score visible on profile builds confidence",
                  "AI authenticity score filters fake reviews",
                ],
              },
              {
                title: "Hiring Efficiency",
                items: [
                  "AI job description saves hours per posting",
                  "Kanban pipeline: Applied → Hired visual flow",
                  "Video interviews reduce early-stage screening time",
                  "Resume database: find candidates without posting",
                  "Applicant notes & tags: collaborative hiring",
                ],
              },
              {
                title: "Marketing ROI",
                items: [
                  "A/B tested ads: winner declared automatically",
                  "Competitor benchmarks: CTR vs. industry average",
                  "ROI calculator: enter spend, see revenue return",
                  "AI recommendations: prioritised action cards",
                  "CTR trend charts: 30/60/90-day time windows",
                ],
              },
            ].map((card) => (
              <div key={card.title} className="border border-border rounded-lg p-4 bg-muted/10">
                <p className="font-semibold text-sm mb-2">{card.title}</p>
                <ul className="space-y-1 text-xs text-muted-foreground list-none pl-0">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 5 — WHO IS IT FOR
        ══════════════════════════════════════════════ */}
        <div className="doc-section max-w-4xl mx-auto px-8 md:px-16 py-14">
          <SectionHeader num="5" title="Who Is GHKonect For?" />
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            GHKonect is designed to serve the full spectrum of formal and informal Ghanaian businesses across all 16 regions. The following sub-sections outline the primary use cases per business category.
          </p>
          <div className="space-y-6 print-avoid">
            {whoIsItFor.map((item, i) => (
              <div key={item.type} className="border-t border-border pt-4">
                <p className="font-bold text-sm mb-2">5.{i + 1} — {item.type}</p>
                <ul className="space-y-1 text-xs text-muted-foreground list-none pl-0">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 6 — SUBSCRIPTION PLANS & FEATURE MATRIX
        ══════════════════════════════════════════════ */}
        <div className="doc-section max-w-4xl mx-auto px-8 md:px-16 py-14">
          <SectionHeader num="6" title="Subscription Plans & Feature Matrix" />
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            GHKonect offers three subscription tiers designed to accommodate businesses at every stage — from newly registered startups to established enterprises requiring full AI-powered tooling. All plans include a basic verified listing; advanced modules and AI tools are gated behind Pro and Business tiers respectively.
          </p>

          {/* Plan summary table */}
          <SubSection num="6.1" title="Plan Summary" />
          <div className="overflow-x-auto mb-8 print-avoid">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-xs">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs">Price</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs">Target</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs">Key Inclusions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Free", price: "GHS 0/month", target: "New or micro businesses", key: "Basic listing, GPS pin, 5 products, 10 menu items, 1 job post, 1 event, basic analytics" },
                  { name: "Pro", price: "GHS 99/month", target: "Growing SMEs", key: "Standard verification, unlimited products & menu, 20 photos + video, hotel & reservation system, 5 jobs, Kanban pipeline, CRM, ads, advanced analytics, CSV export" },
                  { name: "Business", price: "GHS 299/month", target: "Established enterprises", key: "Government verification, AI tools (JD, lead scoring, ad recommendations, review authenticity), unlimited everything, seasonal pricing, ROI tracking, priority support" },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2.5 font-bold text-xs">{row.name}</td>
                    <td className="px-4 py-2.5 font-medium text-xs text-primary">{row.price}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.target}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Full feature matrix */}
          <SubSection num="6.2" title="Full Feature Matrix" />
          <div className="overflow-x-auto print-avoid">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-xs w-1/2">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-xs">Free</th>
                  <th className="px-4 py-3 text-center font-semibold text-xs text-primary">Pro</th>
                  <th className="px-4 py-3 text-center font-semibold text-xs">Business</th>
                </tr>
              </thead>
              <tbody>
                {featureMatrix.map((row, i) => (
                  <tr key={row.feature} className={`border-t border-border ${i % 2 === 0 ? "bg-muted/10" : ""}`}>
                    <td className="px-4 py-2 text-xs">{row.feature}</td>
                    <td className="px-4 py-2 text-center"><MatrixCell value={row.free} /></td>
                    <td className="px-4 py-2 text-center"><MatrixCell value={row.pro} /></td>
                    <td className="px-4 py-2 text-center"><MatrixCell value={row.business} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            DOCUMENT FOOTER (screen)
        ══════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-8 md:px-16 py-12 border-t border-border no-print">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={logoImage} alt="GHKonect" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="font-bold text-sm">GHKonect</p>
                <p className="text-xs text-muted-foreground">Ghana's #1 Business Platform</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="sm" onClick={() => navigate('/register-business')} className="gap-2">
                <Building2 className="h-4 w-4" /> Register Your Business
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/subscription-plans')} className="gap-2">
                <CreditCard className="h-4 w-4" /> View Plans
              </Button>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> ghkonect.com</div>
            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +233 XX XXX XXXX</div>
            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Accra, Ghana</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            © {new Date().getFullYear()} GHKonect. All rights reserved. This document is confidential and intended for authorised recipients only.
          </p>
        </div>

        {/* Print footer */}
        <div className="hidden print:block text-center text-xs text-muted-foreground border-t border-border pt-4 mt-8 px-8">
          <p className="font-semibold">GHKonect — Ghana's #1 Business Directory & Commerce Platform</p>
          <p>ghkonect.com · Accra, Ghana · © {new Date().getFullYear()} GHKonect. All rights reserved. Confidential.</p>
        </div>
      </div>

      {/* Floating Download */}
      <div className="no-print fixed bottom-6 right-6 z-50">
        <Button size="lg" className="gap-2 shadow-lg" onClick={handleDownload}>
          <Download className="h-5 w-5" /> Download PDF
        </Button>
      </div>

      <div className="no-print"><Footer /></div>
    </div>
  );
}
