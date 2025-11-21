import { Badge } from '@/components/ui/badge';

interface Partner {
  name: string;
  logo: string;
  url?: string;
}

const partners: Partner[] = [
  { 
    name: "Ghana Chamber of Commerce", 
    logo: "/demo/tech-logo.jpg",
    url: "https://www.ghanachamber.org"
  },
  { 
    name: "Ghana Export Promotion Authority", 
    logo: "/demo/fashion-logo.jpg",
    url: "https://www.gepaghana.org"
  },
  { 
    name: "Ghana Police Service", 
    logo: "/demo/restaurant-logo.jpg",
    url: "https://police.gov.gh"
  },
  { 
    name: "Bank of Ghana", 
    logo: "/demo/tech-logo.jpg",
    url: "https://www.bog.gov.gh"
  },
  { 
    name: "Ghana Revenue Authority", 
    logo: "/demo/fashion-logo.jpg",
    url: "https://gra.gov.gh"
  },
  { 
    name: "Ministry of Trade and Industry", 
    logo: "/demo/restaurant-logo.jpg"
  },
  { 
    name: "Ghana Investment Promotion Centre", 
    logo: "/demo/tech-logo.jpg"
  },
  { 
    name: "GCB Bank", 
    logo: "/demo/fashion-logo.jpg"
  },
  { 
    name: "Ecobank Ghana", 
    logo: "/demo/restaurant-logo.jpg"
  },
  { 
    name: "Ghana Standards Authority", 
    logo: "/demo/tech-logo.jpg"
  },
];

export const PartnersShowcase = () => {
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
              key={partner.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {partner.url ? (
                <a 
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                  aria-label={partner.name}
                >
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="h-16 md:h-20 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                  />
                </a>
              ) : (
                <img
                  src={partner.logo}
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
