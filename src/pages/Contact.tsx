import { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import {
  Mail, 
  Phone, 
  MapPin, 
  Send,
  MessageSquare,
  Clock,
  CheckCircle2
} from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string().trim().max(20, { message: "Phone must be less than 20 characters" }).optional(),
  subject: z.string().trim().min(1, { message: "Subject is required" }).max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string().trim().min(10, { message: "Message must be at least 10 characters" }).max(2000, { message: "Message must be less than 2000 characters" }),
  inquiryType: z.enum(["general", "support", "demo", "partnership"])
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const result = contactSchema.safeParse(formData);
      
      if (!result.success) {
        const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
        result.error.issues.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: result.data
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
        duration: 5000,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });

    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or email us directly.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "support@jewelrycatalog.com",
      link: "mailto:support@jewelrycatalog.com"
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+1 (234) 567-890",
      link: "tel:+1234567890"
    },
    {
      icon: MapPin,
      title: "Office",
      details: "Mumbai, Maharashtra, India",
      link: "#"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon-Fri: 9AM - 6PM IST",
      link: "#"
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "support", label: "Technical Support" },
    { value: "demo", label: "Request Demo" },
    { value: "partnership", label: "Partnership" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <BackToHomeButton />
      </div>
      
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-jewellery-from/10 via-gemstone-from/10 to-diamond-from/10 py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-5xl font-bold">Get in Touch</h1>
              <p className="text-xl text-muted-foreground">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((info, index) => (
            <ScrollReveal key={index} delay={0.1 * index}>
              <Card className="border-2 text-center transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{info.title}</h3>
                  <a 
                    href={info.link} 
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {info.details}
                  </a>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Your full name"
                        maxLength={100}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="your@email.com"
                        maxLength={255}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+1 (234) 567-890"
                        maxLength={20}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">Inquiry Type *</Label>
                      <select
                        id="inquiryType"
                        value={formData.inquiryType}
                        onChange={(e) => handleChange("inquiryType", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {inquiryTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      placeholder="How can we help you?"
                      maxLength={200}
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      maxLength={2000}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      {errors.message && <p className="text-destructive">{errors.message}</p>}
                      <p className="ml-auto">{formData.message.length}/2000</p>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>We'll respond within 24 hours</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="mb-4 text-2xl font-bold">Looking for Quick Answers?</h3>
              <p className="mb-6 text-muted-foreground">
                Check out our FAQ section or explore our blog for helpful resources
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button variant="outline" onClick={() => navigate('/')}>
                  View FAQ
                </Button>
                <Button variant="outline" onClick={() => navigate('/blog')}>
                  Browse Blog
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Contact;
