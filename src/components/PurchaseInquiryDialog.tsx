import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const purchaseInquirySchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  customer_email: z.string().email("Invalid email address"),
  customer_phone: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  message: z.string().optional(),
});

interface PurchaseInquiryDialogProps {
  productId: string;
  productName: string;
  shareLinkId: string;
}

export const PurchaseInquiryDialog = ({
  productId,
  productName,
  shareLinkId,
}: PurchaseInquiryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    quantity: 1,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = purchaseInquirySchema.parse({
        ...formData,
        customer_phone: formData.customer_phone || undefined,
        message: formData.message || undefined,
      });

      const { data, error } = await supabase.from("purchase_inquiries").insert([{
        product_id: productId,
        share_link_id: shareLinkId,
        customer_name: validatedData.customer_name,
        customer_email: validatedData.customer_email,
        customer_phone: validatedData.customer_phone,
        quantity: validatedData.quantity,
        message: validatedData.message,
      }]).select();

      if (error) throw error;

      // Send notification email to vendor
      if (data && data[0]) {
        try {
          await supabase.functions.invoke("notify-purchase-inquiry", {
            body: { inquiry_id: data[0].id },
          });
        } catch (emailError) {
          console.error("Failed to send notification email:", emailError);
          // Don't fail the inquiry submission if email fails
        }
      }

      toast.success("Purchase inquiry submitted successfully!", {
        description: "The vendor will contact you soon.",
      });

      setOpen(false);
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        quantity: 1,
        message: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error submitting purchase inquiry:", error);
        toast.error("Failed to submit inquiry. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Inquiry - {productName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.customer_email}
              onChange={(e) =>
                setFormData({ ...formData, customer_email: e.target.value })
              }
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.customer_phone}
              onChange={(e) =>
                setFormData({ ...formData, customer_phone: e.target.value })
              }
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Any special requests or questions?"
              rows={3}
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
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Inquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
