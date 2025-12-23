import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType?: 'products' | 'share_links';
}

export const UpgradePromptDialog = ({ open, onOpenChange, limitType }: UpgradePromptDialogProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  const getLimitMessage = () => {
    switch (limitType) {
      case 'products':
        return 'You\'ve reached your product limit';
      case 'share_links':
        return 'You\'ve reached your share link limit';
      default:
        return 'You\'ve reached your plan limit';
    }
  };

  const plans = [
    {
      name: 'Professional',
      price: '₹2,999/mo',
      features: [
        '1,000 Products',
        '10 Share Links',
        '3 Team Members',
        'Unlimited Product Images',
        'Custom Orders',
        'Import Data',
        'Priority Support'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Unlimited Products',
        'Unlimited Share Links',
        'Unlimited Team Members',
        'Unlimited Product Images',
        'All Professional Features',
        'Dedicated Account Manager',
        'Custom Integrations'
      ],
      highlight: true
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-base">
            {getLimitMessage()}. Upgrade to continue growing your business.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg border-2 p-6 ${
                plan.highlight
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  RECOMMENDED
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold mt-2">{plan.price}</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleUpgrade}
                  className="w-full"
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
