import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// VAPID public key for push subscription
const VAPID_PUBLIC_KEY = 'BMmVcxQGW79VsFPEEQjGNnsiZPsD5W7MFPgC4STmGux9RfH_qAZ8466WmYBcnz8rqD1rvRL3t_WD7EXvHIrUA3w';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);
      if (supported) {
        setPermission(Notification.permission);
      }
    };
    checkSupport();
  }, []);

  // Check existing subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Check if subscription exists in database
          const { data } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint)
            .single();
          
          setIsSubscribed(!!data);
        }
      } catch (error) {
        console.error('Error checking push subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in your browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not Logged In",
          description: "Please log in to enable push notifications.",
          variant: "destructive",
        });
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subscriptionJson = subscription.toJSON();
      
      // Save subscription to database
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh,
        auth: subscriptionJson.keys!.auth,
      }, {
        onConflict: 'user_id,endpoint',
      });

      if (error) {
        console.error('Error saving subscription:', error);
        toast({
          title: "Error",
          description: "Failed to save notification subscription.",
          variant: "destructive",
        });
        return false;
      }

      setIsSubscribed(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for product interests and inquiries.",
      });
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Error",
        description: "Failed to enable push notifications.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, toast]);

  const unsubscribe = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive push notifications anymore.",
      });
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Error",
        description: "Failed to disable push notifications.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  };
}
