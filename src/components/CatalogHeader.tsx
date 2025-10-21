import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";

interface CatalogHeaderProps {
  vendorProfile: any;
  usdRate: number;
  goldRate: number;
  editingGoldRate: boolean;
  tempGoldRate: string;
  updatingGoldRate: boolean;
  totalINR: number;
  totalUSD: number;
  productsCount: number;
  filteredProductsCount: number;
  onEditGoldRate: () => void;
  onCancelEditGoldRate: () => void;
  onUpdateGoldRate: () => void;
  onTempGoldRateChange: (value: string) => void;
}

export const CatalogHeader = ({
  vendorProfile,
  usdRate,
  goldRate,
  editingGoldRate,
  tempGoldRate,
  updatingGoldRate,
  totalINR,
  totalUSD,
  productsCount,
  filteredProductsCount,
  onEditGoldRate,
  onCancelEditGoldRate,
  onUpdateGoldRate,
  onTempGoldRateChange,
}: CatalogHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-6">
      {/* Left: Vendor Profile */}
      {vendorProfile && (
        <div className="flex items-center gap-6 flex-1">
          <div className="flex-1">
            <h2 className="text-xl font-serif font-bold text-foreground leading-tight mb-1.5">
              {vendorProfile.business_name || "My Jewelry Business"}
            </h2>
            <div className="text-sm text-muted-foreground mb-1.5">
              {vendorProfile.address_line1 && (
                <span>
                  {vendorProfile.address_line1}
                  {vendorProfile.address_line2 && `, ${vendorProfile.address_line2}`}
                </span>
              )}
              {vendorProfile.city && (
                <span className="ml-1">• {vendorProfile.city}, {vendorProfile.state} {vendorProfile.pincode}</span>
              )}
            </div>
            <div className="flex gap-4 text-sm">
              {vendorProfile.email && (
                <span className="text-primary font-medium">Email: {vendorProfile.email}</span>
              )}
              {vendorProfile.phone && (
                <span className="text-primary font-medium">Phone: {vendorProfile.phone}</span>
              )}
              {vendorProfile.whatsapp_number && (
                <span className="text-primary font-medium">WhatsApp: {vendorProfile.whatsapp_number}</span>
              )}
            </div>
          </div>
          
          {/* QR Codes */}
          {(vendorProfile.instagram_qr_url || vendorProfile.whatsapp_qr_url) && (
            <div className="flex gap-3">
              {vendorProfile.instagram_qr_url && (
                <div className="text-center">
                  <img 
                    src={vendorProfile.instagram_qr_url} 
                    alt="Instagram" 
                    className="w-20 h-20 object-cover rounded border border-border"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Instagram</p>
                </div>
              )}
              {vendorProfile.whatsapp_qr_url && (
                <div className="text-center">
                  <img 
                    src={vendorProfile.whatsapp_qr_url} 
                    alt="WhatsApp" 
                    className="w-20 h-20 object-cover rounded border border-border"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">WhatsApp</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right: Exchange Rate & Gold Rate & Total Inventory */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border whitespace-nowrap">
            1 USD = ₹{usdRate.toFixed(2)} INR • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          
          {editingGoldRate ? (
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md border border-border">
              <input
                type="number"
                value={tempGoldRate}
                onChange={(e) => onTempGoldRateChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !updatingGoldRate) {
                    onUpdateGoldRate();
                  } else if (e.key === 'Escape' && !updatingGoldRate) {
                    onCancelEditGoldRate();
                  }
                }}
                placeholder={goldRate.toString()}
                min="1000"
                max="200000"
                step="100"
                disabled={updatingGoldRate}
                className="w-28 px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
              />
              <Button 
                size="sm" 
                onClick={onUpdateGoldRate}
                disabled={updatingGoldRate}
                className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {updatingGoldRate ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onCancelEditGoldRate} 
                disabled={updatingGoldRate}
                className="h-7 px-3 text-xs disabled:opacity-50"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div 
              className="text-xs text-muted-foreground bg-amber-500/10 px-3 py-1.5 rounded-md border border-amber-500/30 whitespace-nowrap cursor-pointer hover:bg-amber-500/20 transition-colors flex items-center gap-2"
              onClick={onEditGoldRate}
            >
              <span className="font-semibold text-amber-700 dark:text-amber-400">24K Gold: ₹{goldRate.toLocaleString('en-IN')}/g</span>
              <Edit className="h-3 w-3 text-amber-600" />
            </div>
          )}
        </div>
        {productsCount > 0 && (
          <div className="flex flex-col items-end gap-0.5 px-4 py-2 bg-primary/10 rounded-lg border border-primary/30">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Total Inventory</div>
            <div className="text-xl font-bold text-primary">₹{totalINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-sm text-muted-foreground font-semibold">${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD</div>
            {filteredProductsCount !== productsCount && (
              <div className="text-[10px] text-muted-foreground">
                {filteredProductsCount} of {productsCount} products
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
