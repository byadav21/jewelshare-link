import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, User } from "lucide-react";

interface VendorProfile {
  business_name?: string;
  logo_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  email?: string;
}

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
}

interface BasicInfoSectionProps {
  vendorProfile: VendorProfile | null;
  vendorGSTIN: string;
  onVendorGSTINChange: (value: string) => void;
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (details: CustomerDetails) => void;
}

export const BasicInfoSection = ({
  vendorProfile,
  vendorGSTIN,
  onVendorGSTINChange,
  customerDetails,
  onCustomerDetailsChange,
}: BasicInfoSectionProps) => {
  const handleCustomerChange = (field: keyof CustomerDetails, value: string) => {
    onCustomerDetailsChange({
      ...customerDetails,
      [field]: value,
    });
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Vertical Separator - only visible on md+ screens */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent transform -translate-x-1/2" />
      
      {/* Vendor Details (Auto-fetched) */}
      <Card className="border-primary/20 shadow-sm relative z-10">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Vendor Details
          </CardTitle>
          <CardDescription>Your business information</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-primary/5">
          {vendorProfile ? (
            <div className="space-y-4">
              {vendorProfile.logo_url && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={vendorProfile.logo_url} 
                    alt="Vendor Logo" 
                    className="h-20 w-auto object-contain" 
                  />
                </div>
              )}
              <div className="space-y-3 text-sm">
                <div className="border-b border-border pb-2">
                  <p className="font-semibold text-foreground">
                    {vendorProfile.business_name || 'Business Name'}
                  </p>
                </div>
                {(vendorProfile.address_line1 || vendorProfile.city || vendorProfile.state) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Address</p>
                    <p className="text-foreground leading-relaxed">
                      {[
                        vendorProfile.address_line1,
                        vendorProfile.address_line2,
                        vendorProfile.city,
                        vendorProfile.state,
                        vendorProfile.pincode,
                        vendorProfile.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
                {vendorProfile.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <p className="text-foreground">{vendorProfile.phone}</p>
                  </div>
                )}
                {vendorProfile.email && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground">{vendorProfile.email}</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="vendor-gstin" className="text-xs text-muted-foreground mb-1">
                    GSTIN (Optional)
                  </Label>
                  <Input
                    id="vendor-gstin"
                    value={vendorGSTIN}
                    onChange={(e) => onVendorGSTINChange(e.target.value)}
                    placeholder="Enter GSTIN"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">Loading vendor details...</p>
          )}
        </CardContent>
      </Card>

      {/* Customer Details (Input fields) */}
      <Card className="border-accent/20 shadow-sm relative z-10">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            Customer Details
          </CardTitle>
          <CardDescription>Enter customer information</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-accent/5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name" className="text-sm font-medium">
                Customer Name *
              </Label>
              <Input
                id="customer-name"
                value={customerDetails.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
                placeholder="Enter customer name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="customer-phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="customer-phone"
                value={customerDetails.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="customer-email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="customer-email"
                type="email"
                value={customerDetails.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
                placeholder="Enter email address"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="customer-address" className="text-sm font-medium">
                Address
              </Label>
              <Textarea
                id="customer-address"
                value={customerDetails.address}
                onChange={(e) => handleCustomerChange('address', e.target.value)}
                placeholder="Enter customer address"
                className="mt-1.5 min-h-[90px]"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="customer-gstin" className="text-sm font-medium">
                GSTIN (Optional)
              </Label>
              <Input
                id="customer-gstin"
                value={customerDetails.gstin}
                onChange={(e) => handleCustomerChange('gstin', e.target.value)}
                placeholder="Enter customer GSTIN"
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};