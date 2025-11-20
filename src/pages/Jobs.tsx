import { useState } from "react";
import { Briefcase } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import CategoryPills from "@/components/CategoryPills";
import AdSlot from "@/components/AdSlot";
import { usePublicJobs } from "@/hooks/useJobs";
import { Skeleton } from "@/components/ui/skeleton";

const Jobs = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const { data: jobs, isLoading } = usePublicJobs({
    category: category || undefined,
    location: location || undefined,
    jobType: jobType || undefined,
    experienceLevel: experienceLevel || undefined,
    search: search || undefined,
  });

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    setJobType("");
    setExperienceLevel("");
    setSortBy("latest");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="gradient-hero py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Briefcase className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                Find Your Next Opportunity
              </h1>
            </div>
            <p className="text-lg text-white/90 max-w-2xl">
              Browse quality job listings from businesses across Ghana
            </p>
          </div>
        </section>

        {/* Category Pills */}
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <CategoryPills
              selectedCategory={category}
              onCategorySelect={setCategory}
            />
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <JobFilters
                  search={search}
                  category={category}
                  location={location}
                  jobType={jobType}
                  experienceLevel={experienceLevel}
                  sortBy={sortBy}
                  onSearchChange={setSearch}
                  onCategoryChange={setCategory}
                  onLocationChange={setLocation}
                  onJobTypeChange={setJobType}
                  onExperienceLevelChange={setExperienceLevel}
                  onSortByChange={setSortBy}
                  onClearFilters={handleClearFilters}
                />
              </aside>

              {/* Job Listings */}
              <div className="lg:col-span-2 space-y-6">
                {/* Results Count */}
                {!isLoading && (
                  <div className="text-sm text-muted-foreground">
                    {jobs?.length || 0} {jobs?.length === 1 ? 'job' : 'jobs'} found
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-48 w-full" />
                    ))}
                  </div>
                )}

                {/* Job Cards */}
                {!isLoading && jobs && jobs.length > 0 && (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && (!jobs || jobs.length === 0) && (
                  <div className="text-center py-20">
                    <Briefcase className="h-20 w-20 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters to see more results
                    </p>
                  </div>
                )}
              </div>

              {/* Ad Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-20">
                  <AdSlot location="business_list_top" />
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
