import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedUser } from "@/lib/authCache";

export interface VendorPermissions {
  can_view_catalog: boolean;
  can_add_products: boolean;
  can_import_data: boolean;
  can_share_catalog: boolean;
  can_manage_team: boolean;
  can_view_interests: boolean;
  can_delete_products: boolean;
  can_edit_products: boolean;
  can_edit_profile: boolean;
  can_add_vendor_details: boolean;
  can_view_custom_orders: boolean;
  can_manage_custom_orders: boolean;
  can_view_share_links: boolean;
  can_manage_share_links: boolean;
  can_view_sessions: boolean;
  can_manage_sessions: boolean;
}

export const useVendorPermissions = () => {
  const [permissions, setPermissions] = useState<VendorPermissions>({
    can_view_catalog: true,
    can_add_products: true,
    can_import_data: true,
    can_share_catalog: true,
    can_manage_team: false,
    can_view_interests: true,
    can_delete_products: true,
    can_edit_products: true,
    can_edit_profile: true,
    can_add_vendor_details: true,
    can_view_custom_orders: true,
    can_manage_custom_orders: false,
    can_view_share_links: true,
    can_manage_share_links: true,
    can_view_sessions: true,
    can_manage_sessions: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: any;
    let isMounted = true;

    const fetchPermissions = async () => {
      const user = await getCachedUser();
      
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("vendor_permissions")
        .select("can_view_catalog, can_add_products, can_import_data, can_share_catalog, can_manage_team, can_view_interests, can_delete_products, can_edit_products, can_edit_profile, can_add_vendor_details, can_view_custom_orders, can_manage_custom_orders, can_view_share_links, can_manage_share_links, can_view_sessions, can_manage_sessions")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error("Error fetching permissions:", error);
      } else if (data) {
        setPermissions({
          can_view_catalog: data.can_view_catalog,
          can_add_products: data.can_add_products,
          can_import_data: data.can_import_data,
          can_share_catalog: data.can_share_catalog,
          can_manage_team: data.can_manage_team,
          can_view_interests: data.can_view_interests,
          can_delete_products: data.can_delete_products,
          can_edit_products: data.can_edit_products,
          can_edit_profile: data.can_edit_profile,
          can_add_vendor_details: data.can_add_vendor_details,
          can_view_custom_orders: data.can_view_custom_orders,
          can_manage_custom_orders: data.can_manage_custom_orders,
          can_view_share_links: data.can_view_share_links,
          can_manage_share_links: data.can_manage_share_links,
          can_view_sessions: data.can_view_sessions ?? true,
          can_manage_sessions: data.can_manage_sessions ?? true,
        });
      }
      
      setLoading(false);

      // Defer realtime subscription to not block initial load
      setTimeout(() => {
        if (!isMounted) return;
        channel = supabase
          .channel(`vendor_permissions_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'vendor_permissions',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (!isMounted) return;
              const newData = payload.new as any;
              setPermissions({
                can_view_catalog: newData.can_view_catalog,
                can_add_products: newData.can_add_products,
                can_import_data: newData.can_import_data,
                can_share_catalog: newData.can_share_catalog,
                can_manage_team: newData.can_manage_team,
                can_view_interests: newData.can_view_interests,
                can_delete_products: newData.can_delete_products,
                can_edit_products: newData.can_edit_products,
                can_edit_profile: newData.can_edit_profile,
                can_add_vendor_details: newData.can_add_vendor_details,
                can_view_custom_orders: newData.can_view_custom_orders,
                can_manage_custom_orders: newData.can_manage_custom_orders,
                can_view_share_links: newData.can_view_share_links,
                can_manage_share_links: newData.can_manage_share_links,
                can_view_sessions: newData.can_view_sessions ?? true,
                can_manage_sessions: newData.can_manage_sessions ?? true,
              });
            }
          )
          .subscribe();
      }, 1000);
    };

    fetchPermissions();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return { permissions, loading };
};
