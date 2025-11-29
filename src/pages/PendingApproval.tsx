import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, XCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import { BackToHomeButton } from "@/components/BackToHomeButton";

const PendingApproval = () => {
  const navigate = useNavigate();
  const { status, loading, rejectionReason } = useApprovalStatus();

  useEffect(() => {
    if (!loading && status === "approved") {
      navigate("/catalog");
    }
  }, [status, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    );
  }

  const isPending = status === "pending";
  const isRejected = status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <BackToHomeButton variant="ghost" />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isPending ? (
            <Clock className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          ) : (
            <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          )}
          <CardTitle className="text-2xl">
            {isPending ? "Account Pending Approval" : "Account Not Approved"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isPending
              ? "Your vendor account is currently under review by our admin team."
              : "Your vendor account application was not approved."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                We typically review applications within 24-48 hours. You'll receive a notification once your account is approved.
              </p>
            </div>
          )}
          
          {isRejected && rejectionReason && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <p className="text-sm font-medium mb-1">Reason:</p>
              <p className="text-sm text-muted-foreground">{rejectionReason}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Need assistance? Contact our support team.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
