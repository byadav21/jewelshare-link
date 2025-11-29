import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ShareLinkQRCodeProps {
  shareToken: string;
  businessName?: string;
}

export const ShareLinkQRCode = ({ shareToken, businessName }: ShareLinkQRCodeProps) => {
  const shareUrl = `${window.location.origin}/shared/${encodeURIComponent(shareToken)}`;

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-${shareToken}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `catalog-qr-${shareToken.substring(0, 8)}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("QR code downloaded!");
        }
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const printQRCode = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = businessName || "Jewelry Catalog";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${title}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              padding: 40px;
            }
            h1 {
              margin-bottom: 20px;
              color: #333;
            }
            .qr-container {
              background: white;
              padding: 30px;
              border: 2px solid #333;
              border-radius: 10px;
              display: inline-block;
            }
            .instructions {
              margin-top: 30px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${title}</h1>
            <div class="qr-container">
              ${document.getElementById(`qr-${shareToken}`)?.outerHTML || ""}
            </div>
            <div class="instructions">
              <p>Scan this QR code to view our jewelry collection</p>
              <p style="font-size: 12px; margin-top: 10px;">${shareUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Link QR Code</DialogTitle>
          <DialogDescription>
            Print or download this QR code to share your catalog offline
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* QR Code */}
          <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-lg">
            <QRCodeSVG
              id={`qr-${shareToken}`}
              value={shareUrl}
              size={256}
              level="H"
              includeMargin
            />
          </div>

          {/* URL Display */}
          <div className="w-full">
            <p className="text-xs text-muted-foreground text-center mb-2">
              Catalog Link:
            </p>
            <div className="bg-muted rounded-lg px-3 py-2 text-xs text-center break-all">
              {shareUrl}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button
              onClick={downloadQRCode}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              onClick={printQRCode}
              className="flex-1 gap-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
