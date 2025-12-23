import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  vendorName: string;
  vendorEmail: string;
  pdfData?: string; // Base64 encoded PDF
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      to,
      customerName,
      invoiceNumber,
      amount,
      vendorName,
      vendorEmail,
      pdfData,
    }: EmailRequest = await req.json();

    console.log("Sending invoice email:", { to, invoiceNumber, vendorName });

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured. Please contact support." 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const attachments = pdfData
      ? [
          {
            filename: `${invoiceNumber}.pdf`,
            content: pdfData,
          },
        ]
      : [];

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${vendorName} <onboarding@resend.dev>`,
        to: [to],
        reply_to: vendorEmail,
        subject: `Invoice ${invoiceNumber} from ${vendorName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: bold; color: #666; }
              .amount { font-size: 24px; font-weight: bold; color: #667eea; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Invoice Received</h1>
              </div>
              <div class="content">
                <p>Dear ${customerName},</p>
                <p>Thank you for your business! Please find your invoice details below:</p>
                
                <div class="invoice-details">
                  <div class="detail-row">
                    <span class="detail-label">Invoice Number:</span>
                    <span>${invoiceNumber}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="amount">₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">From:</span>
                    <span>${vendorName}</span>
                  </div>
                </div>
                
                ${pdfData ? '<p>Your invoice is attached to this email as a PDF document.</p>' : '<p>Please contact us if you need a copy of this invoice.</p>'}
                
                <p>If you have any questions or concerns, please don't hesitate to reply to this email.</p>
                
                <div class="footer">
                  <p>Best regards,<br>${vendorName}</p>
                  <p style="font-size: 12px; color: #999;">This is an automated email.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        attachments,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Failed to send invoice email:", error);
      throw new Error("Failed to send invoice email");
    }

    const result = await emailResponse.json();
    console.log("Invoice email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    // Log detailed error server-side only for debugging
    console.error("Error sending invoice email:", error);
    // Return generic error message to client - never expose internal error details
    return new Response(
      JSON.stringify({ error: "Unable to send invoice email. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
