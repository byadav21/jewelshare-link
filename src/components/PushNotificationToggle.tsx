import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface PushNotificationToggleProps {
  variant?: 'button' | 'switch';
  showLabel?: boolean;
}

export function PushNotificationToggle({ 
  variant = 'switch',
  showLabel = true 
}: PushNotificationToggleProps) {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (variant === 'button') {
    return (
      <Button
        variant={isSubscribed ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
        {showLabel && (isSubscribed ? "Notifications On" : "Enable Notifications")}
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      {showLabel && (
        <div className="space-y-0.5">
          <Label htmlFor="push-notifications" className="text-sm font-medium">
            Push Notifications
          </Label>
          <p className="text-xs text-muted-foreground">
            {permission === 'denied' 
              ? "Blocked in browser settings"
              : isSubscribed 
                ? "Receive alerts for new inquiries" 
                : "Get notified about product interests"
            }
          </p>
        </div>
      )}
      <Switch
        id="push-notifications"
        checked={isSubscribed}
        onCheckedChange={handleToggle}
        disabled={isLoading || permission === 'denied'}
      />
    </div>
  );
}
