import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gem, Calculator, CheckCircle2, Sparkles } from "lucide-react";
import { PasswordStrength, validatePasswordStrength } from "@/components/PasswordStrength";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { z } from "zod";


// Validation schemas
const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters" });
const phoneSchema = z.string().trim().min(10, { message: "Phone number must be at least 10 digits" }).max(15);

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Jewellery"]);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEssentialsPlan = searchParams.get("plan") === "essentials";

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: approvalData } = await supabase
          .from("user_approval_status")
          .select("status")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (approvalData?.status === "approved") {
          // Check if user is admin
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (roleData?.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            // Check if user has Essentials plan
            const { data: permissions } = await supabase
              .from("vendor_permissions")
              .select("subscription_plan")
              .eq("user_id", session.user.id)
              .maybeSingle();
            
            if (permissions?.subscription_plan === "essentials") {
              navigate("/calculators", { replace: true });
            } else {
              navigate("/catalog", { replace: true });
            }
          }
        } else {
          navigate("/pending-approval", { replace: true });
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect on SIGNED_IN event to avoid race conditions
      if (event === 'SIGNED_IN' && session) {
        setTimeout(async () => {
          const { data: approvalData } = await supabase
            .from("user_approval_status")
            .select("status")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (approvalData?.status === "approved") {
            // Check if user is admin
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .maybeSingle();
            
            if (roleData?.role === "admin") {
              navigate("/admin", { replace: true });
            } else {
              // Check if user has Essentials plan
              const { data: permissions } = await supabase
                .from("vendor_permissions")
                .select("subscription_plan")
                .eq("user_id", session.user.id)
                .maybeSingle();
              
              if (permissions?.subscription_plan === "essentials") {
                navigate("/calculators", { replace: true });
              } else {
                navigate("/catalog", { replace: true });
              }
            }
          } else {
            navigate("/pending-approval", { replace: true });
          }
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset link sent to your email!");
      setIsForgotPassword(false);
      setEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email
      const emailValidation = emailSchema.safeParse(email);
      if (!emailValidation.success) {
        toast.error(emailValidation.error.issues[0].message);
        setLoading(false);
        return;
      }

      // Validate password
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        toast.error(passwordValidation.error.issues[0].message);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // Additional validation for signup - check password strength
        if (!validatePasswordStrength(password)) {
          toast.error("Password must include uppercase, lowercase, number, and special character");
          setLoading(false);
          return;
        }

        // Validate phone number for Essentials plan
        if (isEssentialsPlan) {
          const phoneValidation = phoneSchema.safeParse(phoneNumber);
          if (!phoneValidation.success) {
            toast.error(phoneValidation.error.issues[0].message);
            setLoading(false);
            return;
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email: emailValidation.data,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        
        // Create approval status entry with email
        if (data.user) {
          const approvalStatus = isEssentialsPlan ? "approved" : "pending";
          
          const { error: approvalError } = await supabase
            .from("user_approval_status")
            .insert({
              user_id: data.user.id,
              status: approvalStatus,
              email: email,
              phone: isEssentialsPlan ? phoneNumber : null,
              business_name: isEssentialsPlan ? businessName : null,
            });
          
          if (approvalError) {
            console.error("Error creating approval status:", approvalError);
          }

          // Create vendor profile with selected categories
          const { error: profileError } = await supabase
            .from("vendor_profiles")
            .insert({
              user_id: data.user.id,
              seller_categories: isEssentialsPlan ? ["Jewellery"] : selectedCategories,
              business_name: isEssentialsPlan ? businessName : null,
              phone: isEssentialsPlan ? phoneNumber : null,
            });

          if (profileError) {
            console.error("Error creating vendor profile:", profileError);
          }

          // Set plan to essentials if applicable
          if (isEssentialsPlan) {
            const { error: permissionsError } = await supabase
              .from("vendor_permissions")
              .insert({
                user_id: data.user.id,
                subscription_plan: "essentials",
              });

            if (permissionsError) {
              console.error("Error setting essentials plan:", permissionsError);
            }
          }
        }
        
        if (isEssentialsPlan) {
          toast.success("Welcome! Your 30-day free calculator trial has started. You now have unlimited access to our professional calculators!");
          // Redirect to calculators page for Essentials users
          setTimeout(() => {
            navigate("/calculators");
          }, 2000);
        } else {
          toast.success("Account created! Your request is pending admin approval.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailValidation.data,
          password,
        });
        if (error) throw error;

        // Update session persistence based on remember me
        if (!rememberMe && data.session) {
          // If remember me is off, update to use sessionStorage instead of localStorage
          await supabase.auth.setSession(data.session);
        }
        
        // Register device session
        if (data.session) {
          try {
            const deviceInfo = navigator.userAgent;
            await supabase.functions.invoke("manage-session", {
              body: {
                action: "register",
                sessionId: data.session.access_token,
                deviceInfo,
                ipAddress: "client",
              },
            });
          } catch (sessionError) {
            console.error("Session registration error:", sessionError);
          }
        }
        
        // Check approval status
        if (data.user) {
          const { data: approvalData } = await supabase
            .from("user_approval_status")
            .select("status")
            .eq("user_id", data.user.id)
            .maybeSingle();
          
          if (approvalData?.status === "approved") {
            toast.success("Welcome back!");
          } else if (approvalData?.status === "pending") {
            toast.info("Your account is pending approval.");
          } else if (approvalData?.status === "rejected") {
            toast.error("Your account was not approved.");
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <BackToHomeButton variant="ghost" />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isEssentialsPlan ? (
              <div className="relative">
                <Calculator className="h-12 w-12 text-gemstone-from" />
                <Sparkles className="h-5 w-5 text-gemstone-to absolute -top-1 -right-1 animate-pulse" />
              </div>
            ) : (
              <Gem className="h-12 w-12 text-primary" />
            )}
          </div>
          {isEssentialsPlan && isSignUp && (
            <Badge className="mb-3 bg-gradient-to-r from-gemstone-from to-gemstone-to">
              Free 30-Day Trial
            </Badge>
          )}
          <CardTitle className="text-3xl font-serif">
            {isEssentialsPlan && isSignUp ? "Start Your Free Calculator Trial" : "Jewelry Catalog"}
          </CardTitle>
          <CardDescription>
            {isForgotPassword 
              ? "Enter your email to reset your password" 
              : isSignUp 
              ? isEssentialsPlan
                ? "Get unlimited access to professional jewelry calculators"
                : "Create an account to manage your inventory"
              : "Sign in to your account"}
          </CardDescription>
          {isEssentialsPlan && isSignUp && (
            <div className="mt-4 space-y-2 text-left">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-gemstone-from shrink-0 mt-0.5" />
                <span>Unlimited Diamond Calculator access with comparison tool</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-gemstone-from shrink-0 mt-0.5" />
                <span>Full Manufacturing Cost Estimator for accurate pricing</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-gemstone-from shrink-0 mt-0.5" />
                <span>Read-only catalog browsing to explore features</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-gemstone-from shrink-0 mt-0.5" />
                <span>Upgrade anytime to full catalog & sharing features</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              {!isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              )}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <PasswordStrength password={password} />
                </div>
              )}

              {isSignUp && isEssentialsPlan && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name (Optional)</Label>
                    <Input
                      id="businessName"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your Jewelry Business"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      placeholder="+1 (555) 123-4567"
                    />
                    <p className="text-xs text-muted-foreground">Required to activate your free trial</p>
                  </div>
                </>
              )}

              {isSignUp && !isEssentialsPlan && (
                <div className="space-y-2">
                  <Label>Select Product Categories</Label>
                  <div className="space-y-2">
                    {["Jewellery", "Gemstones", "Loose Diamonds"].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={category} className="font-normal cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedCategories.length === 0 && (
                    <p className="text-sm text-red-500">Please select at least one category</p>
                  )}
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me for 30 days
                  </Label>
                </div>
              )}

              <Button 
                type="submit" 
                className={`w-full ${isEssentialsPlan && isSignUp ? 'bg-gradient-to-r from-gemstone-from to-gemstone-to' : ''}`}
                disabled={loading || (isSignUp && !isEssentialsPlan && (selectedCategories.length === 0 || !validatePasswordStrength(password))) || (isSignUp && isEssentialsPlan && (!phoneNumber || !validatePasswordStrength(password)))}
              >
                {loading ? "Loading..." : isSignUp ? isEssentialsPlan ? "Start Free Trial" : "Create Account" : "Sign In"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center space-y-2">
            {!isForgotPassword && !isSignUp && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="block w-full text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setIsSignUp(!isSignUp);
              }}
              className="text-sm text-primary hover:underline"
            >
              {isForgotPassword 
                ? "Back to sign in" 
                : isSignUp 
                ? isEssentialsPlan 
                  ? "Already have a calculator trial account? Sign in"
                  : "Already have an account? Sign in"
                : isEssentialsPlan
                ? "Want to try calculators? Start free trial"
                : "Don't have an account? Sign up"}
            </button>
            {!isEssentialsPlan && !isSignUp && !isForgotPassword && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Just want to try our calculators?</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/auth?plan=essentials")}
                  className="w-full text-gemstone-from border-gemstone-from/30 hover:bg-gemstone-from/10"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Start 30-Day Free Calculator Trial
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;