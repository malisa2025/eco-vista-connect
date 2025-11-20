import { Button } from "@/components/ui/button";
import { Building2, Menu, User, Heart, LogOut, LayoutDashboard, MessageCircle, TrendingUp, Bookmark, Bell } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, hasRole, signOut } = useAuth();

  const isHome = location.pathname === '/';

  const getInitials = () => {
    if (!profile?.full_name) return 'U';
    return profile.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold">GHKonect</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate('/businesses')}
              className="text-sm font-medium hover:text-primary transition-smooth"
            >
              Businesses
            </button>
            <button 
              onClick={() => navigate('/jobs')}
              className="text-sm font-medium hover:text-primary transition-smooth"
            >
              Jobs
            </button>
            {user && !hasRole('business_owner') && !hasRole('admin') && (
              <button 
                onClick={() => navigate('/my-applications')}
                className="text-sm font-medium hover:text-primary transition-smooth"
              >
                My Applications
              </button>
            )}
            {isHome && (
              <>
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
              </>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate('/favorites')}>
                  <Heart className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/inbox')}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/favorites')}>
                      <Heart className="mr-2 h-4 w-4" />
                      Favorites
                    </DropdownMenuItem>
                    {!hasRole('business_owner') && !hasRole('admin') && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/saved-jobs')}>
                          <Bookmark className="mr-2 h-4 w-4" />
                          Saved Jobs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/job-alerts')}>
                          <Bell className="mr-2 h-4 w-4" />
                          Job Alerts
                        </DropdownMenuItem>
                      </>
                    )}
                    {hasRole('business_owner') && (
                      <DropdownMenuItem onClick={() => navigate('/my-businesses')}>
                        <Building2 className="mr-2 h-4 w-4" />
                        My Businesses
                      </DropdownMenuItem>
                    )}
                    {hasRole('business_owner') && (
                      <DropdownMenuItem onClick={() => navigate('/purchase-ad')}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Purchase Ad
                      </DropdownMenuItem>
                    )}
                    {hasRole('admin') && (
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth')}>Get Started</Button>
              </>
            )}
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
              <button 
                onClick={() => { navigate('/businesses'); setIsOpen(false); }}
                className="text-sm font-medium hover:text-primary transition-smooth py-2 text-left"
              >
                Businesses
              </button>
              <button 
                onClick={() => { navigate('/jobs'); setIsOpen(false); }}
                className="text-sm font-medium hover:text-primary transition-smooth py-2 text-left"
              >
                Jobs
              </button>
              {user && !hasRole('business_owner') && !hasRole('admin') && (
                <button 
                  onClick={() => { navigate('/my-applications'); setIsOpen(false); }}
                  className="text-sm font-medium hover:text-primary transition-smooth py-2 text-left"
                >
                  My Applications
                </button>
              )}
              {isHome && (
                <>
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
                </>
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                {user ? (
                  <>
                    <Button variant="ghost" className="w-full" onClick={() => { navigate('/profile'); setIsOpen(false); }}>
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => { navigate('/favorites'); setIsOpen(false); }}>
                      Favorites
                    </Button>
                    {hasRole('business_owner') && (
                      <Button variant="ghost" className="w-full" onClick={() => { navigate('/my-businesses'); setIsOpen(false); }}>
                        My Businesses
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => { signOut(); setIsOpen(false); }}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                      Sign In
                    </Button>
                    <Button className="w-full" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
