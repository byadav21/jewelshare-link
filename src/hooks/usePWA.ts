/**
 * PWA registration and update handling
 * Manages service worker lifecycle and updates
 */

import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

export const usePWA = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("PWA: Service worker registered");
      // Check for updates every hour
      r && setInterval(() => r.update(), 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.error("PWA: Service worker registration error", error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success("App ready to work offline", {
        description: "You can now use the app without an internet connection",
        duration: 5000,
      });
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast("Update available", {
        description: "A new version of the app is available",
        duration: 0, // Don't auto-dismiss
        action: {
          label: "Update",
          onClick: () => {
            updateServiceWorker(true);
          },
        },
        cancel: {
          label: "Later",
          onClick: () => {
            setNeedRefresh(false);
          },
        },
      });
    }
  }, [needRefresh]);

  const closePrompts = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return {
    offlineReady,
    needRefresh,
    updateServiceWorker,
    closePrompts,
  };
};
