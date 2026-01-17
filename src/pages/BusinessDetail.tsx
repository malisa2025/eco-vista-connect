import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackBusinessView } from "@/hooks/useBusinessViews";
import { useBusinessProducts } from "@/hooks/useBusinessProducts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import ContactBusinessButton from "@/components/ContactBusinessButton";
import AdSlot from "@/components/AdSlot";
import { FloatingContactButton } from "@/components/leads/FloatingContactButton";
import { ExitIntentPopup } from "@/components/leads/ExitIntentPopup";
import { EmbeddedLeadForm } from "@/components/leads/EmbeddedLeadForm";
import MenuSection from "@/components/business/MenuSection";
import ProductCatalog from "@/components/business/ProductCatalog";
import ReservationWidget from "@/components/business/ReservationWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ReviewSummary from "@/components/reviews/ReviewSummary";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewsList from "@/components/reviews/ReviewsList";
import { useBusinessReviews, useUserReview, useReviewMutations, useUserHelpfulReviews } from "@/hooks/useBusinessReviews";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import VerificationBadge from "@/components/business/VerificationBadge";
import { BusinessHoursDisplay } from "@/components/business/BusinessHoursStatus";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShoppingBag,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

// Helper to ensure URLs have a protocol
const ensureHttps = (url: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [getInTouchOpen, setGetInTouchOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);

  // Track business view
  useTrackBusinessView(id!);

  // Fetch products to check if shop should be shown
  const { data: products = [] } = useBusinessProducts(id!);
  const hasProducts = products.length > 0;

  const { data: reviews, isLoading: reviewsLoading } = useBusinessReviews(id!);
  const { data: userReview } = useUserReview(id!, user?.id);
  const { data: helpfulReviewIds = [] } = useUserHelpfulReviews(id!, user?.id);
  const { createReview, updateReview, deleteReview, toggleHelpful } = useReviewMutations(id!);

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-96 w-full mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Business not found</h2>
            <Button onClick={() => navigate("/businesses")}>
              Back to Businesses
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/businesses")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Businesses
          </Button>
        </div>

        {/* Hero Image */}
        <div className="relative h-96 bg-gradient-to-br from-primary/10 to-secondary/10">
          {business.image_url ? (
            <img
              src={business.image_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-9xl font-bold text-primary/20">
              {business.name.charAt(0)}
            </div>
          )}
          <div className="absolute top-6 right-6 flex gap-3">
            <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5">
              <VerificationBadge 
                tier={(business.verification_tier as 'none' | 'basic' | 'government' | 'premium') || 'none'} 
                trustScore={business.trust_score || 0}
                showLabel
                size="md"
              />
            </div>
            <div className="bg-background rounded-full shadow-lg">
              <FavoriteButton businessId={id!} size="lg" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {business.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {business.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{business.region}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(business.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">
                    {business.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({business.review_count} reviews)
                  </span>
                </div>
              </div>

              {/* Video Section - Compact inline display */}
              {business.video_url && (
                <div className="w-full">
                  <h2 className="text-xl font-semibold mb-3">Business Introduction</h2>
                  <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black max-w-xl">
                    <VideoPlayer
                      videoUrl={business.video_url}
                      thumbnailUrl={business.video_thumbnail_url || business.image_url}
                      title={business.name}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              {business.description && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">About</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {business.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Menu Section for Restaurants */}
              {business.category?.toLowerCase().includes("restaurant") ||
               business.category?.toLowerCase().includes("food") ||
               business.category?.toLowerCase().includes("cafe") ? (
                <MenuSection businessId={id!} />
              ) : (
                <ProductCatalog businessId={id!} businessName={business.name} />
              )}

              {/* Message Business Button */}
              <ContactBusinessButton businessId={id!} />

            </div>


            {/* Sidebar */}
            <div className="space-y-6">
              {/* Advertisement */}
              <AdSlot location="business_detail_sidebar" />

              {/* Contact Information */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                  
                  {business.address && (
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {business.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {business.phone && (
                    <div className="flex gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a
                          href={`tel:${business.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.email && (
                    <div className="flex gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href={`mailto:${business.email}`}
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {business.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.website && (
                    <div className="flex gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a
                          href={ensureHttps(business.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {business.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                     </div>
                   )}
                 </CardContent>
               </Card>

               {/* Business Hours */}
               {/* Reservation Widget for Restaurants */}
               {(business.category?.toLowerCase().includes("restaurant") ||
                 business.category?.toLowerCase().includes("food") ||
                 business.category?.toLowerCase().includes("cafe")) && (
                 <ReservationWidget businessId={id!} businessName={business.name} />
               )}

               {business.business_hours && (
                 <Card>
                   <CardContent className="pt-6">
                     <BusinessHoursDisplay businessHours={business.business_hours} />
                   </CardContent>
                 </Card>
               )}

               {/* Quick Actions */}
               <Card>
                <CardContent className="pt-6 space-y-3">
                  {business.phone && (
                    <Button className="w-full" asChild>
                      <a href={`tel:${business.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Business
                      </a>
                    </Button>
                  )}

                  {/* Collapsible Get in Touch */}
                  <Collapsible open={getInTouchOpen} onOpenChange={setGetInTouchOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between group">
                        <span className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Get in Touch
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <EmbeddedLeadForm businessId={id!} />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Collapsible Write Review */}
                  {user && !userReview && (
                    <Collapsible open={writeReviewOpen} onOpenChange={setWriteReviewOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between group">
                          <span className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Write a Review
                          </span>
                          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <ReviewForm
                          businessId={id!}
                          onSuccess={() => setWriteReviewOpen(false)}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {business.website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={ensureHttps(business.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}

                  {/* Visit Shop Button */}
                  {hasProducts && (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => navigate(`/businesses/${id}/shop`)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Visit Shop
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl space-y-6">
            <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
            
            <ReviewSummary
              averageRating={business.rating || 0}
              totalReviews={business.review_count || 0}
              ratingDistribution={{
                5: reviews?.filter(r => r.rating === 5).length || 0,
                4: reviews?.filter(r => r.rating === 4).length || 0,
                3: reviews?.filter(r => r.rating === 3).length || 0,
                2: reviews?.filter(r => r.rating === 2).length || 0,
                1: reviews?.filter(r => r.rating === 1).length || 0,
              }}
              onWriteReview={() => setShowReviewForm(true)}
              canWriteReview={!!user && !userReview}
            />

            {showReviewForm && !userReview && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                  <ReviewForm
                    businessId={id!}
                    onSuccess={() => {
                      setShowReviewForm(false);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {userReview && (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Your Review</h3>
                  <ReviewForm
                    businessId={id!}
                    existingReview={userReview}
                    onSuccess={() => {}}
                  />
                </CardContent>
              </Card>
            )}

            <ReviewsList
              reviews={reviews || []}
              isLoading={reviewsLoading}
              onDelete={(reviewId) => deleteReview.mutate(reviewId)}
              onHelpful={(reviewId) => 
                toggleHelpful.mutate({ 
                  reviewId, 
                  isHelpful: helpfulReviewIds.includes(reviewId) 
                })
              }
              helpfulReviewIds={helpfulReviewIds}
            />
          </div>
        </div>
      </main>

      {/* Floating Contact Button */}
      <FloatingContactButton businessId={id!} businessName={business.name} />

      {/* Exit Intent Popup */}
      <ExitIntentPopup businessId={id!} businessName={business.name} />

      <Footer />
    </div>
  );
};

export default BusinessDetail;