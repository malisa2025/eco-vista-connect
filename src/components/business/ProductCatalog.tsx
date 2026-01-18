import { useState } from "react";
import { useBusinessProducts, BusinessProduct } from "@/hooks/useBusinessProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Star, CheckCircle, XCircle, ShoppingCart, Play, Images, Eye } from "lucide-react";
import { ProductCheckoutDialog } from "./ProductCheckoutDialog";
import ImageLightbox from "@/components/ui/image-lightbox";
import ProductVideoModal from "./ProductVideoModal";
import ProductDetailModal from "./ProductDetailModal";

interface ProductCatalogProps {
  businessId: string;
  businessName?: string;
}

const ProductCatalog = ({ businessId, businessName = "this business" }: ProductCatalogProps) => {
  const { data: products, isLoading } = useBusinessProducts(businessId);
  const [selectedProduct, setSelectedProduct] = useState<BusinessProduct | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoProduct, setVideoProduct] = useState<BusinessProduct | null>(null);

  // Product detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<BusinessProduct | null>(null);

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

  const handleBuyNow = (product: BusinessProduct) => {
    setSelectedProduct(product);
    setCheckoutOpen(true);
  };

  const getProductImages = (product: BusinessProduct): string[] => {
    const images: string[] = [];
    if (product.image_url) images.push(product.image_url);
    if (product.additional_images) images.push(...product.additional_images);
    return images;
  };

  const openLightbox = (product: BusinessProduct, startIndex = 0) => {
    const images = getProductImages(product);
    if (images.length > 0) {
      setLightboxImages(images);
      setLightboxIndex(startIndex);
      setLightboxOpen(true);
    }
  };

  const openVideoModal = (product: BusinessProduct) => {
    setVideoProduct(product);
    setVideoModalOpen(true);
  };

  const openDetailModal = (product: BusinessProduct) => {
    setDetailProduct(product);
    setDetailModalOpen(true);
  };

  const ProductCard = ({ product }: { product: BusinessProduct }) => {
    const allImages = getProductImages(product);
    const hasMultipleImages = allImages.length > 1;
    const hasVideo = !!product.video_url;

    return (
      <div className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative group">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-40 object-cover cursor-pointer"
              onClick={() => openLightbox(product)}
            />
          ) : (
            <div className="w-full h-40 bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Media Indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            {hasMultipleImages && (
              <Badge 
                variant="secondary" 
                className="gap-1 text-xs cursor-pointer"
                onClick={() => openLightbox(product)}
              >
                <Images className="h-3 w-3" />
                +{allImages.length - 1}
              </Badge>
            )}
            {hasVideo && (
              <Badge 
                variant="secondary" 
                className="gap-1 text-xs cursor-pointer"
                onClick={() => openVideoModal(product)}
              >
                <Play className="h-3 w-3" />
              </Badge>
            )}
          </div>

          {/* Video Play Overlay */}
          {hasVideo && (
            <button
              onClick={() => openVideoModal(product)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary fill-primary ml-0.5" />
              </div>
            </button>
          )}
        </div>
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => openDetailModal(product)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            {product.in_stock && (
              <Button 
                className="flex-1 gap-1" 
                size="sm"
                onClick={() => handleBuyNow(product)}
              >
                <ShoppingCart className="h-4 w-4" />
                Buy
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
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

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      {/* Video Modal */}
      {videoProduct && (
        <ProductVideoModal
          open={videoModalOpen}
          onOpenChange={setVideoModalOpen}
          videoUrl={videoProduct.video_url!}
          thumbnailUrl={videoProduct.video_thumbnail_url || undefined}
          productName={videoProduct.name}
        />
      )}

      {/* Product Detail Modal */}
      {detailProduct && (
        <ProductDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          product={detailProduct}
          businessId={businessId}
          businessName={businessName}
          onBuyNow={handleBuyNow}
          onOpenLightbox={(images, index) => {
            setLightboxImages(images);
            setLightboxIndex(index);
            setLightboxOpen(true);
          }}
          onPlayVideo={() => openVideoModal(detailProduct)}
        />
      )}
    </>
  );
};

export default ProductCatalog;
