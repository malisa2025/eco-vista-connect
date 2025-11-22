import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdConversions } from "@/hooks/useAdConversions";
import { formatDistanceToNow } from "date-fns";
import { Phone, Mail, Globe, MessageSquare, DollarSign } from "lucide-react";

interface ConversionTrackerProps {
  advertisementId: string;
}

export function ConversionTracker({ advertisementId }: ConversionTrackerProps) {
  const { conversions, isLoading, conversionsByType, totalRevenue, totalConversions } = useAdConversions(advertisementId);

  const getIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "form_fill":
        return <Mail className="h-4 w-4" />;
      case "website_visit":
        return <Globe className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "call":
        return "bg-blue-500";
      case "form_fill":
        return "bg-green-500";
      case "website_visit":
        return "bg-purple-500";
      case "message":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return <div>Loading conversions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Conversions</div>
            <div className="text-3xl font-bold">{totalConversions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-3xl font-bold">GH₵{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        {Object.entries(conversionsByType || {}).slice(0, 2).map(([type, count]) => (
          <Card key={type}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {getIcon(type)}
                {type.replace("_", " ")}
              </div>
              <div className="text-3xl font-bold">{Number(count)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {conversions && conversions.length > 0 ? (
            <div className="space-y-3">
              {conversions.map((conversion) => (
                <div
                  key={conversion.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full text-white ${getTypeColor(conversion.conversion_type)}`}>
                      {getIcon(conversion.conversion_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {conversion.conversion_type.replace("_", " ").toUpperCase()}
                        </span>
                        {conversion.variant_id && (
                          <Badge variant="outline" className="text-xs">
                            Variant
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(conversion.created_at!), { addSuffix: true })}
              </div>
                    </div>
                  </div>
                  {conversion.value && conversion.value > 0 && (
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        +GH₵{Number(conversion.value).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No conversions tracked yet. Set up conversion tracking to see results here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
