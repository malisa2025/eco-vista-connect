import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FeaturedBusinesses from "@/components/FeaturedBusinesses";
import RegionsShowcase from "@/components/RegionsShowcase";
import GhanaMap from "@/components/GhanaMap";
import Benefits from "@/components/Benefits";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { SponsoredVideoCarousel } from "@/components/SponsoredVideoCarousel";


const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <SponsoredVideoCarousel className="container mx-auto px-4 mt-0 mb-6" />
        <Features />
        <FeaturedBusinesses />
        <AdSlot location="home_sidebar" className="container mx-auto px-4 my-8" />
        <RegionsShowcase />
        <GhanaMap />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
