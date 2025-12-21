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
import { Gem, Calculator, Wrench, Menu, Grid3X3, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useVendorProfile } from "@/hooks/useVendorProfile";

export const Header = () => {
  const navigate = useNavigate();
  const { vendorName } = useVendorProfile();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-jewellery-from to-diamond-from">
              <Gem className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:inline-block">Cataleon</span>
          </Link>
          {vendorName && (
            <span className="text-sm text-muted-foreground hidden md:inline-block">
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
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                to="/pricing"
                className="text-lg font-medium transition-colors hover:text-primary"
              >
                Pricing
              </Link>
              
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Tools</p>
                <button
                  onClick={() => navigate("/diamond-calculator")}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-diamond-from to-diamond-to">
                    <Calculator className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Diamond Calculator</div>
                    <div className="text-xs text-muted-foreground">Price diamonds accurately</div>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/manufacturing-cost")}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-jewellery-from to-jewellery-to">
                    <Wrench className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Cost Estimator</div>
                    <div className="text-xs text-muted-foreground">Calculate manufacturing costs</div>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/diamond-sizing-chart")}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                    <Ruler className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Diamond Sizing Chart</div>
                    <div className="text-xs text-muted-foreground">Diamond dimensions & measurements</div>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/diamond-sieve-chart")}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                    <Grid3X3 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Diamond Sieve Chart</div>
                    <div className="text-xs text-muted-foreground">Sieve sizes & carat reference</div>
                  </div>
                </button>
              </div>

              <Link
                to="/about"
                className="text-lg font-medium transition-colors hover:text-primary"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-lg font-medium transition-colors hover:text-primary"
              >
                Contact
              </Link>

              <div className="pt-4 border-t space-y-2">
                <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button className="w-full" onClick={() => navigate("/catalog")}>
                  Access Catalog
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
