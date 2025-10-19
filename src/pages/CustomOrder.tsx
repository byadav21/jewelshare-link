import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { customOrderSchema } from "@/lib/validations";

const CustomOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    metal_type: "",
    gemstone_preference: "",
    design_description: "",
    budget_range: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = customOrderSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("custom_orders").insert({
      customer_name: validation.data.customer_name,
      customer_email: validation.data.customer_email,
      customer_phone: validation.data.customer_phone || null,
      metal_type: validation.data.metal_type || null,
      gemstone_preference: validation.data.gemstone_preference || null,
      design_description: validation.data.design_description,
      budget_range: validation.data.budget_range || null,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Your custom order request has been submitted. We'll contact you soon!",
    });

    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      metal_type: "",
      gemstone_preference: "",
      design_description: "",
      budget_range: "",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Build Your Custom Jewelry</CardTitle>
            <CardDescription>
              Tell us about your dream piece and we'll bring it to life
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleChange("customer_name", e.target.value)}
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
                    onChange={(e) => handleChange("customer_email", e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_phone">Phone Number (Optional)</Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handleChange("customer_phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="metal_type">Preferred Metal Type</Label>
                  <Select
                    value={formData.metal_type}
                    onValueChange={(value) => handleChange("metal_type", value)}
                  >
                    <SelectTrigger id="metal_type">
                      <SelectValue placeholder="Select metal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="White Gold">White Gold</SelectItem>
                      <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gemstone_preference">Gemstone Preference</Label>
                  <Input
                    id="gemstone_preference"
                    value={formData.gemstone_preference}
                    onChange={(e) => handleChange("gemstone_preference", e.target.value)}
                    placeholder="e.g., Diamond, Sapphire, Ruby"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range</Label>
                <Select
                  value={formData.budget_range}
                  onValueChange={(value) => handleChange("budget_range", value)}
                >
                  <SelectTrigger id="budget_range">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under ₹50,000">Under ₹50,000</SelectItem>
                    <SelectItem value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</SelectItem>
                    <SelectItem value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</SelectItem>
                    <SelectItem value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</SelectItem>
                    <SelectItem value="Above ₹5,00,000">Above ₹5,00,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="design_description">
                  Design Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="design_description"
                  value={formData.design_description}
                  onChange={(e) => handleChange("design_description", e.target.value)}
                  placeholder="Describe your ideal piece in detail - style, occasion, any specific features you'd like..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Custom Order Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomOrder;
