import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Mail, Globe, CheckCircle2, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

interface BusinessCardProps {
  id: string;
  name: string;
  description: string | null;
  category: string;
  region: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  image_url: string | null;
  video_url?: string | null;
  rating: number;
  review_count: number;
  is_verified: boolean;
}

const BusinessCard = ({
  id,
  name,
  description,
  category,
  region,
  phone,
  email,
  website,
  image_url,
  video_url,
  rating,
  review_count,
  is_verified,
}: BusinessCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
      onClick={() => navigate(`/businesses/${id}`)}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        {image_url ? (
          <img 
            src={image_url} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-primary/20 transition-colors group-hover:text-primary/30">
            {name.charAt(0)}
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {is_verified && (
            <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <div className="bg-background/80 backdrop-blur-sm rounded-full">
            <FavoriteButton businessId={id} />
          </div>
        </div>
        {video_url && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="gap-1">
              <Video className="w-3 h-3" />
              Video
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-xl line-clamp-1">{name}</h3>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">{region}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating.toFixed(1)} ({review_count})
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex gap-3 pt-2 border-t">
          {phone && (
            <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" />
            </div>
          )}
          {email && (
            <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-4 h-4" />
            </div>
          )}
          {website && (
            <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;