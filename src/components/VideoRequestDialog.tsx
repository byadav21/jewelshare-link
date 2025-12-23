import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Video } from "lucide-react";
import { videoRequestSchema } from "@/lib/validations";

interface VideoRequestDialogProps {
  productId?: string;
  productName?: string;
  shareLinkId: string;
  trigger?: React.ReactNode;
}

export const VideoRequestDialog = ({
  productId,
  productName,
  shareLinkId,
  trigger,
}: VideoRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    requested_products: productName ? `Video request for: ${productName}` : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = videoRequestSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("video_requests").insert({
      product_id: productId || null,
      share_link_id: shareLinkId,
      customer_name: validation.data.customer_name,
      customer_email: validation.data.customer_email,
      customer_phone: validation.data.customer_phone || null,
      requested_products: validation.data.requested_products,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit video request. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request Submitted!",
      description: "We'll contact you soon with the requested video.",
    });

    setOpen(false);
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      requested_products: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Request Video
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Product Video</DialogTitle>
          <DialogDescription>
            Request a video of specific products or the entire catalog
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={(e) =>
                setFormData({ ...formData, customer_email: e.target.value })
              }
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone">Phone (Optional)</Label>
            <Input
              id="customer_phone"
              type="tel"
              value={formData.customer_phone}
              onChange={(e) =>
                setFormData({ ...formData, customer_phone: e.target.value })
              }
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requested_products">
              What would you like to see? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="requested_products"
              value={formData.requested_products}
              onChange={(e) =>
                setFormData({ ...formData, requested_products: e.target.value })
              }
              placeholder="Describe which products you'd like to see..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Submitting..." : "Submit Video Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
