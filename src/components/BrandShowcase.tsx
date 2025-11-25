import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle2, Building2 } from "lucide-react";

interface BrandShowcaseProps {
  vendorProfile: {
    business_name?: string;
    logo_url?: string;
    business_story?: string;
    certifications?: string[];
    awards?: string[];
  } | null;
}

export const BrandShowcase = ({ vendorProfile }: BrandShowcaseProps) => {
  if (!vendorProfile) return null;

  const { business_story, certifications, awards } = vendorProfile;
  
  // Don't render if no content to show
  if (!business_story && (!certifications || certifications.length === 0) && (!awards || awards.length === 0)) {
    return null;
  }

  return (
    <Card className="mt-8 bg-gradient-to-br from-card via-card to-muted/20 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Building2 className="h-6 w-6 text-primary" />
          About {vendorProfile.business_name || "Our Brand"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {business_story && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Our Story</h3>
            <p className="text-muted-foreground leading-relaxed">{business_story}</p>
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {awards && awards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
              <Award className="h-5 w-5 text-primary" />
              Awards & Recognition
            </h3>
            <div className="flex flex-wrap gap-2">
              {awards.map((award, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-accent/10 text-accent-foreground hover:bg-accent/20"
                >
                  {award}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
