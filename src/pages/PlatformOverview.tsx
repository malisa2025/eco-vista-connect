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
  ChevronRight, ArrowRight
} from "lucide-react";
import logoImage from "@/assets/logo-ghkonect.jpg";

const PRINT_STYLES = `
@media print {
  .no-print { display: none !important; }
  nav, footer, .navbar, header { display: none !important; }
  body { margin: 0; padding: 0; font-size: 11pt; color: #000; background: #fff; }
  .print-page { padding: 1.5cm 2cm; }
  .print-break { page-break-before: always; }
  .print-avoid-break { page-break-inside: avoid; }
  h1 { font-size: 22pt; }
  h2 { font-size: 16pt; margin-top: 1cm; }
  h3 { font-size: 13pt; }
  .brochure-hero { background: #005f2e !important; color: white !important; padding: 1cm 2cm; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .brochure-accent { color: #005f2e !important; }
  .feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  a { color: #005f2e; text-decoration: none; }
  .print-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9pt; color: #666; padding: 6px; border-top: 1px solid #ddd; }
}
`;

const benefits = [
  {
    icon: Shield,
    title: "Verified Business Profile",
    points: [
      "Official verification badge — builds customer trust instantly",
      "Upload logo, cover image, and gallery photos",
      "Set accurate business hours with open/closed status",
      "Map pin with GPS coordinates for easy discovery",
      "Contact info, website links, and social handles",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Online Shop & Product Catalog",
    points: [
      "List unlimited products with photos, descriptions & prices",
      "Online orders with secure Paystack payment integration",
      "Manage stock levels and product availability",
      "Featured products highlighted on your profile",
      "Product video showcase support",
    ],
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant Menu Management",
    points: [
      "Digital menu with category groupings (starters, mains, drinks…)",
      "Item availability toggling in real-time",
      "Dietary tags (vegetarian, gluten-free, halal, etc.)",
      "Featured dish highlighting with images",
      "Online table reservation system with fee collection",
    ],
  },
  {
    icon: Hotel,
    title: "Hotel & Accommodation",
    points: [
      "Room type management with pricing and occupancy limits",
      "Online booking with deposit/full payment options",
      "Booking calendar and availability management",
      "Guest management and special request handling",
      "Amenities showcase with category filtering",
    ],
  },
  {
    icon: CalendarDays,
    title: "Events & Ticketing",
    points: [
      "Create and publish events with rich descriptions",
      "Sell tickets online with Paystack payment",
      "QR code ticket generation for entry scanning",
      "Attendee management and check-in tracking",
      "Calendar view with monthly event overview",
    ],
  },
  {
    icon: Briefcase,
    title: "Jobs & Hiring Pipeline",
    points: [
      "Post unlimited job vacancies with full descriptions",
      "AI-assisted job description generation",
      "Applicant tracking with Kanban pipeline stages",
      "Video application support from candidates",
      "Resume database access (Pro/Business plans)",
    ],
  },
  {
    icon: Users,
    title: "Lead Capture & CRM",
    points: [
      "Embeddable lead capture forms for your website",
      "CRM Kanban board to manage leads through stages",
      "Activity timeline per lead with notes & history",
      "AI-powered lead scoring and prioritisation",
      "Exit-intent popup to capture leaving visitors",
    ],
  },
  {
    icon: Megaphone,
    title: "Ad Campaigns & Marketing",
    points: [
      "Sponsored placements across the GHKonect platform",
      "A/B testing with multiple ad variants",
      "ROI tracking with revenue attribution",
      "AI-powered smart recommendations",
      "Competitor benchmark comparisons",
    ],
  },
  {
    icon: Star,
    title: "Reviews & Reputation",
    points: [
      "Customers leave verified star ratings and written reviews",
      "AI authenticity scoring to filter fake reviews",
      "Publicly respond to reviews to show engagement",
      "Review summary with sentiment breakdown",
      "Trust score displayed on business profile",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    points: [
      "Profile views this month vs. prior period trend",
      "Total leads and leads acquired this month",
      "Active job listings and total applications count",
      "Average star rating and total review count",
      "7-day view trend sparkline chart",
    ],
  },
];

const dashboardFeatures = [
  { icon: Eye, label: "Profile Views", desc: "Track monthly visitors vs. last month" },
  { icon: Users, label: "Lead Tracking", desc: "Total leads & new this month" },
  { icon: Briefcase, label: "Job Listings", desc: "Active posts & application count" },
  { icon: Star, label: "Ratings", desc: "Avg star rating & total reviews" },
  { icon: LineChart, label: "7-Day Trend", desc: "Visual views sparkline chart" },
  { icon: Zap, label: "Quick Actions", desc: "Edit, advertise, post jobs, view leads" },
  { icon: MessageSquare, label: "Recent Leads", desc: "Latest enquiries at a glance" },
  { icon: FileText, label: "Recent Reviews", desc: "Latest customer feedback" },
  { icon: Target, label: "Profile Score", desc: "Completeness bar with action tips" },
  { icon: Bell, label: "Notifications", desc: "Alerts for leads, bookings & reviews" },
  { icon: TrendingUp, label: "Analytics", desc: "Deep-dive charts and data exports" },
  { icon: Award, label: "Verification", desc: "Request and track badge status" },
];

const plans = [
  {
    name: "Free",
    price: "GHS 0",
    period: "/month",
    color: "border-border",
    badge: "",
    features: [
      "Business profile listing",
      "Up to 5 product listings",
      "Basic analytics",
      "Customer reviews",
      "1 active job post",
    ],
  },
  {
    name: "Pro",
    price: "GHS 99",
    period: "/month",
    color: "border-primary",
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Unlimited products & menu",
      "Lead capture forms & CRM",
      "Ad campaign creation",
      "Up to 5 job posts",
      "Resume database access",
      "Advanced analytics",
    ],
  },
  {
    name: "Business",
    price: "GHS 299",
    period: "/month",
    color: "border-amber-500",
    badge: "Enterprise",
    features: [
      "Everything in Pro",
      "Unlimited job posts",
      "A/B ad testing & ROI tracking",
      "AI job description generator",
      "AI lead scoring",
      "Priority support",
      "Verification fast-track",
    ],
  },
];

export default function PlatformOverview() {
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = PRINT_STYLES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print">
        <Navbar />
      </div>

      {/* Print Header (only shows on print) */}
      <div className="hidden print:block brochure-hero text-white p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={logoImage} alt="GHKonect" className="w-12 h-12 rounded-xl" />
          <span className="text-2xl font-bold">GHKonect</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Business Benefits & Platform Overview</h1>
        <p className="text-lg opacity-90">Ghana's #1 Business Directory & Commerce Platform</p>
        <p className="text-sm opacity-75 mt-1">ghkonect.com · support@ghkonect.com</p>
      </div>

      <div className="print-page">
        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground py-20 px-4 no-print">
          <div className="container mx-auto text-center max-w-4xl">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              Ghana's #1 Business Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Everything Your Business Needs to Grow in Ghana
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              From verified profiles and online shops to job postings, event ticketing, and AI-powered ads — all in one platform built for Ghanaian businesses.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                onClick={() => navigate('/register-business')}
              >
                <Building2 className="h-5 w-5" />
                Register Your Business
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleDownload}
              >
                <Download className="h-5 w-5" />
                Download PDF Brochure
              </Button>
            </div>
          </div>
        </section>

        {/* Print-only Hero Text */}
        <div className="hidden print:block mb-8">
          <p className="text-base text-muted-foreground">
            From verified profiles and online shops to job postings, event ticketing, and AI-powered ad campaigns — GHKonect provides everything Ghanaian businesses need to grow their online presence and attract customers.
          </p>
        </div>

        {/* Stats Bar */}
        <section className="bg-muted/50 border-y border-border py-8 no-print">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: "10+", label: "Business Tools" },
                { value: "3", label: "Subscription Tiers" },
                { value: "16", label: "Ghana Regions" },
                { value: "100%", label: "Ghana-focused" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 px-4 container mx-auto">
          <div className="text-center mb-12 print-avoid-break">
            <h2 className="text-3xl font-display font-bold mb-3 brochure-accent">
              Platform Benefits for Businesses
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools to manage, grow, and monetise your business — all from one dashboard.
            </p>
          </div>

          <div className="feature-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="print-avoid-break border border-border rounded-xl p-6 bg-card hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
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

        {/* Dashboard Features */}
        <section className="py-16 px-4 bg-muted/30 border-y border-border print-break">
          <div className="container mx-auto">
            <div className="text-center mb-12 print-avoid-break">
              <h2 className="text-3xl font-display font-bold mb-3 brochure-accent">
                Your Business Dashboard
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every metric you need, at a glance. Your control centre for day-to-day business management.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dashboardFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.label}
                    className="print-avoid-break bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 w-fit mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-semibold text-sm mb-1">{feat.label}</div>
                    <div className="text-xs text-muted-foreground">{feat.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Dashboard Quick Actions List */}
            <div className="mt-10 bg-card border border-border rounded-xl p-6 print-avoid-break">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Dashboard Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Edit Business Profile",
                  "Run Ad Campaign",
                  "Post a Job",
                  "View Leads",
                  "Manage Shop Products",
                  "Restaurant Menu",
                  "Hotel Rooms & Bookings",
                  "Business Analytics",
                ].map((action) => (
                  <div key={action} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-4 container mx-auto print-break">
          <div className="text-center mb-12 print-avoid-break">
            <h2 className="text-3xl font-display font-bold mb-3 brochure-accent">
              Subscription Plans
            </h2>
            <p className="text-muted-foreground">Start free, upgrade as you grow.</p>
          </div>

          <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`print-avoid-break border-2 ${plan.color} rounded-xl p-6 bg-card relative`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    {plan.badge}
                  </Badge>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-xl">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Contact & CTA */}
        <section className="py-16 px-4 bg-primary text-primary-foreground no-print">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="opacity-90 mb-8 text-lg">
              Join thousands of Ghanaian businesses already on GHKonect. Register today and get your business in front of customers across all 16 regions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
                onClick={() => navigate('/register-business')}
              >
                <Building2 className="h-5 w-5" />
                Register Your Business
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/subscription-plans')}
              >
                <CreditCard className="h-5 w-5" />
                View Pricing Plans
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm opacity-80">
              <div className="flex items-center justify-center gap-2">
                <Globe className="h-4 w-4" />
                ghkonect.com
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                +233 XX XXX XXXX
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                Accra, Ghana
              </div>
            </div>
          </div>
        </section>

        {/* Print-only footer contact */}
        <div className="hidden print:block print-footer text-center text-xs text-muted-foreground border-t border-border pt-4 mt-8">
          <p className="font-semibold">GHKonect — Ghana's #1 Business Directory & Commerce Platform</p>
          <p>ghkonect.com · Accra, Ghana · © {new Date().getFullYear()} GHKonect. All rights reserved.</p>
        </div>

        {/* Floating Download Button */}
        <div className="no-print fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="gap-2 shadow-lg"
            onClick={handleDownload}
          >
            <Download className="h-5 w-5" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
