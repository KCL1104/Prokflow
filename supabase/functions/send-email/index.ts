// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// Supabase Edge Function for sending emails
// This function handles email delivery using Supabase's email service

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { to, subject, html, text, from }: EmailRequest = await req.json()

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare email data
    const emailData = {
      to,
      subject,
      html: html || text || '',
      text: text || '',
      from: from || Deno.env.get('DEFAULT_FROM_EMAIL') || 'noreply@your-app.com'
    }

    // Send email using Supabase's built-in email service
    // Note: This uses a hypothetical Supabase email service API
    // In practice, you might need to integrate with services like:
    // - Resend (recommended by Supabase)
    // - SendGrid
    // - Mailgun
    // - AWS SES
    
    // For now, we'll use a generic email service approach
    const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL')
    const emailServiceKey = Deno.env.get('EMAIL_SERVICE_KEY')
    
    if (!emailServiceUrl || !emailServiceKey) {
      console.log('Email service not configured, logging email instead:')
      console.log('To:', emailData.to)
      console.log('Subject:', emailData.subject)
      console.log('HTML:', emailData.html)
      console.log('Text:', emailData.text)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (service not configured)',
          emailId: `mock-${Date.now()}`
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          } 
        }
      )
    }

    // Send email via external service (example with Resend)
    const emailResponse = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: emailData.from,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Email service error:', errorText)
      throw new Error(`Email service responded with ${emailResponse.status}: ${errorText}`)
    }

    const emailResult = await emailResponse.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailResult.id || `sent-${Date.now()}`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Send email error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})