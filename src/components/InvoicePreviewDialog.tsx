import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { InvoiceData } from "@/utils/invoiceGenerator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceData: InvoiceData | null;
  onConfirmDownload: () => void;
}

export const InvoicePreviewDialog = ({
  open,
  onOpenChange,
  invoiceData,
  onConfirmDownload,
}: InvoicePreviewDialogProps) => {
  if (!invoiceData) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            Review your invoice before downloading the PDF
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-180px)] px-6">
          <div className="bg-background border rounded-lg p-8 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                {invoiceData.vendorBranding?.logo && (
                  <img 
                    src={invoiceData.vendorBranding.logo} 
                    alt="Logo" 
                    className="h-16 mb-2"
                  />
                )}
                <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
                <p className="text-lg font-semibold mt-1">
                  {invoiceData.invoiceNumber}
                </p>
              </div>
              {invoiceData.vendorBranding && (
                <div className="text-right text-sm">
                  <p className="font-semibold">{invoiceData.vendorBranding.name}</p>
                  {invoiceData.vendorBranding.address && (
                    <p className="text-muted-foreground">{invoiceData.vendorBranding.address}</p>
                  )}
                  {invoiceData.vendorBranding.phone && (
                    <p className="text-muted-foreground">Phone: {invoiceData.vendorBranding.phone}</p>
                  )}
                  {invoiceData.vendorBranding.email && (
                    <p className="text-muted-foreground">Email: {invoiceData.vendorBranding.email}</p>
                  )}
                  {invoiceData.vendorGSTIN && (
                    <p className="text-muted-foreground">GSTIN: {invoiceData.vendorGSTIN}</p>
                  )}
                </div>
              )}
            </div>

            {/* Invoice & Customer Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Invoice Details</h3>
                <div className="text-sm space-y-1">
                  <p>Date: {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
                  {invoiceData.paymentDueDate && (
                    <p>Due Date: {new Date(invoiceData.paymentDueDate).toLocaleDateString()}</p>
                  )}
                  {invoiceData.paymentTerms && (
                    <p>Terms: {invoiceData.paymentTerms}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bill To</h3>
                <div className="text-sm space-y-1">
                  <p className="font-semibold">{invoiceData.customerName}</p>
                  {invoiceData.customerPhone && <p>Phone: {invoiceData.customerPhone}</p>}
                  {invoiceData.customerEmail && <p>Email: {invoiceData.customerEmail}</p>}
                  {invoiceData.customerAddress && <p>{invoiceData.customerAddress}</p>}
                  {invoiceData.customerGSTIN && <p>GSTIN: {invoiceData.customerGSTIN}</p>}
                </div>
              </div>
            </div>

            {/* Line Items */}
            {invoiceData.lineItems && invoiceData.lineItems.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="space-y-4">
                  {invoiceData.lineItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex gap-4">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.item_name} 
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.item_name}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            {item.net_weight && <p>Net Weight: {item.net_weight}g</p>}
                            {item.diamond_weight > 0 && <p>Diamond: {item.diamond_weight}ct</p>}
                            <p className="col-span-2 font-semibold">Total: {formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                {invoiceData.diamondCost > 0 && (
                  <div className="flex justify-between">
                    <span>Diamond Cost:</span>
                    <span>{formatCurrency(invoiceData.diamondCost)}</span>
                  </div>
                )}
                {invoiceData.gemstoneCost > 0 && (
                  <div className="flex justify-between">
                    <span>Gemstone Cost:</span>
                    <span>{formatCurrency(invoiceData.gemstoneCost)}</span>
                  </div>
                )}
                {invoiceData.goldCost > 0 && (
                  <div className="flex justify-between">
                    <span>Gold Cost:</span>
                    <span>{formatCurrency(invoiceData.goldCost)}</span>
                  </div>
                )}
                {invoiceData.makingCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Making Charges:</span>
                    <span>{formatCurrency(invoiceData.makingCharges)}</span>
                  </div>
                )}
                {invoiceData.cadDesignCharges > 0 && (
                  <div className="flex justify-between">
                    <span>CAD Design Charges:</span>
                    <span>{formatCurrency(invoiceData.cadDesignCharges)}</span>
                  </div>
                )}
                {invoiceData.cammingCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Camming Charges:</span>
                    <span>{formatCurrency(invoiceData.cammingCharges)}</span>
                  </div>
                )}
                {invoiceData.certificationCost > 0 && (
                  <div className="flex justify-between">
                    <span>Certification Cost:</span>
                    <span>{formatCurrency(invoiceData.certificationCost)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(invoiceData.finalSellingPrice || invoiceData.totalCost)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(invoiceData.notes || invoiceData.invoiceNotes) && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">
                  {invoiceData.invoiceNotes || invoiceData.notes}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={onConfirmDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
