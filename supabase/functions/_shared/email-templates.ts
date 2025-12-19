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

const baseStyles = `
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px; }
    .content { padding: 40px 30px; color: #e2e8f0; }
    .content h2 { color: #ffffff; font-size: 22px; margin: 0 0 20px; }
    .content p { line-height: 1.7; margin: 0 0 16px; font-size: 15px; }
    .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .button:hover { opacity: 0.9; }
    .info-box { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-box h3 { color: #a5b4fc; margin: 0 0 12px; font-size: 16px; }
    .info-box ul { margin: 0; padding-left: 20px; color: #94a3b8; }
    .info-box li { margin: 8px 0; }
    .footer { background: rgba(0,0,0,0.3); padding: 30px; text-align: center; border-top: 1px solid rgba(99, 102, 241, 0.2); }
    .footer p { color: #64748b; font-size: 13px; margin: 0 0 8px; }
    .footer a { color: #818cf8; text-decoration: none; }
    .code-box { background: rgba(99, 102, 241, 0.15); border: 2px dashed rgba(99, 102, 241, 0.4); border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .code { font-size: 32px; font-weight: 700; color: #a5b4fc; letter-spacing: 4px; font-family: monospace; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent); margin: 30px 0; }
    .highlight { color: #a5b4fc; font-weight: 600; }
    .warning { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .warning h3 { color: #fca5a5; margin: 0 0 12px; }
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
<body style="background-color: #0f0f23; margin: 0; padding: 20px;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#0f0f23;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  <div class="container">
    ${content}
    <div class="footer">
      <p>This email was sent by Wallly</p>
      <p><a href="https://wallly.corevia.in">wallly.corevia.in</a></p>
      <p style="margin-top: 16px; font-size: 11px;">© ${new Date().getFullYear()} Wallly. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const EmailTemplates = {
  // Email Verification
  emailVerification: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header">
      <h1>🔐 Verify Your Email</h1>
      <p>Almost there! Just one more step.</p>
    </div>
    <div class="content">
      <h2>Welcome to Wallly${params.userName ? `, ${params.userName}` : ''}!</h2>
      <p>Thanks for signing up! Please verify your email address to get started with connecting to people around the world.</p>
      <div style="text-align: center;">
        <a href="${params.actionUrl}" class="button">Verify Email Address</a>
      </div>
      ${params.token ? `
      <div class="code-box">
        <p style="color: #94a3b8; margin: 0 0 10px; font-size: 13px;">Or use this verification code:</p>
        <div class="code">${params.token}</div>
      </div>
      ` : ''}
      <p style="color: #64748b; font-size: 13px;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `, 'Verify your email to start using Wallly'),

  // Password Reset
  passwordReset: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header">
      <h1>🔑 Reset Your Password</h1>
      <p>Don't worry, we've got you covered!</p>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset the password for your Wallly account${params.userEmail ? ` (${params.userEmail})` : ''}.</p>
      <div style="text-align: center;">
        <a href="${params.actionUrl}" class="button">Reset Password</a>
      </div>
      ${params.token ? `
      <div class="code-box">
        <p style="color: #94a3b8; margin: 0 0 10px; font-size: 13px;">Or use this code:</p>
        <div class="code">${params.token}</div>
      </div>
      ` : ''}
      <div class="divider"></div>
      <p style="color: #64748b; font-size: 13px;">This link expires in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
    </div>
  `, 'Reset your Wallly password'),

  // Welcome Email
  welcome: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header">
      <h1>🎉 Welcome to Wallly!</h1>
      <p>Your journey to meaningful connections starts now</p>
    </div>
    <div class="content">
      <h2>Hey${params.userName ? ` ${params.userName}` : ' there'}! 👋</h2>
      <p>Welcome to the Wallly community! We're thrilled to have you with us. Get ready to meet amazing people from around the world.</p>
      
      <div class="info-box">
        <h3>🚀 Here's what you can do:</h3>
        <ul>
          <li><strong>Video Chat</strong> - Connect face-to-face with strangers worldwide</li>
          <li><strong>Communities</strong> - Join groups based on your interests</li>
          <li><strong>Connections</strong> - Save and chat with people you meet</li>
          <li><strong>Premium Features</strong> - Upgrade for priority matching</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${params.siteUrl || 'https://wallly.corevia.in'}/app" class="button">Start Exploring</a>
      </div>
      
      <p>Have questions? Just reply to this email - we're always here to help!</p>
    </div>
  `, 'Welcome to Wallly - Start connecting today!'),

  // Connection Request
  connectionRequest: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header">
      <h1>🤝 New Connection Request</h1>
      <p>Someone wants to connect with you!</p>
    </div>
    <div class="content">
      <h2>Hey${params.userName ? ` ${params.userName}` : ''}!</h2>
      <p>Great news! <span class="highlight">${params.connectionName || 'Someone'}</span> would like to connect with you on Wallly.</p>
      
      <div class="info-box">
        <h3>What happens next?</h3>
        <ul>
          <li>Accept to start chatting with them</li>
          <li>View their profile before deciding</li>
          <li>Decline if you're not interested</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${params.siteUrl || 'https://wallly.corevia.in'}/connections" class="button">View Request</a>
      </div>
    </div>
  `, 'You have a new connection request on Wallly'),

  // Connection Accepted
  connectionAccepted: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header">
      <h1>✅ Connection Accepted!</h1>
      <p>You're now connected!</p>
    </div>
    <div class="content">
      <h2>Great news${params.userName ? `, ${params.userName}` : ''}!</h2>
      <p><span class="highlight">${params.connectionName || 'Your connection request was'}</span> accepted your connection request! You can now chat with them anytime.</p>
      
      <div style="text-align: center;">
        <a href="${params.siteUrl || 'https://wallly.corevia.in'}/connections" class="button">Start Chatting</a>
      </div>
    </div>
  `, 'Your connection request was accepted!'),

  // New Message Notification
  newMessage: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header">
      <h1>💬 New Message</h1>
      <p>You've got a message waiting!</p>
    </div>
    <div class="content">
      <h2>Hey${params.userName ? ` ${params.userName}` : ''}!</h2>
      <p><span class="highlight">${params.connectionName || 'Someone'}</span> sent you a message on Wallly.</p>
      
      <div style="text-align: center;">
        <a href="${params.siteUrl || 'https://wallly.corevia.in'}/connections" class="button">Read Message</a>
      </div>
      
      <p style="color: #64748b; font-size: 13px;">You can manage your email notification preferences in your profile settings.</p>
    </div>
  `, 'You have a new message on Wallly'),

  // Premium Upgrade
  premiumUpgrade: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);">
      <h1>⭐ Welcome to Premium!</h1>
      <p>You're now a VIP member</p>
    </div>
    <div class="content">
      <h2>Congratulations${params.userName ? `, ${params.userName}` : ''}! 🎉</h2>
      <p>You've upgraded to Wallly Premium! Enjoy all the exclusive benefits:</p>
      
      <div class="info-box" style="border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1);">
        <h3 style="color: #fbbf24;">✨ Your Premium Benefits:</h3>
        <ul>
          <li><strong>Priority Matching</strong> - Get matched faster with other users</li>
          <li><strong>Premium Badge</strong> - Stand out with your exclusive badge</li>
          <li><strong>Ad-Free Experience</strong> - No more interruptions</li>
          <li><strong>Advanced Filters</strong> - Find exactly who you want to meet</li>
          <li><strong>Unlimited Connections</strong> - No daily limits</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${params.siteUrl || 'https://wallly.corevia.in'}/app" class="button" style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);">Start Premium Experience</a>
      </div>
    </div>
  `, 'Welcome to Wallly Premium!'),

  // Account Warning
  accountWarning: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
      <h1>⚠️ Account Warning</h1>
      <p>Important notice about your account</p>
    </div>
    <div class="content">
      <h2>Important Notice</h2>
      <div class="warning">
        <h3>⚠️ Community Guidelines Violation</h3>
        <p style="color: #fecaca; margin: 0;">We've detected activity on your account that may violate our community guidelines.</p>
      </div>
      
      ${params.customMessage ? `<p>${params.customMessage}</p>` : ''}
      
      <p>Please review our <a href="${params.siteUrl || 'https://wallly.corevia.in'}/terms" style="color: #818cf8;">community guidelines</a> to ensure your future interactions comply with our policies.</p>
      
      <p><strong>Continued violations may result in account suspension or termination.</strong></p>
      
      <p style="color: #64748b; font-size: 13px;">If you believe this warning was sent in error, please contact our support team.</p>
    </div>
  `, 'Important notice about your Wallly account'),

  // Community Join
  communityJoin: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header">
      <h1>👥 Welcome to the Community!</h1>
      <p>You're now a member</p>
    </div>
    <div class="content">
      <h2>Hey${params.userName ? ` ${params.userName}` : ''}!</h2>
      <p>You've successfully joined <span class="highlight">${params.communityName || 'a new community'}</span> on Wallly!</p>
      
      <div class="info-box">
        <h3>💡 Getting Started:</h3>
        <ul>
          <li>Introduce yourself to the community</li>
          <li>Check out recent posts and discussions</li>
          <li>Share your thoughts and connect with members</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${params.siteUrl || 'https://wallly.corevia.in'}/communities" class="button">Visit Community</a>
      </div>
    </div>
  `, `You've joined a new community on Wallly`),

  // Newsletter
  newsletter: (params: EmailTemplateParams) => emailWrapper(`
    <div class="header">
      <h1>📰 Wallly Weekly</h1>
      <p>Your weekly dose of updates</p>
    </div>
    <div class="content">
      <h2>Hey${params.userName ? ` ${params.userName}` : ' there'}! 👋</h2>
      <p>Here's what's happening at Wallly this week:</p>
      
      ${params.customMessage || `
      <div class="info-box">
        <h3>🚀 What's New</h3>
        <ul>
          <li>Improved video chat quality</li>
          <li>New community features</li>
          <li>Enhanced matching algorithm</li>
        </ul>
      </div>
      `}
      
      <div style="text-align: center;">
        <a href="${params.siteUrl || 'https://wallly.corevia.in'}/app" class="button">Open Wallly</a>
      </div>
      
      <p style="color: #64748b; font-size: 13px; text-align: center;">Don't want to receive these emails? <a href="${params.siteUrl || 'https://wallly.corevia.in'}/settings" style="color: #818cf8;">Unsubscribe</a></p>
    </div>
  `, 'Your Wallly Weekly Update'),
};

export const getEmailTemplate = (
  templateName: keyof typeof EmailTemplates, 
  params: EmailTemplateParams
): string => {
  const template = EmailTemplates[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }
  return template(params);
};

export const getPlainTextVersion = (html: string): string => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};
