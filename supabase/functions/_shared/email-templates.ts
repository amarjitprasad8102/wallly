// Shared email templates for Wallly

export interface EmailTemplateParams {
  userName?: string;
  userEmail?: string;
  actionUrl?: string;
  token?: string;
  siteUrl?: string;
  customMessage?: string;
  connectionName?: string;
  communityName?: string;
}

// Wallly Logo using uploaded image
const wallyLogo = `
<div style="text-align: center; padding: 40px 20px 30px;">
  <table cellpadding="0" cellspacing="0" border="0" align="center">
    <tr>
      <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); padding: 20px; border-radius: 24px; box-shadow: 0 20px 60px rgba(99, 102, 241, 0.4);">
        <img src="https://wallly.in/logo.png" alt="Wallly Logo" width="48" height="48" style="display: block; border: 0;">
      </td>
    </tr>
  </table>
  <h1 style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 36px; font-weight: 800; margin: 20px 0 8px; letter-spacing: -1px;">Wallly</h1>
  <p style="color: #94a3b8; font-size: 14px; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Connect. Chat. Discover.</p>
</div>
`;

// Modern CTA Button
const ctaButton = (text: string, url: string, style?: string) => `
<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 30px auto;">
  <tr>
    <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border-radius: 14px; box-shadow: 0 8px 30px rgba(99, 102, 241, 0.35); ${style || ''}">
      <a href="${url}" target="_blank" style="display: inline-block; padding: 18px 48px; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">
        ${text} →
      </a>
    </td>
  </tr>
</table>
`;

// Visit Wallly Button (always included)
const visitWallyButton = `
<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px auto;">
  <tr>
    <td style="background: linear-gradient(135deg, #1e1e3f 0%, #2d2d5a 100%); border: 2px solid rgba(99, 102, 241, 0.3); border-radius: 14px;">
      <a href="https://wallly.in" target="_blank" style="display: inline-block; padding: 14px 36px; color: #a5b4fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none;">
        🌐 Visit wallly.in
      </a>
    </td>
  </tr>
</table>
`;

// Contact Support Button and No-Reply Notice
const contactSupportSection = `
<div style="text-align: center; margin: 30px 0 20px; padding-top: 24px; border-top: 1px solid rgba(99, 102, 241, 0.15);">
  <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 16px;">
    <tr>
      <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
        <a href="mailto:help@corevia.in" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none;">
          📧 Contact Support
        </a>
      </td>
    </tr>
  </table>
  <p style="color: #64748b; font-size: 12px; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
    Need help? Email us at <a href="mailto:help@corevia.in" style="color: #818cf8; text-decoration: none; font-weight: 500;">help@corevia.in</a><br/>
    This is an automated email. Please do not reply directly to this message.
  </p>
</div>
`;

const baseStyles = `
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a1a; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #12122a 0%, #0f0f23 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(99, 102, 241, 0.15); }
    .header { background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%); padding: 0; text-align: center; border-bottom: 1px solid rgba(99, 102, 241, 0.1); }
    .content { padding: 40px 40px 30px; color: #e2e8f0; }
    .content h2 { color: #ffffff; font-size: 26px; margin: 0 0 20px; font-weight: 700; letter-spacing: -0.5px; }
    .content p { line-height: 1.8; margin: 0 0 18px; font-size: 15px; color: #cbd5e1; }
    .feature-card { background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0; }
    .feature-card h3 { color: #a5b4fc; margin: 0 0 16px; font-size: 17px; font-weight: 700; }
    .feature-card ul { margin: 0; padding-left: 0; list-style: none; }
    .feature-card li { margin: 12px 0; color: #94a3b8; padding-left: 28px; position: relative; font-size: 14px; }
    .feature-card li::before { content: "✦"; position: absolute; left: 0; color: #818cf8; font-size: 12px; }
    .footer { background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%); padding: 30px 40px; text-align: center; border-top: 1px solid rgba(99, 102, 241, 0.1); }
    .footer p { color: #475569; font-size: 13px; margin: 0 0 8px; }
    .footer a { color: #818cf8; text-decoration: none; font-weight: 500; }
    .code-box { background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); border: 2px dashed rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; }
    .code { font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 8px; font-family: 'Courier New', monospace; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent); margin: 30px 0; }
    .highlight { color: #a5b4fc; font-weight: 600; }
    .warning-card { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0; }
    .warning-card h3 { color: #fca5a5; margin: 0 0 12px; font-weight: 700; }
    .emoji-icon { font-size: 48px; margin-bottom: 16px; display: block; }
  </style>
`;

const emailWrapper = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wallly</title>
  ${baseStyles}
</head>
<body style="background-color: #0a0a1a; margin: 0; padding: 30px 20px;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#0a0a1a;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  <div class="container">
    <div class="header">
      ${wallyLogo}
    </div>
    ${content}
    <div style="text-align: center; padding: 10px 40px 30px;">
      ${visitWallyButton}
      ${contactSupportSection}
    </div>
    <div class="footer">
      <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">Made with 💜 by the Wallly Team</p>
      <p><a href="https://wallly.in" style="color: #818cf8; font-weight: 600;">wallly.in</a></p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(99, 102, 241, 0.1);">
        <p style="color: #475569; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Wallly. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const EmailTemplates = {
  // Email Verification
  emailVerification: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">🔐</span>
        <h2 style="background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Verify Your Email</h2>
        <p style="color: #94a3b8; margin: 0;">Almost there! Just one more step.</p>
      </div>
      
      <p>Hey${params.userName ? ` <span class="highlight">${params.userName}</span>` : ' there'}! 👋</p>
      <p>Thanks for joining Wallly! Verify your email to unlock the full experience and start connecting with amazing people worldwide.</p>
      
      ${ctaButton('Verify Email', params.actionUrl || 'https://wallly.in')}
      
      ${params.token ? `
      <div class="code-box">
        <p style="color: #94a3b8; margin: 0 0 12px; font-size: 13px;">Or use this verification code:</p>
        <div class="code">${params.token}</div>
      </div>
      ` : ''}
      
      <p style="color: #64748b; font-size: 13px; text-align: center;">This link expires in 24 hours. Didn't create an account? Just ignore this email.</p>
    </div>
  `, 'Verify your email to start using Wallly'),

  // Password Reset
  passwordReset: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">🔑</span>
        <h2>Reset Your Password</h2>
        <p style="color: #94a3b8; margin: 0;">No worries, we've got you covered!</p>
      </div>
      
      <p>We received a request to reset the password for your Wallly account${params.userEmail ? ` (<span class="highlight">${params.userEmail}</span>)` : ''}.</p>
      
      ${ctaButton('Reset Password', params.actionUrl || 'https://wallly.in')}
      
      ${params.token ? `
      <div class="code-box">
        <p style="color: #94a3b8; margin: 0 0 12px; font-size: 13px;">Or use this code:</p>
        <div class="code">${params.token}</div>
      </div>
      ` : ''}
      
      <div class="divider"></div>
      <p style="color: #64748b; font-size: 13px; text-align: center;">This link expires in 1 hour. Didn't request this? You can safely ignore this email.</p>
    </div>
  `, 'Reset your Wallly password'),

  // Welcome Email
  welcome: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">🎉</span>
        <h2>Welcome to Wallly!</h2>
        <p style="color: #94a3b8; margin: 0;">Your journey to meaningful connections starts now</p>
      </div>
      
      <p>Hey${params.userName ? ` <span class="highlight">${params.userName}</span>` : ' there'}! 👋</p>
      <p>Welcome to the Wallly community! We're absolutely thrilled to have you. Get ready to meet amazing people from around the globe.</p>
      
      <div class="feature-card">
        <h3>🚀 What you can do on Wallly:</h3>
        <ul>
          <li><strong>Video Chat</strong> — Connect face-to-face with strangers worldwide</li>
          <li><strong>Text Chat</strong> — Real-time messaging with random people</li>
          <li><strong>Image Sharing</strong> — Share photos during your conversations</li>
          <li><strong>Communities</strong> — Join groups based on your interests</li>
          <li><strong>Connections</strong> — Save and chat with people you meet</li>
          <li><strong>Premium</strong> — Unlock priority matching & more</li>
        </ul>
      </div>
      
      ${ctaButton('Start Exploring', 'https://wallly.in')}
    </div>
  `, 'Welcome to Wallly - Start connecting today!'),

  // Connection Request
  connectionRequest: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">🤝</span>
        <h2>New Connection Request</h2>
        <p style="color: #94a3b8; margin: 0;">Someone wants to connect with you!</p>
      </div>
      
      <p>Hey${params.userName ? ` <span class="highlight">${params.userName}</span>` : ''}! 👋</p>
      <p>Great news! <span class="highlight">${params.connectionName || 'Someone'}</span> would like to connect with you on Wallly.</p>
      
      <div class="feature-card">
        <h3>What happens next?</h3>
        <ul>
          <li>Accept to start chatting with them</li>
          <li>View their profile before deciding</li>
          <li>Decline if you're not interested</li>
        </ul>
      </div>
      
      ${ctaButton('View Request', 'https://wallly.in/connections')}
    </div>
  `, 'You have a new connection request on Wallly'),

  // Connection Accepted
  connectionAccepted: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">✅</span>
        <h2>Connection Accepted!</h2>
        <p style="color: #94a3b8; margin: 0;">You're now connected!</p>
      </div>
      
      <p>Awesome news${params.userName ? `, <span class="highlight">${params.userName}</span>` : ''}! 🎊</p>
      <p><span class="highlight">${params.connectionName || 'Your connection'}</span> accepted your request! You can now chat with them anytime.</p>
      
      ${ctaButton('Start Chatting', 'https://wallly.in/connections')}
    </div>
  `, 'Your connection request was accepted!'),

  // New Message Notification
  newMessage: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">💬</span>
        <h2>New Message</h2>
        <p style="color: #94a3b8; margin: 0;">You've got a message waiting!</p>
      </div>
      
      <p>Hey${params.userName ? ` <span class="highlight">${params.userName}</span>` : ''}! 👋</p>
      <p><span class="highlight">${params.connectionName || 'Someone'}</span> sent you a message on Wallly. Don't keep them waiting!</p>
      
      ${ctaButton('Read Message', 'https://wallly.in/connections')}
      
      <p style="color: #64748b; font-size: 13px; text-align: center;">Manage your notification preferences in profile settings.</p>
    </div>
  `, 'You have a new message on Wallly'),

  // Premium Upgrade
  premiumUpgrade: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">⭐</span>
        <h2 style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Welcome to Premium!</h2>
        <p style="color: #fbbf24; margin: 0;">You're now a VIP member</p>
      </div>
      
      <p>Congratulations${params.userName ? `, <span class="highlight">${params.userName}</span>` : ''}! 🎉</p>
      <p>You've upgraded to Wallly Premium! Enjoy all the exclusive perks:</p>
      
      <div class="feature-card" style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%); border-color: rgba(251, 191, 36, 0.2);">
        <h3 style="color: #fbbf24;">✨ Your Premium Benefits:</h3>
        <ul>
          <li><strong>Priority Matching</strong> — Get matched faster</li>
          <li><strong>Premium Badge</strong> — Stand out from the crowd</li>
          <li><strong>Ad-Free Experience</strong> — No interruptions</li>
          <li><strong>Advanced Filters</strong> — Find exactly who you want</li>
          <li><strong>Unlimited Connections</strong> — No daily limits</li>
        </ul>
      </div>
      
      ${ctaButton('Start Premium Experience', 'https://wallly.in', 'background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);')}
    </div>
  `, 'Welcome to Wallly Premium!'),

  // Account Warning
  accountWarning: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">⚠️</span>
        <h2 style="color: #fca5a5;">Account Warning</h2>
        <p style="color: #f87171; margin: 0;">Important notice about your account</p>
      </div>
      
      <div class="warning-card">
        <h3>⚠️ Community Guidelines Violation</h3>
        <p style="color: #fecaca; margin: 0;">We've detected activity on your account that may violate our community guidelines.</p>
      </div>
      
      ${params.customMessage ? `<p>${params.customMessage}</p>` : ''}
      
      <p>Please review our <a href="https://wallly.in/terms" style="color: #818cf8; font-weight: 600;">community guidelines</a> to ensure your future interactions comply with our policies.</p>
      
      <p><strong style="color: #fca5a5;">Continued violations may result in account suspension or termination.</strong></p>
      
      ${ctaButton('Review Guidelines', 'https://wallly.in/terms', 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);')}
    </div>
  `, 'Important notice about your Wallly account'),

  // Community Join
  communityJoin: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">👥</span>
        <h2>Welcome to the Community!</h2>
        <p style="color: #94a3b8; margin: 0;">You're officially a member</p>
      </div>
      
      <p>Hey${params.userName ? ` <span class="highlight">${params.userName}</span>` : ''}! 👋</p>
      <p>You've successfully joined <span class="highlight">${params.communityName || 'a new community'}</span> on Wallly!</p>
      
      <div class="feature-card">
        <h3>💡 Getting Started:</h3>
        <ul>
          <li>Introduce yourself to the community</li>
          <li>Check out recent posts and discussions</li>
          <li>Share your thoughts and connect with members</li>
        </ul>
      </div>
      
      ${ctaButton('Visit Community', 'https://wallly.in/communities')}
    </div>
  `, `You've joined a new community on Wallly`),

  // Newsletter
  newsletter: (params: EmailTemplateParams) => emailWrapper(`
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="emoji-icon">📬</span>
        <h2>Wallly Newsletter</h2>
        <p style="color: #94a3b8; margin: 0;">Your weekly dose of connections</p>
      </div>
      
      <p>Hey${params.userName ? ` <span class="highlight">${params.userName}</span>` : ' there'}! 👋</p>
      
      ${params.customMessage || '<p>Check out what\'s new on Wallly this week!</p>'}
      
      ${ctaButton('Explore Wallly', 'https://wallly.in')}
      
      <div class="divider"></div>
      <p style="color: #64748b; font-size: 12px; text-align: center;">
        You're receiving this because you subscribed to Wallly updates.<br/>
        <a href="https://wallly.in/settings" style="color: #818cf8;">Manage preferences</a>
      </p>
    </div>
  `, 'Your Wallly Weekly Update'),
};

export const getEmailTemplate = (
  templateName: keyof typeof EmailTemplates,
  params: EmailTemplateParams
): string => {
  const template = EmailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template "${templateName}" not found`);
  }
  return template(params);
};

// Plain text version generator
export const getPlainTextVersion = (html: string): string => {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, '')
    .replace(/<script[^>]*>.*?<\/script>/gs, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};
