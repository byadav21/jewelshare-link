import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Volume2, VolumeX } from "lucide-react";
import { playNotificationSound } from "@/utils/notificationSound";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NotificationCounts {
  pendingComments: number;
  pendingApprovals: number;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<NotificationCounts>({
    pendingComments: 0,
    pendingApprovals: 0,
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('admin-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const previousCountsRef = useRef<NotificationCounts>({
    pendingComments: 0,
    pendingApprovals: 0,
  });
  const isInitialLoad = useRef(true);

  useEffect(() => {
    localStorage.setItem('admin-sound-enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    fetchCounts();

    // Subscribe to real-time updates for comments
    const commentsChannel = supabase
      .channel('admin-notifications-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_comments',
          filter: 'status=eq.pending'
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    // Subscribe to real-time updates for approvals
    const approvalsChannel = supabase
      .channel('admin-notifications-approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_approval_status',
          filter: 'status=eq.pending'
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(approvalsChannel);
    };
  }, []);

  const fetchCounts = async () => {
    try {
      const [
        { data: comments },
        { data: approvals }
      ] = await Promise.all([
        supabase.from("blog_comments").select("id", { count: 'exact' }).eq("status", "pending"),
        supabase.from("user_approval_status").select("id", { count: 'exact' }).eq("status", "pending"),
      ]);

      const newCounts = {
        pendingComments: comments?.length || 0,
        pendingApprovals: approvals?.length || 0,
      };

      // Check if counts increased and play sound
      if (!isInitialLoad.current && soundEnabled) {
        const commentsIncreased = newCounts.pendingComments > previousCountsRef.current.pendingComments;
        const approvalsIncreased = newCounts.pendingApprovals > previousCountsRef.current.pendingApprovals;

        if (commentsIncreased) {
          playNotificationSound();
          toast.info(`New comment${newCounts.pendingComments - previousCountsRef.current.pendingComments > 1 ? 's' : ''} pending moderation`);
        }
        if (approvalsIncreased) {
          playNotificationSound();
          toast.info(`New vendor approval${newCounts.pendingApprovals - previousCountsRef.current.pendingApprovals > 1 ? 's' : ''} pending`);
        }
      }

      previousCountsRef.current = newCounts;
      setCounts(newCounts);
      isInitialLoad.current = false;
    } catch (error) {
      console.error("Failed to fetch notification counts", error);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast.success(soundEnabled ? 'Sound notifications disabled' : 'Sound notifications enabled');
  };

  const totalCount = counts.pendingComments + counts.pendingApprovals;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSound}
        title={soundEnabled ? 'Disable sound notifications' : 'Enable sound notifications'}
      >
        {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {totalCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {totalCount > 9 ? '9+' : totalCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Pending Actions</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="h-auto p-1"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {totalCount === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No pending actions
            </div>
          ) : (
            <>
              {counts.pendingComments > 0 && (
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => navigate('/admin/comments')}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Comments need moderation</span>
                    <Badge variant="secondary">{counts.pendingComments}</Badge>
                  </div>
                </DropdownMenuItem>
              )}
              
              {counts.pendingApprovals > 0 && (
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => navigate('/vendor-approvals')}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Vendor approvals pending</span>
                    <Badge variant="secondary">{counts.pendingApprovals}</Badge>
                  </div>
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
