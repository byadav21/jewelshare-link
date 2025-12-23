import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

// HTML encode user inputs to prevent injection
function htmlEncode(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface EmailRequest {
  name: string;
  email: string;
  isWinner: boolean;
  rewardValue?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, isWinner, rewardValue }: EmailRequest = await req.json();

    console.log(`Sending email to ${email} - Winner: ${isWinner}`);

    // Sanitize user inputs
    const safeName = htmlEncode(name);
    const safeRewardValue = htmlEncode(rewardValue);

    const subject = isWinner 
      ? "🎉 Congratulations! You've Won a Free Monthly Subscription!"
      : "Thanks for Playing! Here's Something Special for You";

    const winnerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <h1 style="color: #667eea; text-align: center; font-size: 32px; margin-bottom: 20px;">🎉 Congratulations ${safeName}!</h1>
          <p style="font-size: 18px; color: #333; line-height: 1.6; text-align: center;">
            You're one of the lucky winners of our Scratch & Win game!
          </p>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">Your Prize</h2>
            <p style="font-size: 28px; font-weight: bold; margin: 0;">${safeRewardValue}</p>
          </div>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Our team will reach out to you shortly to activate your free monthly subscription. 
            Get ready to experience all our premium features!
          </p>
          <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
            Thank you for being part of our community!
          </p>
        </div>
      </div>
    `;

    const nonWinnerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <h1 style="color: #667eea; text-align: center; font-size: 32px; margin-bottom: 20px;">Thanks for Playing, ${safeName}!</h1>
          <p style="font-size: 18px; color: #333; line-height: 1.6; text-align: center;">
            While you didn't win this time, we appreciate your interest in our platform!
          </p>
          <div style="background: #f7f7f7; padding: 30px; border-radius: 8px; margin: 30px 0;">
            <h2 style="color: #667eea; font-size: 24px; text-align: center; margin-bottom: 20px;">Special Offer Just for You</h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6; text-align: center;">
              As a thank you for participating, we'd like to offer you an exclusive demo of our platform. 
              Our team will be in touch soon with personalized recommendations for your business needs.
            </p>
          </div>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            We're here to help you grow your jewelry business with our powerful catalog management 
            and sharing tools. Let's explore how we can work together!
          </p>
          <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
            Stay tuned for more exciting opportunities!
          </p>
        </div>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Jewelry Platform <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: isWinner ? winnerHtml : nonWinnerHtml,
      }),
    });

    const data = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
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
