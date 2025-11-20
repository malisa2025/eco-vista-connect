import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const regions = [
  { name: "Greater Accra", businessCount: 2847, coordinates: [-0.1870, 5.6037] },
  { name: "Ashanti", businessCount: 2156, coordinates: [-1.6163, 6.7000] },
  { name: "Western", businessCount: 1234, coordinates: [-2.3200, 5.2000] },
  { name: "Western North", businessCount: 892, coordinates: [-2.5000, 6.2000] },
  { name: "Central", businessCount: 1456, coordinates: [-1.0500, 5.2500] },
  { name: "Eastern", businessCount: 1678, coordinates: [-0.4500, 6.2000] },
  { name: "Volta", businessCount: 1123, coordinates: [0.4200, 6.5700] },
  { name: "Oti", businessCount: 645, coordinates: [0.3500, 7.9000] },
  { name: "Northern", businessCount: 1089, coordinates: [-0.8400, 9.4000] },
  { name: "Savannah", businessCount: 734, coordinates: [-1.8200, 8.9000] },
  { name: "North East", businessCount: 567, coordinates: [-0.3700, 10.5200] },
  { name: "Upper East", businessCount: 823, coordinates: [-0.9000, 10.7200] },
  { name: "Upper West", businessCount: 698, coordinates: [-2.3000, 10.3000] },
  { name: "Bono", businessCount: 945, coordinates: [-2.5000, 7.6000] },
  { name: "Bono East", businessCount: 712, coordinates: [-1.0500, 7.7500] },
  { name: "Ahafo", businessCount: 534, coordinates: [-2.3200, 7.0800] },
];

const GhanaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenEntered, setTokenEntered] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !tokenEntered || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-1.0232, 7.9465], // Center of Ghana
      zoom: 6,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Wait for map to load before adding markers
    map.current.on('load', () => {
      // Add markers for each region
      regions.forEach((region) => {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'region-marker';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = 'hsl(var(--primary))';
        el.style.border = '3px solid hsl(var(--background))';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'hsl(var(--primary-foreground))';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '12px';
        el.style.transition = 'all 0.3s ease';
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        
        // Add hover effect
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
          el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });

        // Create popup with business statistics
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: 'region-popup',
        }).setHTML(`
          <div style="padding: 8px; min-width: 180px;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: hsl(var(--foreground));">${region.name}</h3>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: hsl(var(--primary) / 0.1); display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <p style="font-size: 24px; font-weight: bold; color: hsl(var(--primary)); margin: 0;">${region.businessCount.toLocaleString()}</p>
                <p style="font-size: 12px; color: hsl(var(--muted-foreground)); margin: 0;">businesses</p>
              </div>
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid hsl(var(--border));">
              <p style="font-size: 12px; color: hsl(var(--primary)); margin: 0; cursor: pointer; font-weight: 500;">Click to explore →</p>
            </div>
          </div>
        `);

        // Create marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat(region.coordinates as [number, number])
          .setPopup(popup)
          .addTo(map.current!);

        // Show popup on hover
        el.addEventListener('mouseenter', () => {
          popup.addTo(map.current!);
        });

        // Click handler
        el.addEventListener('click', () => {
          console.log(`Clicked region: ${region.name}`);
          // Future: Navigate to /businesses?region=${region.name}
        });

        markersRef.current.push(marker);
      });
    });

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [tokenEntered, mapboxToken]);

  if (!tokenEntered) {
    return (
      <section className="py-24 px-4 bg-gradient-subtle">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Enter Mapbox Token</h2>
              <p className="text-muted-foreground text-sm">
                To display the interactive Ghana map, please enter your Mapbox public token.
                <br />
                Get your token at{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="font-mono text-sm"
              />
              <Button 
                onClick={() => setTokenEntered(true)}
                disabled={!mapboxToken}
                className="w-full"
              >
                Load Map
              </Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 bg-gradient-subtle">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Interactive Regional Map
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Click on any region to explore businesses. Hover over markers for detailed statistics.
          </p>
        </div>

        <Card className="overflow-hidden shadow-elegant animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div 
            ref={mapContainer} 
            className="w-full h-[600px] md:h-[700px]"
          />
        </Card>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary mb-1">16</p>
            <p className="text-sm text-muted-foreground">Regions</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary mb-1">
              {regions.reduce((sum, r) => sum + r.businessCount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Businesses</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary mb-1">
              {Math.round(regions.reduce((sum, r) => sum + r.businessCount, 0) / regions.length).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Avg per Region</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary mb-1">
              {regions.sort((a, b) => b.businessCount - a.businessCount)[0].name.split(' ')[0]}
            </p>
            <p className="text-sm text-muted-foreground">Top Region</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GhanaMap;
