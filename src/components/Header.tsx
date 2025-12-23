import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link, useNavigate } from "react-router-dom";
import { Gem, Calculator, Wrench, Menu, Grid3X3, Ruler, GraduationCap, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const { vendorName } = useVendorProfile();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container flex h-14 sm:h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80 touch-active">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-jewellery-from to-diamond-from">
              <Gem className="h-5 w-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold">Cataleon</span>
          </Link>
          {vendorName && (
            <span className="text-sm text-muted-foreground hidden lg:inline-block">
              Hello, <span className="font-semibold text-foreground">{vendorName}</span>
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/pricing" className={navigationMenuTriggerStyle()}>
                  Pricing
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => navigate("/diamond-calculator")}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-diamond-from to-diamond-to">
                              <Calculator className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium leading-none mb-1">
                                Diamond Calculator
                              </div>
                              <p className="text-sm leading-snug text-muted-foreground">
                                Professional diamond pricing with 4Cs
                              </p>
                            </div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => navigate("/manufacturing-cost")}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-jewellery-from to-jewellery-to">
                              <Wrench className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium leading-none mb-1">
                                Manufacturing Cost Estimator
                              </div>
                              <p className="text-sm leading-snug text-muted-foreground">
                                Calculate complete jewelry costs
                              </p>
                            </div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => navigate("/diamond-sizing-chart")}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                              <Ruler className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium leading-none mb-1">
                                Diamond Sizing Chart
                              </div>
                              <p className="text-sm leading-snug text-muted-foreground">
                                Diamond dimensions & measurements
                              </p>
                            </div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => navigate("/diamond-sieve-chart")}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                              <Grid3X3 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium leading-none mb-1">
                                Diamond Sieve Chart
                              </div>
                              <p className="text-sm leading-snug text-muted-foreground">
                                Sieve sizes, MM & carat reference
                              </p>
                            </div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => navigate("/diamond-education")}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                              <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium leading-none mb-1">
                                Diamond Education
                              </div>
                              <p className="text-sm leading-snug text-muted-foreground">
                                Interactive Color & Clarity Charts
                              </p>
                            </div>
                          </div>
                        </button>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/about" className={navigationMenuTriggerStyle()}>
                  About
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/contact" className={navigationMenuTriggerStyle()}>
                  Contact
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/faq" className={navigationMenuTriggerStyle()}>
                  FAQ
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="ml-4 flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/catalog")}>
              Access Catalog
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="touch-target">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[350px] p-0 safe-top">
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-jewellery-from to-diamond-from">
                    <Gem className="h-5 w-5 text-white" />
                  </div>
                  <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
                </div>
              </div>
            </SheetHeader>
            
            <nav className="flex flex-col overflow-y-auto scroll-smooth-mobile" style={{ height: 'calc(100vh - 140px)' }}>
              {/* Main Navigation */}
              <div className="p-4 space-y-1">
                <button
                  onClick={() => handleNavigate("/pricing")}
                  className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-active"
                >
                  <span className="text-base font-medium">Pricing</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                
                <button
                  onClick={() => handleNavigate("/about")}
                  className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-active"
                >
                  <span className="text-base font-medium">About</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                
                <button
                  onClick={() => handleNavigate("/contact")}
                  className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-active"
                >
                  <span className="text-base font-medium">Contact</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                
                <button
                  onClick={() => handleNavigate("/faq")}
                  className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-active"
                >
                  <span className="text-base font-medium">FAQ</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Tools Section */}
              <div className="px-4 pb-4">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</p>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigate("/diamond-calculator")}
                    className="flex items-center gap-3 w-full text-left p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-active"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-diamond-from to-diamond-to shadow-md">
                      <Calculator className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">Diamond Calculator</div>
                      <div className="text-xs text-muted-foreground truncate">Price diamonds accurately</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                  
                  <button
                    onClick={() => handleNavigate("/manufacturing-cost")}
                    className="flex items-center gap-3 w-full text-left p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-active"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-jewellery-from to-jewellery-to shadow-md">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">Cost Estimator</div>
                      <div className="text-xs text-muted-foreground truncate">Calculate manufacturing costs</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                  
                  <button
                    onClick={() => handleNavigate("/diamond-sizing-chart")}
                    className="flex items-center gap-3 w-full text-left p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-active"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
                      <Ruler className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">Diamond Sizing Chart</div>
                      <div className="text-xs text-muted-foreground truncate">Dimensions & measurements</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                  
                  <button
                    onClick={() => handleNavigate("/diamond-sieve-chart")}
                    className="flex items-center gap-3 w-full text-left p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-active"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md">
                      <Grid3X3 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">Diamond Sieve Chart</div>
                      <div className="text-xs text-muted-foreground truncate">Sieve sizes & carat reference</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                  
                  <button
                    onClick={() => handleNavigate("/diamond-education")}
                    className="flex items-center gap-3 w-full text-left p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-active"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">Diamond Education</div>
                      <div className="text-xs text-muted-foreground truncate">Interactive learning modules</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </button>
                </div>
              </div>
            </nav>

            {/* Fixed Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background safe-bottom">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 text-base touch-active" 
                  onClick={() => handleNavigate("/auth")}
                >
                  Sign In
                </Button>
                <Button 
                  className="flex-1 h-12 text-base touch-active" 
                  onClick={() => handleNavigate("/catalog")}
                >
                  Catalog
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
