import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, subject, message }: ContactFormData = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Log the contact form submission
    console.log("Contact form submission received:", {
      firstName,
      lastName,
      email,
      subject,
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      // Still return success since we logged the message
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Your message has been received. We will get back to you soon!" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to store the contact message in the database if table exists
    try {
      const { error: insertError } = await supabase
        .from("contact_messages")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          subject: subject,
          message: message,
        });

      if (insertError) {
        console.log("Could not store in database (table may not exist):", insertError.message);
        // Continue anyway - the message was logged
      } else {
        console.log("Contact message stored successfully");
      }
    } catch (dbError) {
      console.log("Database operation skipped:", dbError);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const currentDate = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        // Modern HTML email template for admin
        const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">📧 E-PDF's</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">New Contact Form Submission</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <!-- Contact Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fdf4ff; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">👤 Contact Information</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f3e8ff;">
                          <span style="color: #6b7280; font-size: 13px;">Full Name</span><br>
                          <span style="color: #1f2937; font-size: 16px; font-weight: 500;">${firstName} ${lastName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f3e8ff;">
                          <span style="color: #6b7280; font-size: 13px;">Email Address</span><br>
                          <a href="mailto:${email}" style="color: #ec4899; font-size: 16px; font-weight: 500; text-decoration: none;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 13px;">Subject</span><br>
                          <span style="color: #1f2937; font-size: 16px; font-weight: 500;">${subject}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Message Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #ec4899;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">💬 Message</h2>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Reply Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                      ↩️ Reply to ${firstName}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 24px; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 13px;">
                📅 Received on ${currentDate}
              </p>
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                This email was sent from the contact form at <a href="https://e-pdfs.com" style="color: #ec4899; text-decoration: none;">e-pdfs.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        // Modern HTML email template for user confirmation
        const userEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">E-PDF's</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">Free Online PDF Tools</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Thank you, ${firstName}! ✨</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                We've received your message and our team will get back to you as soon as possible, usually within <strong>24 hours</strong>.
              </p>
              
              <!-- Message Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fdf4ff; border-radius: 12px; border-left: 4px solid #ec4899; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Your Message</p>
                    <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">${subject}</p>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 0; white-space: pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                While you wait, feel free to explore our free PDF tools:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://e-pdfs.com" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                      🔧 Explore PDF Tools
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 32px; text-align: center;">
              <p style="color: #f9fafb; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">E-PDF's</p>
              <p style="color: #9ca3af; margin: 0 0 16px 0; font-size: 14px;">
                Merge • Split • Compress • Convert
              </p>
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                © 2025 E-PDF's. All rights reserved.<br>
                <a href="https://e-pdfs.com/privacy" style="color: #ec4899; text-decoration: none;">Privacy Policy</a> • 
                <a href="https://e-pdfs.com/terms" style="color: #ec4899; text-decoration: none;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        // Send notification email to site admin
        // NOTE: Until domain is verified at resend.com/domains, emails go to youssefwin747@gmail.com
        const adminEmailResponse = await resend.emails.send({
          from: "E-PDF's Contact <onboarding@resend.dev>",
          to: ["youssefwin747@gmail.com"],
          reply_to: email,
          subject: `🔔 [E-PDF's Contact] ${subject} - from ${firstName} ${lastName}`,
          html: adminEmailHtml,
        });

        console.log("Admin notification email sent:", adminEmailResponse);

        // Skip user confirmation email until domain is verified
        // Users still see success message, and admin can reply directly
        console.log("User confirmation email skipped (domain not verified yet)");
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Continue - the message was still logged and stored
      }
    } else {
      console.log("RESEND_API_KEY not configured - skipping email notifications");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your message has been received. We will get back to you soon!" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
