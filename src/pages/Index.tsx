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
import { NewsChannel } from "@/components/NewsChannel";


const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <AdSlot location="home_hero" className="container mx-auto px-4 my-8" />
        
        {/* Business News Channel */}
        <section className="container mx-auto px-4 my-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Business News Live</h2>
            <p className="text-muted-foreground">Stay updated with the latest business news from Ghana</p>
          </div>
          <NewsChannel />
        </section>

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
