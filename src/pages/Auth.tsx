import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Gem } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: approvalData } = await supabase
          .from("user_approval_status")
          .select("status")
          .eq("user_id", session.user.id)
          .single();
        
        if (approvalData?.status === "approved") {
          navigate("/");
        } else {
          navigate("/pending-approval");
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: approvalData } = await supabase
          .from("user_approval_status")
          .select("status")
          .eq("user_id", session.user.id)
          .single();
        
        if (approvalData?.status === "approved") {
          navigate("/");
        } else {
          navigate("/pending-approval");
        }
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
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        
        // Create approval status entry with email
        if (data.user) {
          const { error: approvalError } = await supabase
            .from("user_approval_status")
            .insert({
              user_id: data.user.id,
              status: "pending",
              email: email,
            });
          
          if (approvalError) {
            console.error("Error creating approval status:", approvalError);
          }
        }
        
        toast.success("Account created! Your request is pending admin approval.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Gem className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-serif">Jewelry Catalog</CardTitle>
          <CardDescription>
            {isForgotPassword 
              ? "Enter your email to reset your password" 
              : isSignUp 
              ? "Create an account to manage your inventory" 
              : "Sign in to your account"}
          </CardDescription>
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
                    minLength={6}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
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
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;