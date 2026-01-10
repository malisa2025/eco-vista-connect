import { useMenuItems } from "@/hooks/useMenuItems";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Leaf, Wheat, Star } from "lucide-react";

interface MenuSectionProps {
  businessId: string;
}

const MenuSection = ({ businessId }: MenuSectionProps) => {
  const { data: menuItems, isLoading } = useMenuItems(businessId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  // Group items by category
  const categories = [...new Set(menuItems.map((item) => item.category))];
  const featuredItems = menuItems.filter((item) => item.is_featured);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(price);
  };

  const getDietaryIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "vegetarian":
      case "vegan":
        return <Leaf className="h-3 w-3" />;
      case "gluten-free":
        return <Wheat className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Our Menu
        </CardTitle>
      </CardHeader>
      <CardContent>
        {featuredItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-yellow-500" />
              Featured Items
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{item.name}</h4>
                      <span className="font-bold text-primary">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.dietary_tags && item.dietary_tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {item.dietary_tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs gap-1">
                            {getDietaryIcon(tag)}
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-4">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="space-y-4">
                {menuItems
                  .filter((item) => item.category === category && item.is_available)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{item.name}</h4>
                          <span className="font-semibold text-primary">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                        {item.dietary_tags && item.dietary_tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {item.dietary_tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs gap-1">
                                {getDietaryIcon(tag)}
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MenuSection;
