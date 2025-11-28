import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("Checking for overdue invoices...");

    // Find invoices that are pending and past their due date
    const { data: overdueInvoices, error: fetchError } = await supabase
      .from("manufacturing_cost_estimates")
      .select("*")
      .eq("is_invoice_generated", true)
      .eq("invoice_status", "pending")
      .lt("payment_due_date", today.toISOString())
      .is("payment_date", null);

    if (fetchError) {
      console.error("Error fetching overdue invoices:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${overdueInvoices?.length || 0} overdue invoices`);

    // Update status to overdue
    if (overdueInvoices && overdueInvoices.length > 0) {
      const invoiceIds = overdueInvoices.map((inv) => inv.id);
      
      const { error: updateError } = await supabase
        .from("manufacturing_cost_estimates")
        .update({ invoice_status: "overdue" })
        .in("id", invoiceIds);

      if (updateError) {
        console.error("Error updating invoice status:", updateError);
        throw updateError;
      }

      // Send payment reminders for overdue invoices
      const reminderPromises = overdueInvoices
        .filter((inv) => inv.is_customer_visible && inv.customer_email)
        .map(async (invoice) => {
          const dueDate = new Date(invoice.payment_due_date);
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          // Only send reminder if more than 1 day since last reminder
          const lastReminder = invoice.last_reminder_sent_at 
            ? new Date(invoice.last_reminder_sent_at) 
            : null;
          const daysSinceLastReminder = lastReminder 
            ? Math.floor((today.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24))
            : 999;

          if (daysSinceLastReminder < 1) {
            console.log(`Skipping reminder for invoice ${invoice.invoice_number} - reminder sent recently`);
            return null;
          }

          try {
            const { data, error } = await supabase.functions.invoke("send-payment-reminder", {
              body: {
                invoiceId: invoice.id,
                customerEmail: invoice.customer_email,
                customerName: invoice.customer_name,
                invoiceNumber: invoice.invoice_number,
                amount: invoice.final_selling_price || invoice.total_cost || 0,
                dueDate: invoice.payment_due_date,
                daysOverdue,
              },
            });

            if (error) {
              console.error(`Failed to send reminder for invoice ${invoice.invoice_number}:`, error);
            } else {
              console.log(`Sent reminder for invoice ${invoice.invoice_number}`);
            }

            return data;
          } catch (error) {
            console.error(`Error sending reminder for invoice ${invoice.invoice_number}:`, error);
            return null;
          }
        });

      await Promise.all(reminderPromises);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        overdueCount: overdueInvoices?.length || 0,
        message: "Overdue invoices processed successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error checking overdue invoices:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
