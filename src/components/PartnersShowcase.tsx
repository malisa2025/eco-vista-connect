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
    <section className="py-6 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        {/* Header with Badge */}
        <div className="flex flex-col items-center mb-4">
          <Badge variant="secondary" className="mb-2">
            Sponsored
          </Badge>
          <h2 className="text-xl md:text-2xl font-bold text-center">
            Trusted by Leading Organizations
          </h2>
        </div>

        {/* Single-Line Horizontal Layout */}
        <div className="flex items-center justify-center gap-8 md:gap-12 overflow-x-auto pb-2 scrollbar-hide">
          {partners.map((partner, index) => (
            <div 
              key={partner.id}
              className="flex-shrink-0 animate-fade-in"
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
                    className="h-12 md:h-14 w-auto object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                  />
                </a>
              ) : (
                <img
                  src={partner.logo_url}
                  alt={`${partner.name} logo`}
                  className="h-12 md:h-14 w-auto object-contain opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-105"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
