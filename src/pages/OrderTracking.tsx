import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { EstimateImage } from '@/components/EstimateImage';

interface OrderDetails {
  id: string;
  estimate_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  status: string;
  created_at: string;
  estimated_completion_date: string | null;
  total_cost: number;
  final_selling_price: number;
  reference_images: string[];
  notes: string;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: AlertCircle },
  quoted: { label: 'Quoted', color: 'bg-blue-500 text-white', icon: Package },
  approved: { label: 'Approved', color: 'bg-green-500 text-white', icon: CheckCircle },
  in_production: { label: 'In Production', color: 'bg-amber-500 text-white', icon: Clock },
  completed: { label: 'Completed', color: 'bg-emerald-500 text-white', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive text-destructive-foreground', icon: AlertCircle },
};

export default function OrderTracking() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError('Invalid tracking link');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('manufacturing_cost_estimates')
          .select('*')
          .eq('share_token', token)
          .eq('is_customer_visible', true)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Order not found or access denied');
          setLoading(false);
          return;
        }

        setOrder(data as OrderDetails);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Unable to load order details');
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Set up realtime subscription
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'manufacturing_cost_estimates',
          filter: `share_token=eq.${token}`,
        },
        (payload) => {
          setOrder(payload.new as OrderDetails);
          toast.success('Order status updated!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Order Not Found</h2>
            <p className="text-muted-foreground text-center">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Package;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Order Tracking</CardTitle>
                <CardDescription className="mt-2">
                  Track your custom jewelry manufacturing order
                </CardDescription>
              </div>
              <Badge className={statusConfig[order.status as keyof typeof statusConfig]?.color}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusConfig[order.status as keyof typeof statusConfig]?.label}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Name</p>
                <p className="font-medium">{order.estimate_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{format(new Date(order.created_at), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{order.customer_phone || order.customer_email}</p>
              </div>
              {order.estimated_completion_date && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Estimated Completion</p>
                  <p className="font-medium text-primary">
                    {format(new Date(order.estimated_completion_date), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reference Images */}
        {order.reference_images && order.reference_images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reference Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {order.reference_images.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <EstimateImage
                      src={imageUrl}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Manufacturing Cost</span>
              <span className="font-medium">₹{order.total_cost?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Final Price</span>
              <span className="font-bold text-lg text-primary">
                ₹{order.final_selling_price?.toLocaleString() || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statusConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = order.status === key;
                const isPast = ['draft', 'quoted', 'approved', 'in_production', 'completed'].indexOf(order.status) >
                  ['draft', 'quoted', 'approved', 'in_production', 'completed'].indexOf(key);
                
                return (
                  <div key={key} className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                    <div className={`rounded-full p-2 ${isPast || isActive ? config.color : 'bg-muted'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>{config.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
