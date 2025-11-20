import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
} from "lucide-react";

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
          {business.is_verified && (
            <div className="absolute top-6 right-6 bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                          href={business.website}
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
                  {business.website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessDetail;