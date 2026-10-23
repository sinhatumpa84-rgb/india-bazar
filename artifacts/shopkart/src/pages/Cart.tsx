import { AppLayout } from "@/components/layout/AppLayout";
import { Link, useLocation } from "wouter";
import { 
  useGetCart, 
  useUpdateCartItem, 
  useRemoveFromCart,
  useGetDashboardSummary,
  getGetCartQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Plus, Minus, ShieldCheck, ShoppingBag } from "lucide-react";

export default function Cart() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart();
  
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  const handleUpdateQuantity = (id: number, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    
    updateCartItem.mutate(
      { id, data: { quantity: newQuantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
      }
    );
  };

  const handleRemoveItem = (id: number) => {
    removeFromCart.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="w-full lg:w-1/3">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white rounded-lg border shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-48 h-48 mb-6 flex items-center justify-center bg-gray-50 rounded-full">
              <img src="https://placehold.co/200x200/transparent/blue?text=Empty+Cart" alt="Empty Cart" className="w-32 h-32 opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty!</h2>
            <p className="text-muted-foreground mb-8">Add items to it now.</p>
            <Button size="lg" onClick={() => setLocation('/')} className="px-12">
              Shop Now
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.itemCount} items)</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          {/* Left Column - Cart Items */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              {/* Delivery Address Banner */}
              <div className="bg-blue-50/50 p-4 border-b flex justify-between items-center text-sm">
                <div>Deliver to: <span className="font-semibold">Select your location</span></div>
                <Button variant="outline" size="sm" className="h-8">Change</Button>
              </div>

              {/* Items List */}
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4 md:gap-6 relative">
                    {/* Item Image */}
                    <Link href={`/product/${item.productId}`} className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded border flex items-center justify-center p-2">
                      <img 
                        src={item.product.images[0] || "https://placehold.co/200x200"} 
                        alt={item.product.name}
                        className="object-contain w-full h-full mix-blend-multiply"
                      />
                    </Link>
                    
                    {/* Item Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <Link href={`/product/${item.productId}`} className="font-medium hover:text-primary line-clamp-2 pr-8 text-sm md:text-base">
                          {item.product.name}
                        </Link>
                        {item.product.price >= 499 && (
                          <span className="text-[10px] font-bold text-white bg-green-600 px-1.5 py-0.5 rounded whitespace-nowrap hidden sm:block">FREE Delivery</span>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-3">{item.product.brand}</div>
                      
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-lg md:text-xl font-bold">{formatINR(item.product.price)}</span>
                        {item.product.discount > 0 && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">{formatINR(item.product.mrp)}</span>
                            <span className="text-sm font-bold text-green-600">{item.product.discount}% Off</span>
                          </>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex flex-wrap items-center gap-4 mt-auto">
                        <div className="flex items-center border rounded-md overflow-hidden bg-white w-fit">
                          <button 
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1 || updateCartItem.isPending}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className="w-10 h-8 flex items-center justify-center font-medium text-sm border-x">
                            {item.quantity}
                          </div>
                          <button 
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            disabled={updateCartItem.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeFromCart.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 border-t flex justify-end">
                <Button size="lg" className="bg-[#fb641b] hover:bg-[#fb641b]/90 text-white font-bold px-8 w-full md:w-auto text-base h-12" onClick={() => setLocation('/checkout')}>
                  PLACE ORDER
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Price Details */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg border shadow-sm sticky top-24">
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-500 uppercase text-sm tracking-wider">Price Details</h3>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Price ({cart.itemCount} items)</span>
                  <span>{formatINR(cart.subtotal + cart.discount)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Discount</span>
                  <span className="text-green-600 font-medium">-{formatINR(cart.discount)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Delivery Charges</span>
                  <span className={cart.deliveryCharge === 0 ? "text-green-600 font-medium" : ""}>
                    {cart.deliveryCharge === 0 ? "Free" : formatINR(cart.deliveryCharge)}
                  </span>
                </div>
                
                <div className="border-t border-dashed pt-4 flex justify-between items-center font-bold text-lg">
                  <span>Total Amount</span>
                  <span>{formatINR(cart.total)}</span>
                </div>
                
                {cart.discount > 0 && (
                  <div className="text-green-600 font-semibold text-sm pt-2">
                    You will save {formatINR(cart.discount)} on this order
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium bg-gray-50 p-3 rounded border">
              <ShieldCheck className="h-5 w-5 text-gray-400" /> Safe and Secure Payments. Easy returns. 100% Authentic products.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}