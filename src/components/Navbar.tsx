import { Button } from "@/components/ui/button";
import { Building2, Menu, User, Heart, LogOut, LayoutDashboard, MessageCircle, TrendingUp, Bookmark, Bell, CreditCard, Database, Hotel, Briefcase, X } from "lucide-react";
import logoImage from "@/assets/logo-ghkonect.jpg";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useBusinessSubscription } from "@/hooks/useBusinessSubscription";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, hasRole, signOut } = useAuth();
  
  // Get user's primary business
  const { data: primaryBusinessId } = useQuery({
    queryKey: ['primary-business', user?.id],
    queryFn: async () => {
      if (!user?.id || !hasRole('business_owner')) return null;
      
      const { data, error } = await supabase
        .from('business_owners')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching primary business:', error);
        return null;
      }
      
      return data?.business_id || null;
    },
    enabled: !!user?.id && hasRole('business_owner'),
  });
  
  const { subscription } = useBusinessSubscription(primaryBusinessId || "");

  const isHome = location.pathname === '/';

  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = 64;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - navbarHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

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
            <img 
              src={logoImage} 
              alt="GHKonect Logo" 
              className="w-10 h-10 rounded-xl object-cover"
            />
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
              onClick={() => navigate('/business-news')}
              className="text-sm font-medium hover:text-primary transition-smooth"
            >
              Business News
            </button>
            <button 
              onClick={() => navigate('/hotels')}
              className="text-sm font-medium hover:text-primary transition-smooth"
            >
              Hotels
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
                <button onClick={() => scrollToSection('features')} className="text-sm font-medium hover:text-primary transition-smooth">
                  Features
                </button>
                <button onClick={() => scrollToSection('benefits')} className="text-sm font-medium hover:text-primary transition-smooth">
                  Benefits
                </button>
                <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium hover:text-primary transition-smooth">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('about')} className="text-sm font-medium hover:text-primary transition-smooth">
                  About
                </button>
              </>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
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
                    <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
                      <Building2 className="mr-2 h-4 w-4" />
                      My Bookings
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
                      <>
                        <DropdownMenuItem onClick={() => navigate('/my-businesses')}>
                          <Building2 className="mr-2 h-4 w-4" />
                          My Businesses
                          {subscription && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {subscription.subscription_plans?.name}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/purchase-ad')}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Purchase Ad
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/resume-database')}>
                          <Database className="mr-2 h-4 w-4" />
                          Resume Database
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/dashboard/hotel')}>
                          <Building2 className="mr-2 h-4 w-4" />
                          Hotel Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/subscription-plans')}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscription Plans
                        </DropdownMenuItem>
                        {subscription && (
                          <DropdownMenuItem onClick={() => navigate('/manage-subscription')}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Manage Subscription
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    {!hasRole('business_owner') && !hasRole('admin') && (
                      <DropdownMenuItem onClick={() => navigate('/subscription-plans')}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Upgrade to Pro
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

          {/* Mobile Menu - Sheet Slide-in */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 hover:bg-muted rounded-lg transition-smooth">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <SheetHeader className="p-4 pb-2 border-b border-border/50">
                <SheetTitle className="flex items-center gap-2">
                  <img 
                    src={logoImage} 
                    alt="GHKonect Logo" 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span className="font-display font-bold">GHKonect</span>
                </SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="h-[calc(100vh-80px)]">
                <div className="p-4 space-y-4">
                  {/* Navigation Section */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                      Navigation
                    </p>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-11 text-base"
                      onClick={() => handleNavigate('/businesses')}
                    >
                      <Building2 className="mr-3 h-5 w-5" />
                      Businesses
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-11 text-base"
                      onClick={() => handleNavigate('/business-news')}
                    >
                      <Briefcase className="mr-3 h-5 w-5" />
                      Business News
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-11 text-base"
                      onClick={() => handleNavigate('/hotels')}
                    >
                      <Hotel className="mr-3 h-5 w-5" />
                      Hotels
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-11 text-base"
                      onClick={() => handleNavigate('/jobs')}
                    >
                      <Briefcase className="mr-3 h-5 w-5" />
                      Jobs
                    </Button>
                    {user && !hasRole('business_owner') && !hasRole('admin') && (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-11 text-base"
                        onClick={() => handleNavigate('/my-applications')}
                      >
                        <Briefcase className="mr-3 h-5 w-5" />
                        My Applications
                      </Button>
                    )}
                  </div>

                  {/* Homepage Sections */}
                  {isHome && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                          On This Page
                        </p>
                        <Button variant="ghost" className="w-full justify-start h-10" onClick={() => scrollToSection('features')}>
                          Features
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-10" onClick={() => scrollToSection('benefits')}>
                          Benefits
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-10" onClick={() => scrollToSection('pricing')}>
                          Pricing
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-10" onClick={() => scrollToSection('about')}>
                          About
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Account Section */}
                  {user ? (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                          Account
                        </p>
                        <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/profile')}>
                          <User className="mr-3 h-5 w-5" />
                          Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/inbox')}>
                          <MessageCircle className="mr-3 h-5 w-5" />
                          Messages
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/favorites')}>
                          <Heart className="mr-3 h-5 w-5" />
                          Favorites
                        </Button>
                        <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/my-bookings')}>
                          <Hotel className="mr-3 h-5 w-5" />
                          My Bookings
                        </Button>
                        
                        {!hasRole('business_owner') && !hasRole('admin') && (
                          <>
                            <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/saved-jobs')}>
                              <Bookmark className="mr-3 h-5 w-5" />
                              Saved Jobs
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/job-alerts')}>
                              <Bell className="mr-3 h-5 w-5" />
                              Job Alerts
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Business Owner Section */}
                      {hasRole('business_owner') && (
                        <>
                          <Separator />
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                              Business
                            </p>
                            <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/my-businesses')}>
                              <Building2 className="mr-3 h-5 w-5" />
                              My Businesses
                              {subscription && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {subscription.subscription_plans?.name}
                                </Badge>
                              )}
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/purchase-ad')}>
                              <TrendingUp className="mr-3 h-5 w-5" />
                              Purchase Ad
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/resume-database')}>
                              <Database className="mr-3 h-5 w-5" />
                              Resume Database
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/dashboard/hotel')}>
                              <Hotel className="mr-3 h-5 w-5" />
                              Hotel Dashboard
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/subscription-plans')}>
                              <CreditCard className="mr-3 h-5 w-5" />
                              Subscription Plans
                            </Button>
                            {subscription && (
                              <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/manage-subscription')}>
                                <CreditCard className="mr-3 h-5 w-5" />
                                Manage Subscription
                              </Button>
                            )}
                          </div>
                        </>
                      )}

                      {/* Job Seeker Upgrade */}
                      {!hasRole('business_owner') && !hasRole('admin') && (
                        <>
                          <Separator />
                          <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/subscription-plans')}>
                            <CreditCard className="mr-3 h-5 w-5" />
                            Upgrade to Pro
                          </Button>
                        </>
                      )}

                      {/* Admin Section */}
                      {hasRole('admin') && (
                        <>
                          <Separator />
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                              Admin
                            </p>
                            <Button variant="ghost" className="w-full justify-start h-11 text-base" onClick={() => handleNavigate('/admin/dashboard')}>
                              <LayoutDashboard className="mr-3 h-5 w-5" />
                              Admin Dashboard
                            </Button>
                          </div>
                        </>
                      )}

                      {/* Sign Out */}
                      <Separator />
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-11 text-base text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => { signOut(); setIsOpen(false); }}
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Separator />
                      <div className="space-y-3 pt-2">
                        <Button variant="outline" className="w-full h-11 text-base" onClick={() => handleNavigate('/auth')}>
                          Sign In
                        </Button>
                        <Button className="w-full h-11 text-base" onClick={() => handleNavigate('/auth')}>
                          Get Started
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
