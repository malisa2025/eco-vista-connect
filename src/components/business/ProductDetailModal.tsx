import { useState } from "react";
import { BusinessProduct } from "@/hooks/useBusinessProducts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Play, 
  Star, 
  CheckCircle, 
  XCircle,
  ZoomIn
} from "lucide-react";

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: BusinessProduct;
  businessId: string;
  businessName: string;
  onAddToCart?: (productId: string, quantity: number) => void;
  onBuyNow: (product: BusinessProduct) => void;
  onOpenLightbox?: (images: string[], startIndex: number) => void;
  onPlayVideo?: () => void;
}

const ProductDetailModal = ({
  open,
  onOpenChange,
  product,
  businessId,
  businessName,
  onAddToCart,
  onBuyNow,
  onOpenLightbox,
  onPlayVideo,
}: ProductDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(price);
  };

  // Get all images for the product
  const getAllImages = (): string[] => {
    const images: string[] = [];
    if (product.image_url) images.push(product.image_url);
    if (product.additional_images) images.push(...product.additional_images);
    return images;
  };

  const allImages = getAllImages();
  const currentImage = allImages[selectedImageIndex] || null;
  const hasVideo = !!product.video_url;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    onAddToCart?.(product.id, quantity);
    onOpenChange(false);
  };

  const handleBuyNow = () => {
    onBuyNow(product);
    onOpenChange(false);
  };

  const handleImageClick = () => {
    if (allImages.length > 0 && onOpenLightbox) {
      onOpenLightbox(allImages, selectedImageIndex);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleImageClick}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-muted-foreground/50">
                  {product.name.charAt(0)}
                </div>
              )}

              {/* Zoom indicator */}
              {currentImage && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleImageClick}
                >
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              )}

              {/* Video Play Button */}
              {hasVideo && (
                <button
                  onClick={onPlayVideo}
                  className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </button>
              )}

              {/* Featured Badge */}
              {product.is_featured && (
                <Badge className="absolute top-3 left-3 gap-1 bg-yellow-500 text-yellow-950">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sold by {businessName}
              </p>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            {/* Stock Status */}
            <Badge
              variant={product.in_stock ? "default" : "destructive"}
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

            {/* Category */}
            {product.category && (
              <div>
                <span className="text-sm text-muted-foreground">Category: </span>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.in_stock && (
              <div className="flex items-center gap-3">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none"
                    onClick={() => handleQuantityChange(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Total */}
            {product.in_stock && quantity > 1 && (
              <div className="text-lg">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-bold text-primary">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            {product.in_stock && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {onAddToCart && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
                <Button className="flex-1 gap-2" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </div>
            )}

            {!product.in_stock && (
              <p className="text-muted-foreground text-sm">
                This product is currently out of stock. Please check back later.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
