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
import JobPerformance from "./pages/JobPerformance";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import HiringPipeline from "./pages/HiringPipeline";
import SeedDemoData from "./pages/SeedDemoData";
import NotFound from "./pages/NotFound";
import BusinessNews from "./pages/BusinessNews";

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
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/businesses/:id" element={<BusinessDetail />} />
        <Route path="/businesses/:id/edit" element={<ProtectedRoute><EditBusiness /></ProtectedRoute>} />
        <Route path="/business-news" element={<BusinessNews />} />
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
