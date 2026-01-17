import { useState } from "react";
import { useBusinessProducts } from "@/hooks/useBusinessProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Star, CheckCircle, XCircle, ShoppingCart } from "lucide-react";
import { ProductCheckoutDialog } from "./ProductCheckoutDialog";

interface ProductCatalogProps {
  businessId: string;
  businessName?: string;
}

const ProductCatalog = ({ businessId, businessName = "this business" }: ProductCatalogProps) => {
  const { data: products, isLoading } = useBusinessProducts(businessId);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const categories = [...new Set(products.map((p) => p.category))];
  const featuredProducts = products.filter((p) => p.is_featured);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(price);
  };

  const handleBuyNow = (product: typeof products[0]) => {
    setSelectedProduct(product);
    setCheckoutOpen(true);
  };

  const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <div className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-muted flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold line-clamp-1">{product.name}</h4>
          {product.is_featured && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-lg text-primary">
            {formatPrice(product.price)}
          </span>
          <Badge
            variant={product.in_stock ? "default" : "secondary"}
            className="gap-1"
          >
            {product.in_stock ? (
              <>
                <CheckCircle className="h-3 w-3" />
                In Stock
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Out of Stock
              </>
            )}
          </Badge>
        </div>
        {product.in_stock && (
          <Button 
            className="w-full gap-2" 
            size="sm"
            onClick={() => handleBuyNow(product)}
          >
            <ShoppingCart className="h-4 w-4" />
            Buy Now
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Our Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {featuredProducts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-yellow-500" />
              Featured Products
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {categories.length > 1 ? (
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter((p) => p.category === category)
                    .map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Checkout Dialog */}
        {selectedProduct && (
          <ProductCheckoutDialog
            open={checkoutOpen}
            onOpenChange={setCheckoutOpen}
            product={selectedProduct}
            businessId={businessId}
            businessName={businessName}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCatalog;
