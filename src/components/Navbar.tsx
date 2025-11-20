import { Button } from "@/components/ui/button";
import { Building2, Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold">GHKonect</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium hover:text-primary transition-smooth">
              Benefits
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-smooth">
              Pricing
            </a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-smooth">
              About
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost">Sign In</Button>
            <Button>Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-smooth"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth py-2">
                Features
              </a>
              <a href="#benefits" className="text-sm font-medium hover:text-primary transition-smooth py-2">
                Benefits
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-smooth py-2">
                Pricing
              </a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition-smooth py-2">
                About
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button variant="ghost" className="w-full">Sign In</Button>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
