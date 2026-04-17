import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import nodemailer from 'nodemailer'

/**
 * POST /api/magic-link
 * Body: { email: string }
 *
 * Generates a magic link and sends a branded email.
 * Used for the "Magic Link" login mode on the login page.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Generate magic link
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    if (linkErr) {
      return NextResponse.json({ error: linkErr.message }, { status: 400 })
    }

    let magicLink: string | null = null
    if (linkData?.properties?.hashed_token) {
      magicLink = `${origin}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=magiclink`
    }

    if (!magicLink) {
      return NextResponse.json({ error: 'Failed to generate magic link' }, { status: 500 })
    }

    // Send branded email via SMTP
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || '587')
    const smtpEmail = process.env.SMTP_EMAIL
    const smtpPassword = process.env.SMTP_PASSWORD
    const fromName = process.env.SMTP_FROM_NAME || 'TokyoCleaner'
    const fromEmail = process.env.SMTP_FROM_EMAIL || smtpEmail

    if (smtpHost && smtpEmail && smtpPassword) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false,
        auth: { user: smtpEmail, pass: smtpPassword },
      })

      const htmlEmail = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#F0F2F5; font-family:'Inter','Helvetica',sans-serif;">
  <div style="max-width:520px; margin:40px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0D9488,#14B8A6); padding:32px 40px; text-align:center;">
      <h1 style="color:white; font-size:24px; font-weight:700; margin:0 0 4px;">TokyoCleaner</h1>
      <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0;">Sign-in request</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#374151; font-size:15px; line-height:1.6; margin:0 0 24px;">
        Hi! Click the button below to sign in to your TokyoCleaner portal. This link expires in 1 hour.
      </p>

      <!-- Magic Link Button -->
      <div style="text-align:center; margin-bottom:28px;">
        <a href="${magicLink}" style="display:inline-block; background:#0EA5A0; color:white; text-decoration:none; padding:14px 32px; border-radius:10px; font-size:15px; font-weight:600;">
          ✨ Sign In to TokyoCleaner
        </a>
      </div>

      <p style="color:#9CA3AF; font-size:12px; line-height:1.5; margin:0; text-align:center;">
        If you didn't request this link, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#F9FAFB; border-top:1px solid #E5E7EB; padding:20px 40px; text-align:center;">
      <p style="color:#9CA3AF; font-size:12px; margin:0;">
        TokyoCleaner — Premium Cleaning Management
      </p>
    </div>
  </div>
</body>
</html>`

      // Fire-and-forget
      transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Sign in to TokyoCleaner',
        html: htmlEmail,
      }).catch((err: Error) => console.error('Magic link email error:', err.message))
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
