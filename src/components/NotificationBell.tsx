import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
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
          console.log('Comment notification received');
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
          console.log('Approval notification received');
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

      setCounts({
        pendingComments: comments?.length || 0,
        pendingApprovals: approvals?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch notification counts", error);
    }
  };

  const totalCount = counts.pendingComments + counts.pendingApprovals;

  return (
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
        <DropdownMenuLabel>Pending Actions</DropdownMenuLabel>
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
  );
}
