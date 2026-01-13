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

        // Send notification email to site admin
        const adminEmailResponse = await resend.emails.send({
          from: "E-PDF's <noreply@e-pdfs.com>",
          to: ["contact@e-pdfs.com"],
          subject: `[Contact Form] ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Received at: ${new Date().toISOString()}</p>
          `,
        });

        console.log("Admin notification email sent:", adminEmailResponse);

        // Send confirmation email to user
        const userEmailResponse = await resend.emails.send({
          from: "E-PDF's <noreply@e-pdfs.com>",
          to: [email],
          subject: "We received your message - E-PDF's",
          html: `
            <h2>Thank you for contacting E-PDF's!</h2>
            <p>Hello ${firstName},</p>
            <p>We have received your message and will get back to you as soon as possible, usually within 24 hours.</p>
            <p><strong>Your message:</strong></p>
            <blockquote style="border-left: 3px solid #ec4899; padding-left: 15px; margin: 15px 0;">
              <p><strong>Subject:</strong> ${subject}</p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </blockquote>
            <p>Best regards,<br>The E-PDF's Team</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              E-PDF's - Free Online PDF Tools<br>
              <a href="https://e-pdfs.com">https://e-pdfs.com</a>
            </p>
          `,
        });

        console.log("User confirmation email sent:", userEmailResponse);
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
