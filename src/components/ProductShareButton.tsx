import { motion } from "framer-motion";
import { Share2, Facebook, Twitter, MessageCircle, Mail, Link2, Check, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProductShareButtonProps {
  productName: string;
  productSku?: string;
  price: number;
  imageUrl?: string;
  catalogUrl: string;
  businessName?: string;
}

export const ProductShareButton = ({ 
  productName, 
  productSku, 
  price, 
  imageUrl,
  catalogUrl,
  businessName 
}: ProductShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareText = `Check out this beautiful jewelry piece${businessName ? ` from ${businessName}` : ''}!\n\n${productName}${productSku ? `\nSKU: ${productSku}` : ''}\nPrice: ₹${price.toLocaleString('en-IN')}`;
  const shareUrl = catalogUrl;
  
  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      textColor: "text-green-700 dark:text-green-400",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30",
      borderColor: "border-green-200 dark:border-green-800",
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
          "_blank"
        );
      },
    },
    {
      name: "SMS",
      icon: MessageSquare,
      color: "bg-amber-500 hover:bg-amber-600",
      textColor: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-800",
      action: () => {
        window.open(
          `sms:?body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
          "_blank"
        );
      },
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      textColor: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          "_blank"
        );
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      textColor: "text-sky-700 dark:text-sky-400",
      bgColor: "bg-sky-50 dark:bg-sky-950/30",
      borderColor: "border-sky-200 dark:border-sky-800",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      },
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-purple-500 hover:bg-purple-600",
      textColor: "text-purple-700 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(`${productName} - Jewelry`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
      },
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      toast.success("Product details copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <Share2 className="h-6 w-6 text-primary" />
            </motion.div>
            Share This Product
          </DialogTitle>
          <DialogDescription className="text-sm">
            Share this beautiful piece with friends and family
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Product Preview */}
          <div className="bg-gradient-to-br from-muted/50 to-background rounded-xl p-4 border border-border">
            <div className="flex gap-4 items-start">
              {imageUrl && (
                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={imageUrl} 
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate mb-1">
                  {productName}
                </h4>
                {productSku && (
                  <p className="text-xs text-muted-foreground mb-1">
                    SKU: {productSku}
                  </p>
                )}
                <p className="text-lg font-bold text-primary">
                  ₹{price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={option.action}
                    variant="outline"
                    className={`w-full h-auto flex-col gap-2 py-4 ${option.bgColor} ${option.borderColor || 'border-2'} hover:scale-105 transition-transform`}
                  >
                    <div className={`p-2 rounded-full ${option.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-sm font-medium ${option.textColor}`}>
                      {option.name}
                    </span>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Copy Link Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-4 border-t border-border space-y-3"
          >
            <p className="text-sm font-medium text-foreground mb-3">Or copy product details</p>
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className={`w-full gap-2 transition-all ${
                  copied ? "bg-green-50 dark:bg-green-950/30 border-green-500" : ""
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Copy Details & Link
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Engagement Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3"
          >
            <p className="text-xs text-muted-foreground text-center">
              💎 <span className="font-medium">Tip:</span> Share on WhatsApp to send directly to someone special!
            </p>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
