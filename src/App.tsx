import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Businesses from "./pages/Businesses";
import BusinessDetail from "./pages/BusinessDetail";
import Auth from "./pages/Auth";
import CheckEmail from "./pages/CheckEmail";
import Profile from "./pages/Profile";
import RegisterBusiness from "./pages/RegisterBusiness";
import MyBusinesses from "./pages/MyBusinesses";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import JobDetail from "./pages/JobDetail";
import SubscribeJobSeeker from "./pages/SubscribeJobSeeker";
import MyApplications from "./pages/MyApplications";
import JobApplications from "./pages/JobApplications";
import AdAnalytics from "./pages/AdAnalytics";
import Favorites from "./pages/Favorites";
import SavedJobs from "./pages/SavedJobs";
import JobAlerts from "./pages/JobAlerts";
import Notifications from "./pages/Notifications";
import Inbox from "./pages/Inbox";
import EditBusiness from "./pages/EditBusiness";
import PurchaseAd from "./pages/PurchaseAd";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminClaims from "./pages/admin/Claims";
import AdminBusinesses from "./pages/admin/Businesses";
import AdminUsers from "./pages/admin/Users";
import AdminAdvertisements from "./pages/admin/Advertisements";
import AdminJobs from "./pages/admin/Jobs";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminPartners from "./pages/admin/Partners";
import AdminVerifications from "./pages/admin/Verifications";
import AdminReviewModeration from "./pages/admin/ReviewModeration";
import AdminSubscriptionPlansManager from "./pages/admin/SubscriptionPlansManager";
import AdminPromoCodesManager from "./pages/admin/PromoCodesManager";
import ResumeDatabase from "./pages/ResumeDatabase";
import JobPerformance from "./pages/JobPerformance";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import HiringPipeline from "./pages/HiringPipeline";
import SeedDemoData from "./pages/SeedDemoData";
import NotFound from "./pages/NotFound";
import BusinessNews from "./pages/BusinessNews";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import BusinessSubscriptionCheckout from "./pages/BusinessSubscriptionCheckout";
import ManageSubscription from "./pages/ManageSubscription";
import LeadDashboard from "./pages/LeadDashboard";
import Hotels from "./pages/Hotels";
import HotelDetail from "./pages/HotelDetail";
import HotelBooking from "./pages/HotelBooking";
import MyBookings from "./pages/MyBookings";
import HotelDashboard from "./pages/dashboard/HotelDashboard";
import HotelSetup from "./pages/dashboard/HotelSetup";
import BusinessDashboard from "./pages/dashboard/BusinessDashboard";
import RestaurantDashboard from "./pages/dashboard/RestaurantDashboard";
import HotelRooms from "./pages/dashboard/HotelRooms";
import HotelBookings from "./pages/dashboard/HotelBookings";
import HotelSettings from "./pages/dashboard/HotelSettings";
import MenuManager from "./pages/dashboard/MenuManager";
import ProductManager from "./pages/dashboard/ProductManager";
import RestaurantReservations from "./pages/dashboard/RestaurantReservations";
import MyReservations from "./pages/MyReservations";
import UserDashboard from "./pages/UserDashboard";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
                <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/businesses/:id" element={<BusinessDetail />} />
        <Route path="/businesses/:id/edit" element={<ProtectedRoute><EditBusiness /></ProtectedRoute>} />
        <Route path="/business-news" element={<BusinessNews />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />
        <Route path="/hotels/:id/book" element={<ProtectedRoute><HotelBooking /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/my-reservations" element={<ProtectedRoute><MyReservations /></ProtectedRoute>} />
          {/* Hotel Owner Dashboard Routes */}
          <Route path="/dashboard/hotel" element={<ProtectedRoute requireRole="business_owner"><HotelDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/hotel/setup" element={<ProtectedRoute requireRole="business_owner"><HotelSetup /></ProtectedRoute>} />
          <Route path="/dashboard/hotel/rooms" element={<ProtectedRoute requireRole="business_owner"><HotelRooms /></ProtectedRoute>} />
          <Route path="/dashboard/hotel/bookings" element={<ProtectedRoute requireRole="business_owner"><HotelBookings /></ProtectedRoute>} />
          <Route path="/dashboard/hotel/settings" element={<ProtectedRoute requireRole="business_owner"><HotelSettings /></ProtectedRoute>} />
          <Route path="/dashboard/menu/:id" element={<ProtectedRoute requireRole="business_owner"><MenuManager /></ProtectedRoute>} />
          <Route path="/dashboard/products/:id" element={<ProtectedRoute requireRole="business_owner"><ProductManager /></ProtectedRoute>} />
          <Route path="/dashboard/reservations/:id" element={<ProtectedRoute requireRole="business_owner"><RestaurantReservations /></ProtectedRoute>} />
          {/* Business Owner Dashboards by Type */}
          <Route path="/dashboard/business/:id" element={<ProtectedRoute requireRole="business_owner"><BusinessDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/restaurant/:id" element={<ProtectedRoute requireRole="business_owner"><RestaurantDashboard /></ProtectedRoute>} />
          
          <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/subscribe-job-seeker" element={<SubscribeJobSeeker />} />
                <Route
                  path="/saved-jobs"
                  element={
                    <ProtectedRoute>
                      <SavedJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/job-alerts"
                  element={
                    <ProtectedRoute>
                      <JobAlerts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-applications"
                  element={
                    <ProtectedRoute>
                      <MyApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/job-applications/:jobId"
                  element={
                    <ProtectedRoute requireRole="business_owner">
                      <JobApplications />
                    </ProtectedRoute>
                  }
                />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/subscription-plans" element={<SubscriptionPlans />} />
            <Route path="/business-subscription-checkout" element={<ProtectedRoute requireRole="business_owner"><BusinessSubscriptionCheckout /></ProtectedRoute>} />
            <Route path="/manage-subscription" element={<ProtectedRoute><ManageSubscription /></ProtectedRoute>} />
            <Route path="/leads/:businessId" element={<ProtectedRoute requireRole="business_owner"><LeadDashboard /></ProtectedRoute>} />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-business"
              element={
                <ProtectedRoute>
                  <RegisterBusiness />
                </ProtectedRoute>
              }
            />
                <Route
                  path="/my-businesses"
                  element={
                    <ProtectedRoute requireRole="business_owner">
                      <MyBusinesses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-job"
                  element={
                    <ProtectedRoute requireRole="business_owner">
                      <PostJob />
                    </ProtectedRoute>
                  }
                />
            <Route
              path="/purchase-ad"
              element={
                <ProtectedRoute requireRole="business_owner">
                  <PurchaseAd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ad-analytics/:adId"
              element={
                <ProtectedRoute requireRole="business_owner">
                  <AdAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-performance/:jobId"
              element={
                <ProtectedRoute requireRole="business_owner">
                  <JobPerformance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business-analytics/:businessId"
              element={
                <ProtectedRoute requireRole="business_owner">
                  <BusinessAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiring-pipeline/:jobId"
              element={
                <ProtectedRoute requireRole="business_owner">
                  <HiringPipeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/claims"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminClaims />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/businesses"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminBusinesses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/advertisements"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminAdvertisements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminSubscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/partners"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminPartners />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminVerifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/review-moderation"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminReviewModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscription-plans"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminSubscriptionPlansManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promo-codes"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminPromoCodesManager />
              </ProtectedRoute>
            }
          />
          <Route path="/resume-database" element={<ProtectedRoute requireRole="business_owner"><ResumeDatabase /></ProtectedRoute>} />
          <Route path="/seed-demo-data" element={<SeedDemoData />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
