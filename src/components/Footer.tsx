import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { BackToTop } from "@/components/BackToTop";
import { Gem, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <>
      <BackToTop />
      <footer className="border-t bg-card/50 backdrop-blur-sm safe-bottom">
      <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        <ScrollReveal>
          <div className="grid gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="mb-3 sm:mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-jewellery-from to-jewellery-to">
                  <Gem className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold">Cataleon</span>
              </div>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
                The complete platform for jewelry vendors to manage inventory, share catalogs, and grow their business.
              </p>
              <div className="flex gap-2 sm:gap-3">
                <a href="#" className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground touch-active">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground touch-active">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground touch-active">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground touch-active">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-4 font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate("/pricing")} className="transition-colors hover:text-foreground">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/demo")} className="transition-colors hover:text-foreground">
                    Demo
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/calculators")} className="transition-colors hover:text-foreground">
                    Tools & Calculators
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/about")} className="transition-colors hover:text-foreground">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/blog")} className="transition-colors hover:text-foreground">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/faq")} className="transition-colors hover:text-foreground">
                    FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/sitemap")} className="transition-colors hover:text-foreground">
                    Sitemap
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/press")} className="transition-colors hover:text-foreground">
                    Press
                  </button>
                </li>
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h3 className="mb-4 font-semibold">Tools</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate("/diamond-calculator")} className="transition-colors hover:text-foreground">
                    Diamond Calculator
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/manufacturing-cost")} className="transition-colors hover:text-foreground">
                    Estimate Generator
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/diamond-sizing")} className="transition-colors hover:text-foreground">
                    Diamond Sizing Chart
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/invoice-generator")} className="transition-colors hover:text-foreground">
                    Invoice Generator
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/install")} className="transition-colors hover:text-foreground">
                    📱 Install App
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-4 font-semibold">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  <a href="mailto:support@cataleon.com" className="transition-colors hover:text-foreground">
                    support@cataleon.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  <a href="tel:+919599195566" className="transition-colors hover:text-foreground">
                    095991 95566
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>2nd floor, Unit no 201, Green Wood Plaza, Block B, Greenwood City, Sector 45, Gurugram, Haryana 122003</span>
                </li>
                <li>
                  <button onClick={() => navigate("/contact")} className="transition-colors hover:text-foreground">
                    Contact Form →
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-12 border-t pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">© 2024 Hamlet E Commerce Pvt. Ltd. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <button onClick={() => navigate("/privacy-policy")} className="transition-colors hover:text-foreground">
                  Privacy Policy
                </button>
                <button onClick={() => navigate("/terms-of-service")} className="transition-colors hover:text-foreground">
                  Terms of Service
                </button>
                <button onClick={() => navigate("/cookie-policy")} className="transition-colors hover:text-foreground">
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
    </>
  );
};
