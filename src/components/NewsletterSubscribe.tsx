import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
});

export const NewsletterSubscribe = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validation = emailSchema.safeParse({ email });
      
      if (!validation.success) {
        toast({
          title: "Invalid Email",
          description: validation.error.issues[0].message,
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: validation.data.email });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        setEmail("");
        toast({
          title: "Successfully Subscribed!",
          description: "You'll receive updates about new blog posts and platform news.",
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="border-2 border-category-jewellery/20 bg-gradient-to-br from-category-jewellery/5 to-category-gemstone/5">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-category-jewellery/20">
            <CheckCircle2 className="h-6 w-6 text-category-jewellery" />
          </div>
          <div>
            <p className="font-semibold">You're all set!</p>
            <p className="text-sm text-muted-foreground">
              Check your inbox for a confirmation email.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-category-jewellery/20">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-category-jewellery/10">
            <Mail className="h-5 w-5 text-category-jewellery" />
          </div>
          <div>
            <h3 className="font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get the latest articles delivered to your inbox
            </p>
          </div>
        </div>
        <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            required
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-category-jewellery to-category-gemstone"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};