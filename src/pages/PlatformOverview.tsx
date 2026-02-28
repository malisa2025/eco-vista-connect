import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Download, Building2, ShoppingBag, UtensilsCrossed, Hotel, CalendarDays,
  Briefcase, Users, BarChart3, Star, Shield, CreditCard, CheckCircle2,
  LayoutDashboard, TrendingUp, MessageSquare, Zap, Eye, Bell, FileText,
  Globe, Phone, MapPin, Clock, Award, Target, LineChart, Megaphone,
  ChevronRight, ArrowRight, X, Check, Minus, TrendingDown, Layers,
  DollarSign, Package, BookOpen, Cpu, Video, Activity, Search, Filter,
  PieChart, AlertCircle, Database, Bookmark, Flag, ThumbsUp, Settings,
  List, Grid, Calendar, Tag, Hash, Percent, Banknote, Receipt, Smartphone,
  BarChart2, GitBranch, Mail, ExternalLink, Image
} from "lucide-react";
import logoImage from "@/assets/logo-ghkonect.jpg";

const PRINT_STYLES = `
@media print {
  .no-print { display: none !important; }
  nav, footer, .navbar, header { display: none !important; }
  body { margin: 0; padding: 0; font-size: 10pt; color: #000; background: #fff; }
  .print-page { padding: 1cm 1.5cm; }
  .print-break { page-break-before: always; }
  .print-avoid-break { page-break-inside: avoid; }
  h1 { font-size: 20pt; }
  h2 { font-size: 15pt; margin-top: 0.8cm; }
  h3 { font-size: 12pt; }
  .brochure-hero { background: #005f2e !important; color: white !important; padding: 0.8cm 1.5cm; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .brochure-accent { color: #005f2e !important; }
  .feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  a { color: #005f2e; text-decoration: none; }
  .print-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 8pt; color: #666; padding: 4px; border-top: 1px solid #ddd; }
  table { border-collapse: collapse; width: 100%; font-size: 9pt; }
  th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
  th { background: #f0f0f0; print-color-adjust: exact; }
}
`;

const benefits = [
  {
    icon: Shield,
    title: "Verified Business Profile",
    color: "bg-emerald-500/10 text-emerald-600",
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
    icon: ShoppingBag,
    title: "Online Shop & Product Catalog",
    color: "bg-blue-500/10 text-blue-600",
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
    icon: UtensilsCrossed,
    title: "Restaurant Menu Management",
    color: "bg-orange-500/10 text-orange-600",
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
    icon: Hotel,
    title: "Hotel & Accommodation",
    color: "bg-purple-500/10 text-purple-600",
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
    icon: CalendarDays,
    title: "Events & Ticketing",
    color: "bg-cyan-500/10 text-cyan-600",
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
    icon: Briefcase,
    title: "Jobs & Hiring Pipeline",
    color: "bg-indigo-500/10 text-indigo-600",
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
    icon: Users,
    title: "Lead Capture & CRM",
    color: "bg-rose-500/10 text-rose-600",
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
    icon: Megaphone,
    title: "Ad Campaigns & Marketing",
    color: "bg-amber-500/10 text-amber-600",
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
    icon: Star,
    title: "Reviews & Reputation Management",
    color: "bg-yellow-500/10 text-yellow-600",
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
    icon: BarChart3,
    title: "Analytics & Business Intelligence",
    color: "bg-teal-500/10 text-teal-600",
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

const whoIsItFor = [
  {
    icon: UtensilsCrossed,
    type: "Restaurants & Cafés",
    color: "bg-orange-500/10 text-orange-600",
    points: [
      "Publish a digital menu with category groupings and dietary tags",
      "Accept online table reservations with deposit fee to reduce no-shows",
      "Showcase featured dishes and promotions with rich images",
      "Build credibility with verified profile and customer reviews",
    ],
  },
  {
    icon: Hotel,
    type: "Hotels & Guesthouses",
    color: "bg-purple-500/10 text-purple-600",
    points: [
      "Manage multiple room types with seasonal pricing and amenities",
      "Accept online bookings with deposit or full payment options",
      "Display a photo gallery and categorised amenities showcase",
      "Handle guest enquiries and special requests via inbox",
    ],
  },
  {
    icon: ShoppingBag,
    type: "Retail Shops",
    color: "bg-blue-500/10 text-blue-600",
    points: [
      "Launch a 24/7 online shop with Paystack-powered checkout",
      "Showcase products with images, video, and featured badges",
      "Manage stock levels and receive orders with notifications",
      "Run sponsored ads to drive traffic from the GHKonect directory",
    ],
  },
  {
    icon: Briefcase,
    type: "Service Businesses",
    color: "bg-indigo-500/10 text-indigo-600",
    points: [
      "Capture leads via embeddable forms and exit-intent popups",
      "Score and manage leads through CRM Kanban stages",
      "Showcase service packages with a digital services catalog",
      "Get discovered via category search across all 16 Ghana regions",
    ],
  },
  {
    icon: Shield,
    type: "Healthcare Providers",
    color: "bg-emerald-500/10 text-emerald-600",
    points: [
      "Verified profile builds patient confidence instantly",
      "Publish specialties, staff credentials, and facilities gallery",
      "Capture appointment enquiries via custom lead forms",
      "Display business hours with live open/closed status",
    ],
  },
  {
    icon: CalendarDays,
    type: "Event Organisers",
    color: "bg-cyan-500/10 text-cyan-600",
    points: [
      "Sell tickets online for concerts, conferences, workshops, or sports events",
      "QR code tickets with automatic check-in scanning at venue",
      "Manage capacity, attendee lists, and multiple ticket tiers",
      "Promote events with sponsored placements on the directory",
    ],
  },
  {
    icon: Users,
    type: "Employers & Recruiters",
    color: "bg-rose-500/10 text-rose-600",
    points: [
      "Post jobs and manage applicants through a full Kanban pipeline",
      "Access resume database of Ghanaian job seekers without posting",
      "Use AI job description and cover letter generation tools",
      "Boost listings for greater visibility; set job alerts for candidates",
    ],
  },
];

const toolConsolidation = [
  { standalone: "CRM Software (e.g. HubSpot)", ghkonect: "Lead Capture & CRM module", saving: "GHS 200–500/mo" },
  { standalone: "Job Board Subscription", ghkonect: "Jobs & Hiring Pipeline module", saving: "GHS 150–400/mo" },
  { standalone: "Online Booking System", ghkonect: "Hotel / Restaurant Reservations", saving: "GHS 100–300/mo" },
  { standalone: "E-commerce Platform", ghkonect: "Online Shop & Product Catalog", saving: "GHS 100–250/mo" },
  { standalone: "Ad Management Platform", ghkonect: "Ad Campaigns & A/B Testing", saving: "GHS 200–600/mo" },
  { standalone: "Review Management Tool", ghkonect: "Reviews & Reputation module", saving: "GHS 80–200/mo" },
  { standalone: "Analytics Tool", ghkonect: "Analytics & Business Intelligence", saving: "GHS 100–300/mo" },
];

const revenueStreams = [
  { stream: "Product Sales (Online Shop)", method: "Paystack checkout, PRD- reference", timing: "24 / 7, instant payment" },
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

const dashboardKPIs = [
  {
    icon: Eye,
    title: "Profile Views",
    color: "bg-blue-500/10 text-blue-600",
    detail: "Views this calendar month",
    sub: "% growth vs. prior month with TrendingUp (green) / TrendingDown (red) colour indicator",
  },
  {
    icon: Users,
    title: "Total Leads",
    color: "bg-rose-500/10 text-rose-600",
    detail: "Lifetime lead count (all time)",
    sub: "Sub-stat: leads captured this month shown below main figure",
  },
  {
    icon: Briefcase,
    title: "Active Jobs",
    color: "bg-indigo-500/10 text-indigo-600",
    detail: "Count of live job listings",
    sub: "Sub-stat: total applications received across all postings",
  },
  {
    icon: Star,
    title: "Rating",
    color: "bg-yellow-500/10 text-yellow-600",
    detail: "Average star rating (e.g. 4.7 ★)",
    sub: "Sub-stat: total review count shown below",
  },
];

const quickActions = [
  { type: "All", actions: ["Edit Business Profile", "Set Business Hours", "Post a Job", "Run Ad Campaign", "View Leads", "Business Analytics", "View Public Page"] },
  { type: "Restaurant", actions: ["Manage Menu Items", "View Reservations", "+ all base actions"] },
  { type: "Hotel", actions: ["Manage Room Types", "View Bookings", "+ all base actions"] },
  { type: "Retail", actions: ["Manage Shop & Products", "+ all base actions"] },
  { type: "Services / Healthcare", actions: ["Edit Services Catalog", "+ all base actions"] },
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

const plans = [
  {
    name: "Free",
    price: "GHS 0",
    period: "/month",
    color: "border-border",
    badge: "",
    highlight: false,
    desc: "Get listed and be discoverable",
    features: [
      "Business profile listing",
      "GPS map pin & business hours",
      "5 product listings",
      "10 menu items",
      "1 active job post",
      "1 event listing",
      "Basic analytics",
      "Customer reviews",
    ],
  },
  {
    name: "Pro",
    price: "GHS 99",
    period: "/month",
    color: "border-primary",
    badge: "Most Popular",
    highlight: true,
    desc: "Grow your business and capture more leads",
    features: [
      "Everything in Free",
      "Verified badge (Standard)",
      "Unlimited products & menu items",
      "Gallery: 20 photos + video",
      "Product video (Cloudflare Stream)",
      "Table reservation system",
      "Hotel room & booking system",
      "10 events with QR ticketing",
      "5 active job posts",
      "Kanban hiring pipeline",
      "Video job applications",
      "Resume database access",
      "Job boost / sponsored listings",
      "Lead capture forms (embeddable)",
      "CRM Kanban board (6 stages)",
      "Exit-intent popup",
      "Activity timeline per lead",
      "Ad campaign creation",
      "Advanced analytics (30/60/90-day)",
      "CSV export (leads + analytics)",
    ],
  },
  {
    name: "Business",
    price: "GHS 299",
    period: "/month",
    color: "border-amber-500",
    badge: "Enterprise",
    highlight: false,
    desc: "Maximum growth with AI-powered tools",
    features: [
      "Everything in Pro",
      "Government-verified badge",
      "Seasonal pricing for hotels",
      "Unlimited events",
      "Unlimited job posts",
      "AI job description generator",
      "AI cover letter generator",
      "A/B ad testing & ROI tracking",
      "ROI calculator with trend chart",
      "Competitor benchmark comparisons",
      "AI smart ad recommendations",
      "AI lead scoring (0–100)",
      "AI review authenticity scores",
      "Full analytics + advanced export",
      "Priority support",
      "Verification fast-track",
    ],
  },
];

function MatrixCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-primary mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs text-center block text-muted-foreground">{value}</span>;
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

      {/* Print Header */}
      <div className="hidden print:block brochure-hero text-white p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={logoImage} alt="GHKonect" className="w-12 h-12 rounded-xl" />
          <span className="text-2xl font-bold">GHKonect</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Business Benefits & Full Platform Document</h1>
        <p className="text-lg opacity-90">Ghana's #1 Business Directory & Commerce Platform</p>
        <p className="text-sm opacity-75 mt-1">ghkonect.com · support@ghkonect.com · Accra, Ghana</p>
      </div>

      <div className="print-page">

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative bg-primary text-primary-foreground py-20 px-4 no-print">
          <div className="container mx-auto text-center max-w-4xl">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">Ghana's #1 Business Platform</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Everything Your Business Needs to Grow in Ghana
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              From verified profiles and online shops to job postings, event ticketing, and AI-powered ads — all in one platform built for Ghanaian businesses.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate('/register-business')}>
                <Building2 className="h-5 w-5" /> Register Your Business
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10" onClick={handleDownload}>
                <Download className="h-5 w-5" /> Download PDF Brochure
              </Button>
            </div>
          </div>
        </section>

        {/* ── EXECUTIVE SUMMARY ────────────────────────── */}
        <section className="py-14 px-4 bg-muted/30 border-y border-border print-break">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10 print-avoid-break">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Executive Summary</Badge>
              <h2 className="text-3xl font-display font-bold mb-3 brochure-accent">What is GHKonect?</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto text-base leading-relaxed">
                GHKonect is Ghana's comprehensive business directory and commerce platform — purpose-built for Ghanaian SMEs across all 16 regions. It unifies 10+ standalone business tools into a single dashboard, eliminating the need for multiple subscriptions and fragmented systems.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-avoid-break">
              {[
                {
                  icon: Layers,
                  title: "One Platform, 10+ Tools",
                  desc: "Replace your CRM, job board, booking system, e-commerce store, ad platform, and review management tool — all replaced by a single GHKonect subscription.",
                },
                {
                  icon: MapPin,
                  title: "16-Region Ghana Coverage",
                  desc: "Every business is discoverable across all 16 administrative regions of Ghana. GPS map pins, region filters, and location-based search drive local foot traffic.",
                },
                {
                  icon: Shield,
                  title: "Government-Backed Verification",
                  desc: "Businesses can submit Registrar General documents for official verification. The GHKonect Verified Badge builds instant customer trust and improves conversion rates.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="print-avoid-break bg-card border border-border rounded-xl p-6 text-center">
                    <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center print-avoid-break">
              {[
                { value: "10+", label: "Integrated Tools" },
                { value: "16", label: "Ghana Regions" },
                { value: "3", label: "Subscription Tiers" },
                { value: "100%", label: "Ghana-Focused" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENEFITS GRID ────────────────────────────── */}
        <section className="py-16 px-4 container mx-auto print-break">
          <div className="text-center mb-12 print-avoid-break">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Platform Features</Badge>
            <h2 className="text-3xl font-display font-bold mb-3 brochure-accent">Full Feature Breakdown by Module</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A complete suite of tools to manage, grow, and monetise your business — all from one dashboard.</p>
          </div>
          <div className="feature-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="print-avoid-break border border-border rounded-xl p-6 bg-card hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${benefit.color.split(' ')[0]}`}>
                      <Icon className={`h-5 w-5 ${benefit.color.split(' ')[1]}`} />
                    </div>
                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {benefit.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── DASHBOARD DEEP-DIVE ───────────────────────── */}
        <section className="py-16 px-4 bg-muted/30 border-y border-border print-break">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 print-avoid-break">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Dashboard</Badge>
              <h2 className="text-3xl font-display font-bold mb-3 brochure-accent">Business Dashboard — Complete Deep-Dive</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Every metric, action, and insight your business needs — in a single control centre.</p>
            </div>

            {/* Header Card */}
            <div className="print-avoid-break bg-card border border-border rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Business Header Card
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                {[
                  "Business logo (click-to-upload, shown in search results and profile)",
                  "Business name, category badge, and region badge",
                  "GHKonect Verified badge (if verification approved)",
                  "Description preview (first 150 characters)",
                  "\"View Public Page\" button — opens live profile in new tab",
                  "\"Settings\" / \"Edit\" button — quick access to edit profile form",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* 4 KPI Stat Cards */}
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> 4 KPI Stat Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {dashboardKPIs.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.title} className="print-avoid-break bg-card border border-border rounded-xl p-5">
                    <div className={`p-2 rounded-lg ${kpi.color.split(' ')[0]} w-fit mb-3`}>
                      <Icon className={`h-5 w-5 ${kpi.color.split(' ')[1]}`} />
                    </div>
                    <div className="font-semibold text-sm mb-1">{kpi.title}</div>
                    <div className="text-xs text-foreground font-medium mb-1">{kpi.detail}</div>
                    <div className="text-xs text-muted-foreground">{kpi.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="print-avoid-break bg-card border border-border rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Quick Actions Grid (Business-Type Specific)
              </h3>
              <div className="space-y-3">
                {quickActions.map((qa) => (
                  <div key={qa.type} className="flex flex-wrap gap-x-6 gap-y-1 items-start">
                    <span className="text-xs font-semibold text-primary w-28 shrink-0 pt-0.5">{qa.type}:</span>
                    <div className="flex flex-wrap gap-2">
                      {qa.actions.map((a) => (
                        <span key={a} className="text-xs bg-muted rounded-full px-2.5 py-0.5 text-muted-foreground">{a}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Views Trend Chart */}
            <div className="print-avoid-break bg-card border border-border rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" /> 7-Day Views Trend Chart
              </h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {[
                  "Recharts line chart with cyan-to-blue gradient fill area under the curve",
                  "X-axis: day abbreviations (Mon, Tue, Wed… Sun)",
                  "Y-axis: view count with automatic scale",
                  "Hover tooltip showing exact view count per day",
                  "Data fetched live from business_views table (last 7 days)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Profile Completeness */}
            <div className="print-avoid-break bg-card border border-border rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Profile Completeness Tracker
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Cyan-to-blue gradient progress bar (0–100%). 10-point completeness checklist:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {profileChecklist.map((item, i) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-3">
                "Complete Profile" CTA shown if score is below 100%. Clicking directs to edit business form.
              </p>
            </div>

            {/* Feeds & Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-avoid-break">
              {[
                {
                  icon: Users,
                  title: "Recent Leads Feed",
                  items: [
                    "Avatar circle with lead initial",
                    "Lead name and email address",
                    "Status badge: New (cyan), Contacted, Qualified",
                    "Time ago (e.g. 2 hours ago)",
                    "Latest 5 leads shown",
                  ],
                },
                {
                  icon: Star,
                  title: "Recent Reviews Feed",
                  items: [
                    "5-star rating row (yellow filled stars)",
                    "Review comment preview (truncated)",
                    "Reviewer name and time ago",
                    "Latest 5 reviews shown",
                    "\"View All\" link to full reviews list",
                  ],
                },
                {
                  icon: Megaphone,
                  title: "Active Campaigns Panel",
                  items: [
                    "Orange gradient icon with active ad count",
                    "\"Create Your First Ad\" CTA when empty",
                    "\"Manage Ads\" link button when active",
                    "Ad titles listed with status badge",
                    "Impression count shown per ad",
                  ],
                },
              ].map((panel) => {
                const Icon = panel.icon;
                return (
                  <div key={panel.title} className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" /> {panel.title}
                    </h3>
                    <ul className="space-y-1.5">
                      {panel.items.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── COMMERCIAL BENEFITS ───────────────────────── */}
        <section className="py-16 px-4 container mx-auto print-break">
          <div className="text-center mb-12 print-avoid-break">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Commercial Value</Badge>
            <h2 className="text-3xl font-display font-bold mb-3 brochure-accent">Commercial Benefits</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">GHKonect replaces 7+ separate paid tools, unlocks new revenue streams, and builds customer trust — all in one platform.</p>
          </div>

          {/* Tool Consolidation Table */}
          <div className="print-avoid-break mb-10">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Tool Consolidation — What GHKonect Replaces
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">Standalone Tool</th>
                    <th className="px-4 py-3 text-left font-semibold">GHKonect Module</th>
                    <th className="px-4 py-3 text-left font-semibold">Est. Monthly Saving</th>
                  </tr>
                </thead>
                <tbody>
                  {toolConsolidation.map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{row.standalone}</td>
                      <td className="px-4 py-3 font-medium text-primary">{row.ghkonect}</td>
                      <td className="px-4 py-3 text-primary font-semibold">{row.saving}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="px-4 py-3 font-bold" colSpan={2}>Total potential saving vs. standalone tools</td>
                    <td className="px-4 py-3 text-primary font-bold text-base">GHS 930–2,550/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Streams */}
          <div className="print-avoid-break mb-10">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" /> Revenue Streams Unlocked by GHKonect
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">Revenue Stream</th>
                    <th className="px-4 py-3 text-left font-semibold">Method</th>
                    <th className="px-4 py-3 text-left font-semibold">When Active</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueStreams.map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.stream}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.method}</td>
                      <td className="px-4 py-3 text-primary text-xs">{row.timing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trust, Hiring, Marketing Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-avoid-break">
            {[
              {
                icon: Shield,
                title: "Trust & Discovery",
                color: "bg-emerald-500/10 text-emerald-600",
                items: [
                  "Verified badge = higher customer conversion rate",
                  "GPS map pin drives in-person foot traffic",
                  "Coverage across all 16 Ghana regions",
                  "Trust score visible on profile builds confidence",
                  "AI authenticity score filters fake reviews",
                ],
              },
              {
                icon: Briefcase,
                title: "Hiring Efficiency",
                color: "bg-indigo-500/10 text-indigo-600",
                items: [
                  "AI job description saves hours per posting",
                  "Kanban pipeline: Applied → Hired visual flow",
                  "Video interviews reduce early-stage screening time",
                  "Resume database: find candidates without posting",
                  "Applicant notes & tags: collaborative hiring",
                ],
              },
              {
                icon: TrendingUp,
                title: "Marketing ROI",
                color: "bg-amber-500/10 text-amber-600",
                items: [
                  "A/B tested ads: winner declared automatically",
                  "Competitor benchmarks: see if you're above average",
                  "ROI calculator: enter spend, see revenue return",
                  "AI recommendations: prioritised action cards",
                  "CTR trend charts: 30/60/90-day time windows",
                ],
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="print-avoid-break bg-card border border-border rounded-xl p-6">
                  <div className={`p-2 rounded-lg ${card.color.split(' ')[0]} w-fit mb-3`}>
                    <Icon className={`h-5 w-5 ${card.color.split(' ')[1]}`} />
                  </div>
                  <h3 className="font-semibold mb-3">{card.title}</h3>
                  <ul className="space-y-2">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── WHO IS IT FOR ─────────────────────────────── */}
        <section className="py-16 px-4 bg-muted/30 border-y border-border print-break">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 print-avoid-break">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Use Cases</Badge>
              <h2 className="text-3xl font-display font-bold mb-3 brochure-accent">Who Is GHKonect For?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Built for every type of Ghanaian business — from street-side restaurants to multinational hotels.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {whoIsItFor.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.type} className="print-avoid-break bg-card border border-border rounded-xl p-6">
                    <div className={`p-2 rounded-lg ${item.color.split(' ')[0]} w-fit mb-3`}>
                      <Icon className={`h-5 w-5 ${item.color.split(' ')[1]}`} />
                    </div>
                    <h3 className="font-semibold mb-3">{item.type}</h3>
                    <ul className="space-y-2">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FULL FEATURE MATRIX ───────────────────────── */}
        <section className="py-16 px-4 container mx-auto print-break">
          <div className="text-center mb-12 print-avoid-break">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Pricing & Plans</Badge>
            <h2 className="text-3xl font-display font-bold mb-3 brochure-accent">Subscription Plans & Feature Matrix</h2>
            <p className="text-muted-foreground">Start free, upgrade as you grow. Full feature comparison across all tiers.</p>
          </div>

          {/* Plan Cards */}
          <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 print-avoid-break">
            {plans.map((plan) => (
              <div key={plan.name} className={`print-avoid-break border-2 ${plan.color} rounded-xl p-6 bg-card relative ${plan.highlight ? 'shadow-lg' : ''}`}>
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">{plan.badge}</Badge>
                )}
                <div className="mb-2">
                  <h3 className="font-bold text-xl">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                </div>
                <div className="flex items-baseline gap-1 mt-3 mb-5">
                  <span className="text-3xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!plan.badge && (
                  <Button className="w-full mt-6" variant={plan.highlight ? "default" : "outline"} onClick={() => navigate('/subscription-plans')}>
                    Get Started
                  </Button>
                )}
                {plan.highlight && (
                  <Button className="w-full mt-6" onClick={() => navigate('/subscription-plans')}>
                    Get Started — Pro
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Full Feature Matrix Table */}
          <div className="print-avoid-break overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="px-4 py-3 text-left font-semibold w-1/2">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold">Free</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Pro</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground/70">Business</th>
                </tr>
              </thead>
              <tbody>
                {featureMatrix.map((row, i) => (
                  <tr key={row.feature} className={`border-t border-border ${i % 2 === 0 ? 'bg-muted/10' : ''}`}>
                    <td className="px-4 py-2.5 text-sm">{row.feature}</td>
                    <td className="px-4 py-2.5 text-center"><MatrixCell value={row.free} /></td>
                    <td className="px-4 py-2.5 text-center"><MatrixCell value={row.pro} /></td>
                    <td className="px-4 py-2.5 text-center"><MatrixCell value={row.business} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────── */}
        <section className="py-16 px-4 bg-primary text-primary-foreground no-print">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-display font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="opacity-90 mb-8 text-lg">
              Join thousands of Ghanaian businesses already on GHKonect. Register today and get your business in front of customers across all 16 regions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate('/register-business')}>
                <Building2 className="h-5 w-5" /> Register Your Business <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/subscription-plans')}>
                <CreditCard className="h-5 w-5" /> View Pricing Plans
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm opacity-80">
              <div className="flex items-center justify-center gap-2"><Globe className="h-4 w-4" /> ghkonect.com</div>
              <div className="flex items-center justify-center gap-2"><Phone className="h-4 w-4" /> +233 XX XXX XXXX</div>
              <div className="flex items-center justify-center gap-2"><MapPin className="h-4 w-4" /> Accra, Ghana</div>
            </div>
          </div>
        </section>

        {/* Print footer */}
        <div className="hidden print:block print-footer text-center text-xs text-muted-foreground border-t border-border pt-4 mt-8">
          <p className="font-semibold">GHKonect — Ghana's #1 Business Directory & Commerce Platform</p>
          <p>ghkonect.com · Accra, Ghana · © {new Date().getFullYear()} GHKonect. All rights reserved.</p>
        </div>

        {/* Floating Download */}
        <div className="no-print fixed bottom-6 right-6 z-50">
          <Button size="lg" className="gap-2 shadow-lg" onClick={handleDownload}>
            <Download className="h-5 w-5" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="no-print"><Footer /></div>
    </div>
  );
}
