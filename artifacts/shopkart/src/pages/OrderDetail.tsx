import { AppLayout } from "@/components/layout/AppLayout";
import { Link, useRoute } from "wouter";
import { useGetOrder, OrderStatus, useCancelOrder } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatINR } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Check, Truck, Box, FileText, ArrowLeft, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrderDetail() {
  const [match, params] = useRoute("/orders/:id");
  const orderId = parseInt(params?.id || "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } as any });
  const cancelOrder = useCancelOrder();

  const handleCancelOrder = () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    cancelOrder.mutate(
      { id: orderId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          toast({ title: "Order Cancelled", description: "Your order has been cancelled successfully." });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link href="/orders" className="text-primary hover:underline">Return to Orders</Link>
        </div>
      </AppLayout>
    );
  }

  const steps = [
    { status: OrderStatus.pending, label: "Order Placed", date: order.createdAt },
    { status: OrderStatus.confirmed, label: "Confirmed", date: order.updatedAt },
    { status: OrderStatus.shipped, label: "Shipped", date: order.updatedAt },
    { status: OrderStatus.out_for_delivery, label: "Out for Delivery", date: order.updatedAt },
    { status: OrderStatus.delivered, label: "Delivered", date: order.updatedAt },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === OrderStatus.cancelled;
  
  // Calculate if the step is completed based on current status
  const isStepCompleted = (index: number) => {
    if (isCancelled) return index === 0; // Only Order Placed is completed if cancelled
    
    // Status hierarchy mapping
    const statusOrder: OrderStatus[] = [
      OrderStatus.pending,
      OrderStatus.confirmed,
      OrderStatus.shipped,
      OrderStatus.out_for_delivery,
      OrderStatus.delivered
    ];
    
    const currentIdx = statusOrder.indexOf(order.status);
    return index <= currentIdx;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Orders
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">
            Order Details
          </h1>
          {order.status !== OrderStatus.cancelled && order.status !== OrderStatus.delivered && (
            <Button variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50" onClick={handleCancelOrder} disabled={cancelOrder.isPending}>
              <XCircle className="w-4 h-4 mr-2" /> Cancel Order
            </Button>
          )}
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-lg mb-8 border-b pb-4">Order Tracking</h3>
          
          {isCancelled ? (
            <div className="flex items-center justify-center p-6 text-red-600 bg-red-50 rounded-lg font-medium">
              <XCircle className="w-6 h-6 mr-2" /> This order was cancelled on {new Date(order.updatedAt).toLocaleDateString()}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full overflow-hidden hidden md:block">
                <div 
                  className="h-full bg-green-500 transition-all duration-500" 
                  style={{ width: `${(Math.max(0, steps.findIndex(s => isStepCompleted(steps.indexOf(s)))) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
                {steps.map((step, idx) => {
                  const completed = isStepCompleted(idx);
                  return (
                    <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 bg-white
                        ${completed ? 'border-green-500 text-green-500' : 'border-gray-300 text-gray-300'}
                      `}>
                        {completed ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                      </div>
                      <div className="md:text-center">
                        <div className={`font-semibold text-sm ${completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</div>
                        {completed && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(step.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-400" /> Delivery Address
            </h3>
            <div className="text-sm space-y-1">
              <div className="font-bold text-base mb-2">{order.address.fullName}</div>
              <p>{order.address.addressLine1}</p>
              {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
              <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
              <div className="pt-2">
                <span className="font-medium">Phone number:</span> {order.address.phone}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> Order Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Total</span>
                <span className="font-bold">{formatINR(order.total)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <Button variant="outline" className="w-full">Download Invoice</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Box className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-lg">Items in this order</h3>
          </div>
          
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 md:p-6 flex gap-4">
                <Link href={`/product/${item.productId}`} className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded border p-2 shrink-0">
                  <img src={item.product.images[0]} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </Link>
                
                <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div>
                    <Link href={`/product/${item.productId}`} className="font-medium hover:text-primary line-clamp-2 text-sm md:text-base">
                      {item.product.name}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-lg whitespace-nowrap">
                    {formatINR(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}