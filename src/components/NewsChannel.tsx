import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  time: string;
  isLive?: boolean;
}

const newsItems: NewsItem[] = [
  { id: '1', title: 'Ghana Stock Exchange hits new high as tech sector surges', category: 'Markets', time: '2m ago', isLive: true },
  { id: '2', title: 'New fintech startup raises $5M in Series A funding', category: 'Startups', time: '15m ago' },
  { id: '3', title: 'Ghana Chamber of Commerce announces digital transformation initiative', category: 'Business', time: '32m ago' },
  { id: '4', title: 'Agricultural exports increase by 23% in Q4', category: 'Economy', time: '1h ago' },
  { id: '5', title: 'Major telecom provider launches 5G network in Accra', category: 'Technology', time: '2h ago' },
  { id: '6', title: 'Real estate market shows strong growth in regional cities', category: 'Property', time: '3h ago' },
];

export const NewsChannel = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentNews = newsItems[currentNewsIndex];

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5 border-primary/10">
      <div className="relative">
        {/* Video player area */}
        <div className="relative aspect-video bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
          {/* Animated background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          
          {/* Live indicator */}
          {currentNews.isLive && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="destructive" className="animate-pulse">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE
              </Badge>
            </div>
          )}

          {/* News content overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6 space-y-4">
              <div className="inline-block">
                <Badge variant="secondary" className="mb-4">
                  {currentNews.category}
                </Badge>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground max-w-2xl mx-auto leading-tight">
                {currentNews.title}
              </h3>
              <p className="text-sm text-muted-foreground">{currentNews.time}</p>
            </div>
          </div>

          {/* Play/Pause overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <Button
                size="lg"
                className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90"
                onClick={() => setIsPlaying(true)}
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
          )}

          {/* Controls */}
          {isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setIsPlaying(false)}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* News ticker */}
        <div className="bg-primary/5 border-t border-primary/10 p-3 overflow-hidden">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0 border-primary/20">
              Business News
            </Badge>
            <div className="overflow-hidden">
              <div className="animate-marquee whitespace-nowrap text-sm text-muted-foreground">
                {newsItems.map((item, idx) => (
                  <span key={item.id} className="inline-block mx-8">
                    <span className="font-semibold text-foreground">{item.category}:</span> {item.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
