/**
 * PWA Install Page
 * Dedicated page for installing the app with instructions
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Download, 
  Share, 
  Plus, 
  Check, 
  Zap, 
  Wifi, 
  Bell,
  Shield,
  Sparkles,
  Chrome,
  Apple
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { BackToHomeButton } from "@/components/BackToHomeButton";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone === true;
    setIsInstalled(isInStandaloneMode);

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant loading with cached resources"
    },
    {
      icon: Wifi,
      title: "Works Offline",
      description: "Access your catalog without internet"
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Get updates on interests & inquiries"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data stays on your device"
    }
  ];

  const iosSteps = [
    { icon: Share, text: "Tap the Share button in Safari" },
    { icon: Plus, text: 'Scroll down and tap "Add to Home Screen"' },
    { icon: Check, text: 'Tap "Add" to confirm' }
  ];

  const androidSteps = [
    { icon: Chrome, text: "Tap the menu (⋮) in Chrome" },
    { icon: Download, text: 'Select "Install app" or "Add to Home screen"' },
    { icon: Check, text: 'Tap "Install" to confirm' }
  ];

  return (
    <>
      <SEOHead
        title="Install Cataleon App | Jewelry Catalog Management"
        description="Install Cataleon on your device for faster access, offline support, and a native app experience. Available for iOS and Android."
        keywords="cataleon app, install pwa, jewelry catalog app, mobile app"
        canonicalUrl="https://cataleon.com/install"
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <BackToHomeButton />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 pt-24">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
          
          <div className="container relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30"
            >
              <Smartphone className="h-12 w-12 text-primary-foreground" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4 text-4xl font-bold tracking-tight md:text-5xl"
            >
              {isInstalled ? (
                <span className="flex items-center justify-center gap-3">
                  <Check className="h-10 w-10 text-green-500" />
                  App Installed!
                </span>
              ) : (
                <>
                  Install <span className="text-primary">Cataleon</span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
            >
              {isInstalled 
                ? "Cataleon is installed on your device. Open it from your home screen for the best experience."
                : "Get the full app experience with offline access, faster loading, and instant updates. No app store required."
              }
            </motion.p>

            {!isInstalled && deferredPrompt && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button size="lg" onClick={handleInstall} className="gap-2 text-lg">
                  <Download className="h-5 w-5" />
                  Install Now
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">Why Install?</h2>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Installation Instructions */}
        {!isInstalled && (
          <section className="px-4 py-16">
            <div className="container mx-auto max-w-4xl">
              <h2 className="mb-8 text-center text-2xl font-semibold">How to Install</h2>
              
              <div className="grid gap-8 md:grid-cols-2">
                {/* iOS Instructions */}
                <Card className={`border-border/50 ${isIOS ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
                        <Apple className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">iPhone & iPad</h3>
                        <p className="text-sm text-muted-foreground">Safari browser</p>
                      </div>
                      {isIOS && (
                        <span className="ml-auto rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          Your device
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {iosSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            {index + 1}
                          </div>
                          <step.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                          <span className="text-sm">{step.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Android Instructions */}
                <Card className={`border-border/50 ${isAndroid ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                        <Chrome className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Android</h3>
                        <p className="text-sm text-muted-foreground">Chrome browser</p>
                      </div>
                      {isAndroid && (
                        <span className="ml-auto rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          Your device
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {androidSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            {index + 1}
                          </div>
                          <step.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                          <span className="text-sm">{step.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 py-16">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8">
              <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h2 className="mb-2 text-xl font-semibold">
                {isInstalled ? "You're All Set!" : "Ready to Get Started?"}
              </h2>
              <p className="mb-6 text-muted-foreground">
                {isInstalled 
                  ? "Open Cataleon from your home screen to manage your jewelry catalog on the go."
                  : "Install now and take your jewelry catalog everywhere you go."
                }
              </p>
              <Button asChild variant={isInstalled ? "outline" : "default"}>
                <a href="/">
                  {isInstalled ? "Go to Dashboard" : "Browse Catalog First"}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Install;
