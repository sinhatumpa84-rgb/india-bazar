import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useGetProduct, 
  useGetProductReviews,
  useAddToCart,
  useAddToWishlist,
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { Star, ShoppingCart, Zap, Heart, Truck, ShieldCheck, ArrowLeft, ChevronRight, Building2, FileCheck2, Scale, BadgePercent, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { MOCK_PRODUCTS } from "@/data/mockProducts";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const productId = parseInt(params?.id || "0");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeImage, setActiveImage] = useState(0);

  const mockProduct = MOCK_PRODUCTS.find(p => p.id === productId);
  const { data: apiProduct, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } as any });
  const product = apiProduct || mockProduct;
  const { data: reviews, isLoading: reviewsLoading } = useGetProductReviews(productId, { query: { enabled: !!productId } as any });
  const { data: summary } = useGetDashboardSummary();

  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  if (isLoading && !product) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/5 space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="w-16 h-16 rounded" />
                <Skeleton className="w-16 h-16 rounded" />
              </div>
            </div>
            <div className="w-full md:w-3/5 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-1/3 mt-6" />
              <div className="flex gap-4 mt-8">
                <Skeleton className="h-12 w-48 rounded-md" />
                <Skeleton className="h-12 w-48 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => setLocation('/')}>Return Home</Button>
        </div>
      </AppLayout>
    );
  }

  const handleAddToCart = () => {
    addToCart.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => {
          toast({ title: "Added to Cart", description: "Successfully added to your cart." });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
      }
    );
  };

  const handleBuyNow = () => {
    addToCart.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setLocation('/cart');
        }
      }
    );
  };

  const handleWishlist = () => {
    addToWishlist.mutate(
      { data: { productId } },
      {
        onSuccess: () => {
          toast({ title: "Saved to Wishlist", description: "Product saved for later." });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
      }
    );
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  return (
    <AppLayout>
      <div className="bg-white border-b sticky top-16 z-40 md:hidden">
        <Button variant="ghost" className="rounded-none w-full justify-start text-muted-foreground" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <div className="hidden md:flex text-sm text-muted-foreground mb-6 items-center gap-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/search?category=${product.category}`} className="hover:text-primary capitalize">{product.category}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-xs">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white p-4 md:p-8 rounded-lg shadow-sm border">
          {/* Left Column - Images */}
          <div className="w-full lg:w-2/5 flex flex-col gap-4">
            <div className="relative aspect-square border rounded-lg overflow-hidden flex items-center justify-center p-4 bg-gray-50 group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500"
                onClick={handleWishlist}
              >
                <Heart className="h-5 w-5" />
              </Button>
              <img 
                src={product.images[activeImage] || "https://placehold.co/600x600?text=No+Image"} 
                alt={product.name}
                className="object-contain w-full h-full"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 border rounded-md overflow-hidden p-1 ${activeImage === idx ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:flex gap-4 mt-4">
              <Button size="lg" className="flex-1 bg-[#ff9f00] hover:bg-[#ff9f00]/90 text-white font-bold h-14 text-lg" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" /> ADD TO CART
              </Button>
              <Button size="lg" className="flex-1 bg-[#fb641b] hover:bg-[#fb641b]/90 text-white font-bold h-14 text-lg" onClick={handleBuyNow}>
                <Zap className="mr-2 h-5 w-5" /> BUY NOW
              </Button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="w-full lg:w-3/5">
            <div className="text-muted-foreground font-medium uppercase tracking-wider mb-2">{product.brand}</div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-normal text-foreground leading-tight mb-3">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">
                {product.rating.toFixed(1)} <Star className="w-4 h-4 ml-1 fill-current" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{product.reviewCount} Ratings & Reviews</span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl lg:text-4xl font-medium text-foreground">{formatINR(product.price)}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">{formatINR(product.mrp)}</span>
                    <span className="text-lg font-bold text-green-600">{product.discount}% off</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* Offers List */}
            <div className="border-t border-b py-4 mb-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-green-600" /> Available offers
              </h3>
              <div className="text-sm flex gap-2"><span className="text-green-600 font-bold tracking-tight shrink-0">Bank Offer</span> <span>5% Unlimited Cashback + Instant ₹500 off on India Bazaar SBI / HDFC Credit Card</span></div>
              <div className="text-sm flex gap-2"><span className="text-green-600 font-bold tracking-tight shrink-0">Special Price</span> <span>Get extra 10% off (price inclusive of cashback/coupon)</span></div>
            </div>

            {/* Delivery Info */}
            <div className="flex gap-4 items-start mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Truck className="h-6 w-6 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Delivery by {deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {product.price > 499 ? (
                    <><span className="text-green-600 font-bold mr-1">FREE Delivery</span>(Order above ₹499)</>
                  ) : (
                    <span>Delivery charge ₹40 applies.</span>
                  )}
                </div>
                {product.stock > 0 ? (
                  <div className="text-xs text-green-600 font-bold mt-2">In Stock ({product.stock} left)</div>
                ) : (
                  <div className="text-xs text-red-600 font-bold mt-2">Out of Stock</div>
                )}
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> 7 Days Replacement Policy
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium bg-secondary/10 text-secondary-foreground inline-block px-2 py-1 rounded">
                  Cash on Delivery available
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">Product Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Seller Info */}
            <div className="mb-6 p-4 border rounded-lg bg-slate-50/50">
              <div className="text-sm font-medium text-muted-foreground mb-1">Sold By</div>
              <div className="font-bold text-primary flex items-center justify-between">
                <span>{product.seller}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Certified Authentic
                </span>
              </div>
            </div>

            {/* Manufacturing & Legal Metrology Compliance Details */}
            <div className="mb-8 p-5 border border-amber-200/80 rounded-xl bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 shadow-sm">
              <div className="flex items-center gap-2 border-b border-amber-200/60 pb-3 mb-4">
                <FileCheck2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  Manufacturing & Legal Metrology Compliance
                </h3>
                <span className="ml-auto text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded uppercase tracking-wider">
                  Verified Data
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Manufacturer Name
                  </div>
                  <div className="font-medium text-slate-900">
                    {product.manufacturerName || "Registered Indian Artisan & Heritage Crafts Unit"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" /> Country of Origin
                  </div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <span>🇮🇳</span> {product.countryOfOrigin || "India"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100 md:col-span-2">
                  <div className="text-muted-foreground font-semibold mb-1">
                    Factory / Registered Address
                  </div>
                  <div className="text-slate-800">
                    {product.manufacturerAddress || "Industrial Metalware & Handloom Cluster, Uttar Pradesh - 244001, India"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                    <Scale className="w-3.5 h-3.5 text-slate-500" /> Net Quantity / Pack Size
                  </div>
                  <div className="font-medium text-slate-900">
                    {product.netQuantity || "1 Standard Retail Unit"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                    <BadgePercent className="w-3.5 h-3.5 text-slate-500" /> Applicable GST Slab
                  </div>
                  <div className="font-medium text-slate-900">
                    {product.gstSlab !== undefined && product.gstSlab !== null ? `${product.gstSlab}% GST (Included in MRP)` : "12% GST (Included in MRP)"}
                  </div>
                </div>

                {product.dimensions && (
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-muted-foreground font-semibold mb-1">Package Dimensions</div>
                    <div className="font-medium text-slate-900">{product.dimensions}</div>
                  </div>
                )}

                {product.barcode && (
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-muted-foreground font-semibold mb-1">EAN / Barcode</div>
                    <div className="font-mono text-slate-700">{product.barcode}</div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground mt-3 italic">
                * In accordance with the Legal Metrology (Packaged Commodities) Rules, 2011, all retail prices include GST and statutory Indian commodity taxes.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile Sticky Bottom */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button variant="ghost" className="flex-1 rounded-none bg-white text-foreground font-bold h-14 text-lg border-r" onClick={handleAddToCart}>
            ADD TO CART
          </Button>
          <Button variant="ghost" className="flex-1 rounded-none bg-[#fb641b] text-white font-bold h-14 text-lg hover:bg-[#fb641b]/90 hover:text-white" onClick={handleBuyNow}>
            BUY NOW
          </Button>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white p-4 md:p-8 rounded-lg shadow-sm border mb-20 lg:mb-8">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Ratings & Reviews</h2>
            <Button variant="outline">Rate Product</Button>
          </div>

          {reviewsLoading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="w-12 h-6" /> <Skeleton className="w-32 h-4" />
                  </div>
                  <Skeleton className="w-full h-16 mt-3" />
                </div>
              ))}
            </div>
          ) : reviews?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div className="space-y-6">
              {reviews?.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex items-center text-white px-1.5 py-0.5 rounded text-xs font-bold ${review.rating >= 4 ? 'bg-green-600' : review.rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {review.rating} <Star className="w-3 h-3 ml-0.5 fill-current" />
                    </div>
                    <span className="font-medium text-sm">{review.title}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{review.reviewerName}</span>
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-gray-500"><ShieldCheck className="w-3 h-3" /> Certified Buyer</span>
                      )}
                    </div>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}