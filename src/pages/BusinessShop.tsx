import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessProducts, BusinessProduct } from "@/hooks/useBusinessProducts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Search, LayoutGrid, List, ShoppingCart, Plus, Play, Images, Eye, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ImageLightbox from "@/components/ui/image-lightbox";
import ProductVideoModal from "@/components/business/ProductVideoModal";
import ProductDetailModal from "@/components/business/ProductDetailModal";
import { ProductCheckoutDialog } from "@/components/business/ProductCheckoutDialog";

const BusinessShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoProduct, setSelectedVideoProduct] = useState<BusinessProduct | null>(null);

  // Product detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<BusinessProduct | null>(null);

  // Checkout dialog state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<BusinessProduct | null>(null);

  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products = [], isLoading: productsLoading } = useBusinessProducts(id!);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return cats.filter(Boolean);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const addToCart = (productId: string) => {
    const existing = cart.find((c) => c.productId === productId);
    if (existing) {
      setCart(cart.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
    toast.success("Added to cart!");
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
    toast.success("Removed from cart");
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  }, [cart, products]);

  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    const firstItem = cart[0];
    const product = products.find((p) => p.id === firstItem.productId);
    if (product) {
      setCheckoutProduct(product);
      setCheckoutOpen(true);
      setCartOpen(false);
    }
  };

  // Get all images for a product
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
    setSelectedVideoProduct(product);
    setVideoModalOpen(true);
  };

  const openDetailModal = (product: BusinessProduct) => {
    setSelectedDetailProduct(product);
    setDetailModalOpen(true);
  };

  const handleBuyNow = (product: BusinessProduct) => {
    setCheckoutProduct(product);
    setCheckoutOpen(true);
  };

  if (businessLoading || productsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-8" />
            <Skeleton className="h-48 w-full mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Business not found</h2>
            <Button onClick={() => navigate("/businesses")}>Back to Businesses</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(`/businesses/${id}`)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Business
          </Button>
          <Button variant="outline" className="relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{business.name} Shop</h1>
          <p className="text-lg opacity-90">Browse our products and services</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Controls */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </p>

        {/* No Products */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No products found</p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const allImages = getProductImages(product);
              const hasMultipleImages = allImages.length > 1;
              const hasVideo = !!product.video_url;

              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative group">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openLightbox(product)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/50">
                        {product.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    {product.is_featured && (
                      <Badge className="absolute top-3 left-3 bg-green-500">Featured</Badge>
                    )}

                    {/* Media Indicators */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {hasMultipleImages && (
                        <Badge 
                          variant="secondary" 
                          className="gap-1 cursor-pointer"
                          onClick={() => openLightbox(product)}
                        >
                          <Images className="h-3 w-3" />
                          +{allImages.length - 1}
                        </Badge>
                      )}
                      {hasVideo && (
                        <Badge 
                          variant="secondary" 
                          className="gap-1 cursor-pointer"
                          onClick={() => openVideoModal(product)}
                        >
                          <Play className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>

                    {/* Video Play Button Overlay */}
                    {hasVideo && (
                      <button
                        onClick={() => openVideoModal(product)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-8 w-8 text-primary fill-primary ml-1" />
                        </div>
                      </button>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-primary">
                        GH₵ {product.price.toFixed(2)}
                      </span>
                      <Badge variant={product.in_stock ? "secondary" : "destructive"}>
                        {product.in_stock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openDetailModal(product)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => addToCart(product.id)}
                        disabled={!product.in_stock}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && filteredProducts.length > 0 && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-primary-foreground">Product</TableHead>
                  <TableHead className="text-primary-foreground">Category</TableHead>
                  <TableHead className="text-primary-foreground">Price</TableHead>
                  <TableHead className="text-primary-foreground">Status</TableHead>
                  <TableHead className="text-primary-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const allImages = getProductImages(product);
                  const hasVideo = !!product.video_url;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative cursor-pointer group"
                            onClick={() => openLightbox(product)}
                          >
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground/50">
                                {product.name.charAt(0)}
                              </div>
                            )}
                            {hasVideo && (
                              <div 
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openVideoModal(product);
                                }}
                              >
                                <Play className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            )}
                            <div className="flex gap-1 mt-1">
                              {allImages.length > 1 && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Images className="h-2 w-2" />
                                  {allImages.length}
                                </Badge>
                              )}
                              {hasVideo && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Play className="h-2 w-2" />
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        GH₵ {product.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.in_stock ? "secondary" : "destructive"}>
                          {product.in_stock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetailModal(product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product.id)}
                            disabled={!product.in_stock}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>

      <Footer />

      {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart ({cartItemCount})
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <Button variant="outline" className="mt-4" onClick={() => setCartOpen(false)}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex gap-3 border-b pb-4">
                      {/* Product image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground/50">
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-primary font-bold">GH₵ {product.price.toFixed(2)}</p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Remove button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart footer with total and checkout */}
          {cart.length > 0 && (
            <div className="border-t pt-4 mt-auto space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">GH₵ {cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCartCheckout}>
                Proceed to Checkout
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Note: Currently supports single-item checkout. Multi-item checkout coming soon.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      {/* Video Modal */}
      {selectedVideoProduct && (
        <ProductVideoModal
          open={videoModalOpen}
          onOpenChange={setVideoModalOpen}
          videoUrl={selectedVideoProduct.video_url!}
          thumbnailUrl={selectedVideoProduct.video_thumbnail_url || undefined}
          productName={selectedVideoProduct.name}
        />
      )}

      {/* Product Detail Modal */}
      {selectedDetailProduct && (
        <ProductDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          product={selectedDetailProduct}
          businessId={id!}
          businessName={business?.name || ""}
          onAddToCart={(productId, qty) => {
            for (let i = 0; i < qty; i++) addToCart(productId);
          }}
          onBuyNow={handleBuyNow}
          onOpenLightbox={(images, index) => {
            setLightboxImages(images);
            setLightboxIndex(index);
            setLightboxOpen(true);
          }}
          onPlayVideo={() => {
            openVideoModal(selectedDetailProduct);
          }}
        />
      )}

      {/* Checkout Dialog */}
      {checkoutProduct && (
        <ProductCheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          product={checkoutProduct}
          businessId={id!}
          businessName={business?.name || ""}
        />
      )}
    </div>
  );
};

export default BusinessShop;