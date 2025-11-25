import { motion } from "framer-motion";
import { Share2, Facebook, Twitter, MessageCircle, Mail, Link2, Check, QrCode } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SocialShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export const SocialShareButton = ({ url, title, description, className }: SocialShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareText = `${title}${description ? ` - ${description}` : ""}`;
  
  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      textColor: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`,
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
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
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
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
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
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`;
      },
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={`gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all ${className}`}
        >
          <Share2 className="h-4 w-4" />
          <span>Share Catalog</span>
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
            Share This Catalog
          </DialogTitle>
          <DialogDescription className="text-sm">
            Spread the sparkle! Share this jewelry collection with your network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
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
                    className={`w-full h-auto flex-col gap-2 py-4 ${option.bgColor} border-2 hover:scale-105 transition-transform`}
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
            transition={{ delay: 0.4 }}
            className="pt-4 border-t border-border space-y-3"
          >
            <p className="text-sm font-medium text-foreground mb-3">Or copy link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2.5 border border-border overflow-hidden">
                <p className="text-xs text-muted-foreground break-all leading-relaxed">
                  {url}
                </p>
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className={`gap-2 min-w-[100px] flex-shrink-0 transition-all ${
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
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            {/* QR Code Button */}
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              className="w-full gap-2 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 border-primary/30"
            >
              <QrCode className="h-4 w-4" />
              {showQR ? "Hide QR Code" : "Show QR Code"}
            </Button>

            {/* QR Code Display */}
            {showQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border"
              >
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <QRCodeSVG
                    value={url}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground max-w-[250px]">
                  Scan this QR code with your phone to open the catalog instantly
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Engagement Tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3"
          >
            <p className="text-xs text-muted-foreground text-center">
              💎 <span className="font-medium">Pro tip:</span> Share on WhatsApp for instant engagement!
            </p>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
