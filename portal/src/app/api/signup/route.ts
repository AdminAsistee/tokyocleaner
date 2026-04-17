import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import nodemailer from 'nodemailer'

/**
 * POST /api/signup
 * Body: { email: string }
 *
 * Creates a user with an auto-generated password, sets their role,
 * generates a magic link, and sends a welcome email with both credentials.
 * Email is sent fire-and-forget for fast response.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Public sign-up is always client role.
    // Staff accounts are created by clients from their dashboard (future feature).
    const role = 'client'

    const supabase = createAdminClient()

    // 1. Generate random password
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let randomPart = ''
    for (let i = 0; i < 8; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const password = `TC-${randomPart}`

    // 2. Create user with confirmed email
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 400 })
    }

    const userId = createData.user.id

    // 3. Set role in app_metadata
    const { error: roleErr } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: { role },
    })

    if (roleErr) {
      return NextResponse.json({ error: roleErr.message }, { status: 500 })
    }

    // 3b. Insert into clients table (name left empty — user fills via onboarding popup)
    const { error: clientErr } = await supabase.from('clients').insert({
      name: '',
      auth_user_id: userId,
      is_active: true,
    })

    if (clientErr) {
      console.error('Client insert error:', clientErr.message)
    }

    // 4. Generate magic link — route through our auth callback directly
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    })

    let magicLink: string | null = null
    if (!linkErr && linkData?.properties?.hashed_token) {
      // Build link that goes to our auth callback with the token hash
      magicLink = `${origin}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=magiclink`
    }

    // 5. Send welcome email via SMTP
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
        auth: {
          user: smtpEmail,
          pass: smtpPassword,
        },
      })

      const htmlEmail = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#F0F2F5; font-family:'Inter','Helvetica',sans-serif;">
  <div style="max-width:520px; margin:40px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0D9488,#14B8A6); padding:32px 40px; text-align:center;">
      <h1 style="color:white; font-size:24px; font-weight:700; margin:0 0 4px;">Welcome to TokyoCleaner</h1>
      <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0;">Your account has been created</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#374151; font-size:15px; line-height:1.6; margin:0 0 24px;">
        Hi there! Your TokyoCleaner account is ready. You can sign in using either method below:
      </p>

      <!-- Magic Link Button -->
      ${magicLink ? `
      <div style="text-align:center; margin-bottom:28px;">
        <a href="${magicLink}" style="display:inline-block; background:#0EA5A0; color:white; text-decoration:none; padding:14px 32px; border-radius:10px; font-size:15px; font-weight:600;">
          ✨ Sign In with Magic Link
        </a>
        <p style="color:#9CA3AF; font-size:12px; margin-top:8px;">One-click, no password needed</p>
      </div>
      ` : ''}

      <!-- Divider -->
      <div style="display:flex; align-items:center; gap:12px; margin:24px 0;">
        <div style="flex:1; height:1px; background:#E5E7EB;"></div>
        <span style="color:#9CA3AF; font-size:12px; font-weight:600;">OR USE PASSWORD</span>
        <div style="flex:1; height:1px; background:#E5E7EB;"></div>
      </div>

      <!-- Credentials -->
      <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:20px; margin-bottom:24px;">
        <div style="margin-bottom:12px;">
          <div style="font-size:11px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Email</div>
          <div style="font-size:15px; font-weight:600; color:#111827;">${email}</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Password</div>
          <div style="font-size:15px; font-weight:600; color:#111827; font-family:monospace; letter-spacing:0.5px;">${password}</div>
        </div>
      </div>

      <p style="color:#6B7280; font-size:13px; line-height:1.5; margin:0;">
        ⚠️ For security, please change your password after your first login by going to <strong>Settings</strong>.
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

      // Fire-and-forget: send email in background, respond immediately
      transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Welcome to TokyoCleaner — Your Login Credentials',
        html: htmlEmail,
      }).catch((err: Error) => console.error('Email send error:', err.message))
    }

    return NextResponse.json({ success: true, email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
