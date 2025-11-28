import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReminderRequest {
  invoiceId: string;
  customerEmail: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysOverdue?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const {
      invoiceId,
      customerEmail,
      customerName,
      invoiceNumber,
      amount,
      dueDate,
      daysOverdue = 0,
    }: PaymentReminderRequest = await req.json();

    console.log("Sending payment reminder:", { invoiceId, customerEmail, invoiceNumber });

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const subject = daysOverdue > 0
      ? `Payment Overdue: Invoice ${invoiceNumber}`
      : `Payment Reminder: Invoice ${invoiceNumber}`;

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: ${daysOverdue > 0 ? '#ef4444' : '#f97316'}; margin-bottom: 20px;">
            ${daysOverdue > 0 ? 'Payment Overdue Notice' : 'Payment Reminder'}
          </h1>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
            Dear ${customerName},
          </p>
          
          ${daysOverdue > 0 
            ? `<p style="font-size: 16px; color: #ef4444; font-weight: 600; margin-bottom: 15px;">
                Your payment is overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}.
              </p>`
            : `<p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
                This is a friendly reminder about your upcoming payment.
              </p>`
          }
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0; color: #374151;">
              <strong>Invoice Number:</strong> ${invoiceNumber}
            </p>
            <p style="margin: 10px 0; color: #374151;">
              <strong>Amount Due:</strong> ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p style="margin: 10px 0; color: #374151;">
              <strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
            Please arrange for payment at your earliest convenience. If you have already made this payment, please disregard this notice.
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
            If you have any questions or concerns, please don't hesitate to contact us.
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-top: 30px;">
            Best regards,<br>
            Your Billing Team
          </p>
        </div>
      `;

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Billing <onboarding@resend.dev>",
        to: [customerEmail],
        subject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const emailResult = await emailResponse.json();

    // Update last_reminder_sent_at timestamp
    await supabase
      .from("manufacturing_cost_estimates")
      .update({ last_reminder_sent_at: new Date().toISOString() })
      .eq("id", invoiceId);

    console.log("Payment reminder sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailResult }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending payment reminder:", error);
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
