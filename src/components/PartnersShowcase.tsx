import { Badge } from '@/components/ui/badge';
import { usePartners } from '@/hooks/usePartners';
import { Skeleton } from '@/components/ui/skeleton';

export const PartnersShowcase = () => {
  const { data: partners, isLoading } = usePartners();

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-8">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        {/* Header with Badge */}
        <div className="flex flex-col items-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Sponsored
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Trusted by Leading Organizations
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            Partnering with Ghana's most respected institutions and businesses
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div 
              key={partner.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {partner.website_url ? (
                <a 
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                  aria-label={partner.name}
                >
                  <img
                    src={partner.logo_url}
                    alt={`${partner.name} logo`}
                    className="h-16 md:h-20 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                  />
                </a>
              ) : (
                <img
                  src={partner.logo_url}
                  alt={`${partner.name} logo`}
                  className="h-16 md:h-20 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
