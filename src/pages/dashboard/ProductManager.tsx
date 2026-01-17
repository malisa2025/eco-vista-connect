import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBusinessProducts, useBusinessProductMutations, BusinessProduct } from "@/hooks/useBusinessProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2, Package, Star, CheckCircle, XCircle, Video, Images } from "lucide-react";
import ProductImageManager from "@/components/business/ProductImageManager";
import { VideoUploader } from "@/components/business/VideoUploader";

const ProductManager = () => {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const { data: products, isLoading } = useBusinessProducts(businessId!);
  const { createProduct, updateProduct, deleteProduct } = useBusinessProductMutations(businessId!);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BusinessProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Media state - combined images (main + additional)
  const [productImages, setProductImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState("");

  // Get business info
  const { data: business } = useQuery({
    queryKey: ["business", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setInStock(true);
    setIsFeatured(false);
    setProductImages([]);
    setVideoUrl("");
    setVideoThumbnailUrl("");
    setEditingProduct(null);
  };

  const openEditDialog = (product: BusinessProduct) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setCategory(product.category);
    setInStock(product.in_stock);
    setIsFeatured(product.is_featured);
    
    // Combine main image and additional images
    const allImages: string[] = [];
    if (product.image_url) allImages.push(product.image_url);
    if (product.additional_images) allImages.push(...product.additional_images);
    setProductImages(allImages);
    
    setVideoUrl(product.video_url || "");
    setVideoThumbnailUrl(product.video_thumbnail_url || "");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First image is main, rest are additional
    const mainImage = productImages[0] || null;
    const additionalImages = productImages.slice(1);
    
    const productData = {
      name,
      description: description || null,
      price: parseFloat(price),
      category: category || "General",
      image_url: mainImage,
      additional_images: additionalImages.length > 0 ? additionalImages : null,
      video_url: videoUrl || null,
      video_thumbnail_url: videoThumbnailUrl || null,
      in_stock: inStock,
      is_featured: isFeatured,
    };

    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
    } else {
      await createProduct.mutateAsync(productData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteProduct.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const handleVideoUpload = (url: string, thumbnailUrl?: string) => {
    setVideoUrl(url);
    if (thumbnailUrl) setVideoThumbnailUrl(thumbnailUrl);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(price);
  };

  // Group by category
  const categories = [...new Set(products?.map((p) => p.category) || [])];

  // Count media for display
  const getMediaCount = (product: BusinessProduct) => {
    let count = product.image_url ? 1 : 0;
    count += product.additional_images?.length || 0;
    return count;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Product Manager
            </h1>
            <p className="text-muted-foreground">{business?.name}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add Product"}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-80px)]">
                <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Product Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Product description..."
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (GHS) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="100.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Input
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="Electronics"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Images Section */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Images className="h-4 w-4" />
                      Product Images (up to 4)
                    </Label>
                    <ProductImageManager
                      images={productImages}
                      onChange={setProductImages}
                      maxImages={4}
                    />
                  </div>

                  {/* Product Video Section */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Product Video
                    </Label>
                    <div className="max-w-md">
                      <VideoUploader
                        onUploadComplete={handleVideoUpload}
                        currentVideoUrl={videoUrl}
                        prompt="Showcase your product in action"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="inStock"
                        checked={inStock}
                        onCheckedChange={setInStock}
                      />
                      <Label htmlFor="inStock">In Stock</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="featured"
                        checked={isFeatured}
                        onCheckedChange={setIsFeatured}
                      />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending}>
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {!products || products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first product to start showcasing your offerings
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Media</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products
                        .filter((p) => p.category === category)
                        .map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {product.name}
                                    {product.is_featured && (
                                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    )}
                                  </div>
                                  {product.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {product.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getMediaCount(product) > 0 && (
                                  <Badge variant="outline" className="gap-1">
                                    <Images className="h-3 w-3" />
                                    {getMediaCount(product)}
                                  </Badge>
                                )}
                                {product.video_url && (
                                  <Badge variant="outline" className="gap-1">
                                    <Video className="h-3 w-3" />
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{formatPrice(product.price)}</TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingId(product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManager;
