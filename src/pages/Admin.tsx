import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus, Pencil, Trash2, Eye, EyeOff, Users, FileText, Flag, Settings, Mail, Send, Clock, CheckCircle, XCircle, Ban, UserX, MessageSquare } from "lucide-react";
import { sendPremiumUpgradeEmail } from "@/utils/emailNotifications";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminLeads from "@/components/AdminLeads";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminSystemHealth } from "@/components/admin/AdminSystemHealth";

interface User {
  id: string;
  email: string;
  unique_id: string;
  is_premium: boolean;
  age: number | null;
  created_at?: string;
}

interface UserRole {
  role: string;
}

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter_email?: string;
  reported_email?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  author: string;
  published_at: string;
  image_url: string;
  category: string;
  content: string;
  is_published: boolean;
  created_at: string;
}

interface Community {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  member_count: number;
  post_count: number;
  created_at: string;
}

interface EmailLog {
  id: string;
  sent_by: string;
  recipients: string[];
  subject: string;
  content: string;
  template_used: string | null;
  status: string;
  message_id: string | null;
  error_message: string | null;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

// Modern email template wrapper with Wallly branding
const emailTemplateWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wallly</title>
</head>
<body style="background-color: #0a0a1a; margin: 0; padding: 30px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #12122a 0%, #0f0f23 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(99, 102, 241, 0.15);">
    <!-- Logo Section -->
    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%); padding: 40px 20px 30px; text-align: center; border-bottom: 1px solid rgba(99, 102, 241, 0.1);">
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); padding: 20px; border-radius: 24px; box-shadow: 0 20px 60px rgba(99, 102, 241, 0.4);">
            <div style="width: 48px; height: 48px; color: white; font-size: 24px;">💬</div>
          </td>
        </tr>
      </table>
      <h1 style="color: #a5b4fc; font-size: 36px; font-weight: 800; margin: 20px 0 8px; letter-spacing: -1px;">Wallly</h1>
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">Connect. Chat. Discover.</p>
    </div>
    
    <!-- Content Section -->
    <div style="padding: 40px 40px 30px; color: #e2e8f0;">
      ${content}
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; padding: 10px 40px 30px;">
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border-radius: 14px; box-shadow: 0 8px 30px rgba(99, 102, 241, 0.35);">
            <a href="https://wallly.in" target="_blank" style="display: inline-block; padding: 18px 48px; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.5px;">
              Visit Wallly →
            </a>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%); padding: 30px 40px; text-align: center; border-top: 1px solid rgba(99, 102, 241, 0.1);">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 16px;">Made with 💜 by the Wallly Team</p>
      <p style="margin: 0;"><a href="https://wallly.in" style="color: #818cf8; font-weight: 600; text-decoration: none;">wallly.in</a></p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(99, 102, 241, 0.1);">
        <p style="color: #475569; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Wallly. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to Wallly! 🎉",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🎉</span>
        <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Welcome to Wallly!</h2>
        <p style="color: #94a3b8; margin: 0;">Your journey to meaningful connections starts now</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Hey there! 👋</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Thank you for joining Wallly! We're absolutely thrilled to have you as part of our community.</p>
      <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #a5b4fc; margin: 0 0 16px; font-size: 17px; font-weight: 700;">🚀 What you can do on Wallly:</h3>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ <strong>Video Chat</strong> — Connect face-to-face with strangers worldwide</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ <strong>Communities</strong> — Join groups based on your interests</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ <strong>Connections</strong> — Save and chat with people you meet</p>
      </div>
    `),
  },
  {
    id: "premium-upgrade",
    name: "Premium Upgrade",
    subject: "Congratulations! You're Now a Premium Member ⭐",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">⭐</span>
        <h2 style="color: #fbbf24; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Welcome to Premium!</h2>
        <p style="color: #fbbf24; margin: 0;">You're now a VIP member</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Congratulations! 🎉 You've upgraded to Wallly Premium!</p>
      <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #fbbf24; margin: 0 0 16px; font-size: 17px; font-weight: 700;">✨ Your Premium Benefits:</h3>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Priority Matching — Get matched faster</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Premium Badge — Stand out from the crowd</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Advanced Filters — Find exactly who you want</p>
      </div>
    `),
  },
  {
    id: "account-warning",
    name: "Account Warning",
    subject: "Important: Account Warning ⚠️",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">⚠️</span>
        <h2 style="color: #fca5a5; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Account Warning</h2>
        <p style="color: #f87171; margin: 0;">Important notice about your account</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">We've detected activity on your account that may violate our community guidelines.</p>
      <p style="color: #fca5a5; line-height: 1.8; margin: 0 0 18px;"><strong>Continued violations may result in account suspension.</strong></p>
    `),
  },
  {
    id: "account-banned",
    name: "Account Banned",
    subject: "Your Wallly Account Has Been Suspended 🚫",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🚫</span>
        <h2 style="color: #fca5a5; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Account Suspended</h2>
        <p style="color: #f87171; margin: 0;">Your account has been banned</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;"><strong>Reason:</strong> [BAN_REASON]</p>
    `),
  },
  {
    id: "account-deleted",
    name: "Account Deleted",
    subject: "Your Wallly Account Has Been Deleted 👋",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">👋</span>
        <h2 style="color: #fca5a5; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Account Deleted</h2>
        <p style="color: #f87171; margin: 0;">Your account has been removed</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Your Wallly account and all associated data have been permanently deleted.</p>
    `),
  },
  {
    id: "newsletter",
    name: "Newsletter",
    subject: "Wallly Weekly Update 📰",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">📰</span>
        <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Wallly Weekly</h2>
        <p style="color: #94a3b8; margin: 0;">Your weekly dose of updates</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Hey there! 👋 Here's what's happening at Wallly this week:</p>
      <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ New features coming soon</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Community highlights</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Tips for better connections</p>
      </div>
    `),
  },
  // NEW TEMPLATES BELOW
  {
    id: "new-connection",
    name: "New Connection",
    subject: "You Have a New Connection! 🤝",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🤝</span>
        <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 700;">New Connection!</h2>
        <p style="color: #94a3b8; margin: 0;">Someone wants to connect with you</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Great news! Someone you chatted with wants to stay connected.</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Log in to Wallly to accept the connection request and continue the conversation!</p>
    `),
  },
  {
    id: "missed-message",
    name: "Missed Message",
    subject: "You Have Unread Messages 💬",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">💬</span>
        <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Unread Messages</h2>
        <p style="color: #94a3b8; margin: 0;">Someone is waiting for your reply</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">You have unread messages from your connections!</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Don't keep them waiting — log in to Wallly and continue the conversation.</p>
    `),
  },
  {
    id: "community-welcome",
    name: "Community Welcome",
    subject: "Welcome to the Community! 🏠",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🏠</span>
        <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Welcome to the Community!</h2>
        <p style="color: #94a3b8; margin: 0;">You've joined a new community</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Welcome! You're now part of an amazing community on Wallly.</p>
      <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Introduce yourself to other members</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Share your thoughts and ideas</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Connect with like-minded people</p>
      </div>
    `),
  },
  {
    id: "feedback-request",
    name: "Feedback Request",
    subject: "We'd Love Your Feedback! 📝",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">📝</span>
        <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Share Your Thoughts</h2>
        <p style="color: #94a3b8; margin: 0;">Help us improve Wallly</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">We're always looking to improve your experience on Wallly.</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Would you mind taking a moment to share your feedback? Your input helps us build a better platform for everyone.</p>
    `),
  },
  {
    id: "special-offer",
    name: "Special Offer",
    subject: "Exclusive Offer Just For You! 🎁",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🎁</span>
        <h2 style="color: #22c55e; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Special Offer!</h2>
        <p style="color: #22c55e; margin: 0;">Limited time only</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">We've got an exclusive offer just for you!</p>
      <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.08) 100%); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #22c55e; margin: 0; font-size: 24px; font-weight: 700;">🔥 [OFFER_DETAILS] 🔥</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Don't miss out — this offer won't last forever!</p>
    `),
  },
  {
    id: "inactivity-reminder",
    name: "We Miss You",
    subject: "We Miss You! Come Back to Wallly 💜",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">💜</span>
        <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 700;">We Miss You!</h2>
        <p style="color: #94a3b8; margin: 0;">It's been a while since we've seen you</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Hey there! We noticed you haven't been on Wallly in a while.</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">There are new people waiting to connect with you. Come back and discover amazing conversations!</p>
    `),
  },
  {
    id: "milestone",
    name: "Milestone Celebration",
    subject: "Congratulations on Your Achievement! 🏆",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🏆</span>
        <h2 style="color: #fbbf24; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Achievement Unlocked!</h2>
        <p style="color: #fbbf24; margin: 0;">You've reached a milestone</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Congratulations! 🎉 You've achieved something amazing on Wallly.</p>
      <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #fbbf24; margin: 0; font-size: 20px; font-weight: 700;">[MILESTONE_DETAILS]</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Keep up the great work!</p>
    `),
  },
  {
    id: "security-alert",
    name: "Security Alert",
    subject: "Security Alert: New Login Detected 🔒",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🔒</span>
        <h2 style="color: #3b82f6; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Security Alert</h2>
        <p style="color: #3b82f6; margin: 0;">New login detected</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">We detected a new login to your Wallly account.</p>
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">📍 Location: [LOCATION]</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">📱 Device: [DEVICE]</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">🕐 Time: [TIME]</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">If this wasn't you, please secure your account immediately.</p>
    `),
  },
  {
    id: "maintenance",
    name: "Maintenance Notice",
    subject: "Scheduled Maintenance Notice 🔧",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🔧</span>
        <h2 style="color: #f59e0b; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Maintenance Notice</h2>
        <p style="color: #f59e0b; margin: 0;">Scheduled system maintenance</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">We'll be performing scheduled maintenance to improve your Wallly experience.</p>
      <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <p style="color: #f59e0b; margin: 8px 0; font-size: 14px;"><strong>Date:</strong> [DATE]</p>
        <p style="color: #f59e0b; margin: 8px 0; font-size: 14px;"><strong>Time:</strong> [TIME]</p>
        <p style="color: #f59e0b; margin: 8px 0; font-size: 14px;"><strong>Duration:</strong> [DURATION]</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Thank you for your patience!</p>
    `),
  },
  {
    id: "feature-announcement",
    name: "New Feature",
    subject: "New Feature Alert! ✨",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">✨</span>
        <h2 style="color: #a855f7; font-size: 26px; margin: 0 0 8px; font-weight: 700;">New Feature!</h2>
        <p style="color: #a855f7; margin: 0;">Something exciting is here</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">We're excited to announce a brand new feature on Wallly!</p>
      <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #a855f7; margin: 0 0 12px; font-weight: 700;">[FEATURE_NAME]</h3>
        <p style="color: #94a3b8; margin: 0; font-size: 14px;">[FEATURE_DESCRIPTION]</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Log in now to try it out!</p>
    `),
  },
  {
    id: "birthday",
    name: "Birthday Wishes",
    subject: "Happy Birthday from Wallly! 🎂",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🎂</span>
        <h2 style="color: #ec4899; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Happy Birthday!</h2>
        <p style="color: #ec4899; margin: 0;">Wishing you an amazing day</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">🎈 The entire Wallly team wishes you a very Happy Birthday! 🎈</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">May your day be filled with joy, laughter, and meaningful connections!</p>
      <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(219, 39, 119, 0.08) 100%); border: 1px solid rgba(236, 72, 153, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #ec4899; margin: 0; font-size: 20px; font-weight: 700;">🎁 Check your account for a special birthday surprise! 🎁</p>
      </div>
    `),
  },
];

const defaultBlogPost = {
  slug: "",
  title: "",
  meta_description: "",
  author: "Wallly Team",
  image_url: "/placeholder.svg",
  category: "General",
  content: "",
  is_published: false,
};

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState(defaultBlogPost);
  
  // Email state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [emailViewDialogOpen, setEmailViewDialogOpen] = useState(false);
  const [viewingEmail, setViewingEmail] = useState<EmailLog | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [pendingEmailRecipient, setPendingEmailRecipient] = useState<string>("");
  
  // Ban/Delete user state
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");
  const [previewingTemplate, setPreviewingTemplate] = useState<EmailTemplate | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdminRole = roles?.some((r: UserRole) => r.role === "admin");
    
    if (!hasAdminRole) {
      toast({
        title: "Access Denied",
        description: "You don't have admin access",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setCurrentAdminId(user.id);
    fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchReports(),
      fetchBlogPosts(),
      fetchCommunities(),
      fetchEmailLogs(),
    ]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profiles) {
      setUsers(profiles);
      
      const { data: allRoles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const rolesMap: Record<string, string> = {};
      allRoles?.forEach((r: { user_id: string; role: string }) => {
        rolesMap[r.user_id] = r.role;
      });
      setUserRoles(rolesMap);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const previousRole = userRoles[userId];
    
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role: newRole as "admin" | "premium_user" | "user" }]);

    if (error) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
      return;
    }

    const isPremium = newRole === "premium_user";
    await supabase.from("profiles").update({ is_premium: isPremium }).eq("id", userId);

    if (newRole === "premium_user" && previousRole !== "premium_user") {
      const user = users.find(u => u.id === userId);
      if (user?.email) {
        try {
          await sendPremiumUpgradeEmail(user.email, userId);
          toast({ title: "Success", description: "User upgraded to premium and notification email sent" });
        } catch {
          toast({ title: "Success", description: "User role updated (email notification failed)" });
        }
      }
    } else {
      toast({ title: "Success", description: "User role updated successfully" });
    }

    fetchUsers();
  };

  const fetchReports = async () => {
    const { data: reportsData, error } = await supabase
      .from("reports")
      .select(`*, reporter:reporter_id(email), reported:reported_user_id(email)`)
      .order("created_at", { ascending: false });

    if (!error) {
      const formattedReports = reportsData?.map((report: any) => ({
        ...report,
        reporter_email: report.reporter?.email || "Unknown",
        reported_email: report.reported?.email || "Unknown",
      })) || [];
      setReports(formattedReports);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    const { error } = await supabase.from("reports").update({ status: newStatus }).eq("id", reportId);
    if (!error) {
      toast({ title: "Success", description: "Report status updated" });
      fetchReports();
    }
  };

  const fetchBlogPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setBlogPosts(data || []);
  };

  const fetchCommunities = async () => {
    const { data } = await supabase.from("communities").select("*").order("created_at", { ascending: false });
    setCommunities(data || []);
  };

  const fetchEmailLogs = async () => {
    const { data } = await supabase.from("email_logs").select("*").order("created_at", { ascending: false }).limit(100);
    setEmailLogs(data || []);
  };

  const openBlogDialog = (blog?: BlogPost) => {
    if (blog) {
      setEditingBlog(blog);
      setBlogForm({
        slug: blog.slug,
        title: blog.title,
        meta_description: blog.meta_description,
        author: blog.author,
        image_url: blog.image_url,
        category: blog.category,
        content: blog.content,
        is_published: blog.is_published,
      });
    } else {
      setEditingBlog(null);
      setBlogForm(defaultBlogPost);
    }
    setBlogDialogOpen(true);
  };

  const saveBlogPost = async () => {
    if (!blogForm.slug || !blogForm.title || !blogForm.content) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const blogData = { ...blogForm, published_at: blogForm.is_published ? new Date().toISOString() : null };

    if (editingBlog) {
      const { error } = await supabase.from("blog_posts").update(blogData).eq("id", editingBlog.id);
      if (!error) toast({ title: "Success", description: "Blog post updated" });
    } else {
      const { error } = await supabase.from("blog_posts").insert([blogData]);
      if (!error) toast({ title: "Success", description: "Blog post created" });
    }

    setBlogDialogOpen(false);
    fetchBlogPosts();
  };

  const deleteBlogPost = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (!error) {
      toast({ title: "Success", description: "Blog post deleted" });
      fetchBlogPosts();
    }
  };

  const toggleBlogPublished = async (blog: BlogPost) => {
    const { error } = await supabase.from("blog_posts").update({ 
      is_published: !blog.is_published,
      published_at: !blog.is_published ? new Date().toISOString() : blog.published_at
    }).eq("id", blog.id);

    if (!error) {
      toast({ title: "Success", description: `Blog post ${!blog.is_published ? 'published' : 'unpublished'}` });
      fetchBlogPosts();
    }
  };

  const deleteCommunity = async (id: string) => {
    const { error } = await supabase.from("communities").delete().eq("id", id);
    if (!error) {
      toast({ title: "Success", description: "Community deleted" });
      fetchCommunities();
    }
  };

  // Email functions
  const handleSelectAllUsers = (checked: boolean) => {
    setSelectAllUsers(checked);
    setSelectedRecipients(checked ? users.map(u => u.email) : []);
  };

  const handleRecipientToggle = (email: string) => {
    setSelectedRecipients(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailContent(template.content);
    }
  };

  const sendBulkEmail = async () => {
    if (selectedRecipients.length === 0 || !emailSubject || !emailContent) {
      toast({ title: "Error", description: "Please select recipients and fill in subject/content", variant: "destructive" });
      return;
    }

    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-ses-email', {
        body: { to: selectedRecipients, subject: emailSubject, html: emailContent, templateUsed: selectedTemplate || null },
      });
      if (error) throw error;

      toast({ title: "Success", description: `Email sent to ${selectedRecipients.length} recipient(s)` });
      setEmailDialogOpen(false);
      setEmailSubject("");
      setEmailContent("");
      setSelectedRecipients([]);
      setSelectAllUsers(false);
      setSelectedTemplate("");
      fetchEmailLogs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send email", variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

  const sendEmailToUser = (email: string) => {
    setPendingEmailRecipient(email);
    setTemplatePickerOpen(true);
  };

  const selectTemplateAndOpenComposer = (templateId: string) => {
    handleTemplateSelect(templateId);
    setSelectedRecipients([pendingEmailRecipient]);
    setTemplatePickerOpen(false);
    setEmailDialogOpen(true);
  };

  const openCustomEmailComposer = () => {
    setSelectedRecipients([pendingEmailRecipient]);
    setEmailSubject("");
    setEmailContent("");
    setSelectedTemplate("");
    setTemplatePickerOpen(false);
    setEmailDialogOpen(true);
  };

  const viewEmailDetails = (email: EmailLog) => {
    setViewingEmail(email);
    setEmailViewDialogOpen(true);
  };

  // Ban user function
  const openBanDialog = (user: User) => {
    setSelectedUserForAction(user);
    setBanReason("");
    setBanDialogOpen(true);
  };

  const banUser = async () => {
    if (!selectedUserForAction) return;
    
    setActionLoading(true);
    try {
      // Send ban notification email first
      const banTemplate = emailTemplates.find(t => t.id === "account-banned");
      if (banTemplate) {
        const emailContent = banTemplate.content.replace("[BAN_REASON]", banReason || "Violation of community guidelines");
        await supabase.functions.invoke('send-ses-email', {
          body: { to: selectedUserForAction.email, subject: banTemplate.subject, html: emailContent, templateUsed: "account-banned" },
        });
      }

      // Use admin edge function to bypass RLS
      const { data, error } = await supabase.functions.invoke('admin-user-action', {
        body: { action: 'ban', userId: selectedUserForAction.id, banReason: banReason || "Violation of community guidelines" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "User Banned", description: `${selectedUserForAction.email} has been banned.` });
      setBanDialogOpen(false);
      setSelectedUserForAction(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Ban user error:", error);
      toast({ title: "Error", description: error.message || "Failed to ban user", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user function
  const openDeleteDialog = (user: User) => {
    setSelectedUserForAction(user);
    setDeleteDialogOpen(true);
  };

  const deleteUser = async () => {
    if (!selectedUserForAction) return;
    
    setActionLoading(true);
    try {
      // Send deletion notification email first
      const deleteTemplate = emailTemplates.find(t => t.id === "account-deleted");
      if (deleteTemplate) {
        await supabase.functions.invoke('send-ses-email', {
          body: { to: selectedUserForAction.email, subject: deleteTemplate.subject, html: deleteTemplate.content, templateUsed: "account-deleted" },
        });
      }

      // Use admin edge function to bypass RLS
      const { data, error } = await supabase.functions.invoke('admin-user-action', {
        body: { action: 'delete', userId: selectedUserForAction.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "User Deleted", description: `${selectedUserForAction.email} has been permanently deleted.` });
      setDeleteDialogOpen(false);
      setSelectedUserForAction(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast({ title: "Error", description: error.message || "Failed to delete user", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate stats for dashboard
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const dashboardStats = {
    totalUsers: users.length,
    premiumUsers: users.filter(u => u.is_premium).length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    totalReports: reports.length,
    blogPosts: blogPosts.length,
    publishedPosts: blogPosts.filter(b => b.is_published).length,
    communities: communities.length,
    emailsSent: emailLogs.length,
    newUsersToday: users.filter(u => u.created_at && new Date(u.created_at) >= today).length,
    activeUsersWeek: users.filter(u => u.created_at && new Date(u.created_at) >= weekAgo).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading admin panel...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard stats={dashboardStats} onNavigate={setActiveTab} />;
      case "analytics":
        return <AdminAnalytics />;
      case "health":
        return <AdminSystemHealth />;
      case "users":
        return (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users, roles, and subscriptions ({users.length} total)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="font-mono text-sm">{user.unique_id}</TableCell>
                      <TableCell>{user.age || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_premium ? "default" : "secondary"}>
                          {user.is_premium ? "Premium" : "Free"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{userRoles[user.id] || "user"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Select value={userRoles[user.id] || "user"} onValueChange={(value) => updateUserRole(user.id, value)}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="premium_user">Premium</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => sendEmailToUser(user.email)} title="Send email">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openBanDialog(user)} className="text-orange-500 hover:text-orange-600">
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)} className="text-destructive hover:text-destructive">
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case "leads":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Leads & Inquiries
              </CardTitle>
              <CardDescription>Manage premium inquiries and contact form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLeads adminId={currentAdminId} />
            </CardContent>
          </Card>
        );
      case "reports":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                User Reports
              </CardTitle>
              <CardDescription>Review and manage user reports ({reports.filter(r => r.status === 'pending').length} pending)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reported User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No reports found</TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-sm">{report.reporter_email}</TableCell>
                        <TableCell className="font-mono text-sm">{report.reported_email}</TableCell>
                        <TableCell><span className="capitalize">{report.reason.replace(/_/g, ' ')}</span></TableCell>
                        <TableCell>
                          <Badge variant={report.status === 'pending' ? 'destructive' : report.status === 'resolved' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select value={report.status} onValueChange={(value) => updateReportStatus(report.id, value)}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewing">Reviewing</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case "blogs":
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Blog Management</CardTitle>
                  <CardDescription>Create, edit, and manage blog posts ({blogPosts.length} total)</CardDescription>
                </div>
                <Button onClick={() => openBlogDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No blog posts found</TableCell>
                    </TableRow>
                  ) : (
                    blogPosts.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell className="max-w-xs truncate font-medium">{blog.title}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{blog.slug}</TableCell>
                        <TableCell><Badge variant="secondary">{blog.category}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={blog.is_published ? "default" : "outline"}>
                            {blog.is_published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => toggleBlogPublished(blog)}>
                              {blog.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openBlogDialog(blog)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteBlogPost(blog.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case "communities":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Community Management
              </CardTitle>
              <CardDescription>Manage communities ({communities.length} total)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No communities found</TableCell>
                    </TableRow>
                  ) : (
                    communities.map((community) => (
                      <TableRow key={community.id}>
                        <TableCell className="font-mono">{community.name}</TableCell>
                        <TableCell>{community.display_name}</TableCell>
                        <TableCell>{community.member_count}</TableCell>
                        <TableCell>{community.post_count}</TableCell>
                        <TableCell>{new Date(community.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/c/${community.name}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteCommunity(community.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case "email":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Email Management
                    </CardTitle>
                    <CardDescription>Send emails to your users</CardDescription>
                  </div>
                  <Button onClick={() => setEmailDialogOpen(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Compose Email
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {emailTemplates.map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{template.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setPreviewingTemplate(template)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => { handleTemplateSelect(template.id); setEmailDialogOpen(true); }}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Email History
                </CardTitle>
                <CardDescription>Track all emails sent ({emailLogs.length} total)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">No emails sent yet</TableCell>
                      </TableRow>
                    ) : (
                      emailLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="max-w-xs truncate font-medium">{log.subject}</TableCell>
                          <TableCell><Badge variant="secondary">{log.recipients.length} recipient{log.recipients.length > 1 ? 's' : ''}</Badge></TableCell>
                          <TableCell>
                            {log.template_used ? (
                              <Badge variant="outline">{emailTemplates.find(t => t.id === log.template_used)?.name || log.template_used}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Custom</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.status === 'sent' ? (
                              <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>
                            ) : (
                              <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => viewEmailDetails(log)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <AdminDashboard stats={dashboardStats} onNavigate={setActiveTab} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel - Wallly</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            pendingReportsCount={reports.filter(r => r.status === 'pending').length}
          />
          
          <SidebarInset className="flex-1">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <div className="flex-1" />
              <Badge variant="outline" className="text-xs">
                Admin: {users.find(u => u.id === currentAdminId)?.email || 'Loading...'}
              </Badge>
            </header>
            
            <main className="flex-1 p-6">
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Blog Dialog */}
      <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" value={blogForm.slug} onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description *</Label>
              <Textarea id="meta_description" value={blogForm.meta_description} onChange={(e) => setBlogForm({ ...blogForm, meta_description: e.target.value })} maxLength={160} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={blogForm.author} onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={blogForm.category} onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input id="image_url" value={blogForm.image_url} onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content * (HTML)</Label>
              <Textarea id="content" value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} className="min-h-[200px] font-mono text-sm" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="is_published" checked={blogForm.is_published} onCheckedChange={(checked) => setBlogForm({ ...blogForm, is_published: checked })} />
              <Label htmlFor="is_published">Publish immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveBlogPost}>{editingBlog ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Compose Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or write from scratch" />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipients ({selectedRecipients.length} selected)</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                <div className="flex items-center space-x-2 mb-3 pb-3 border-b">
                  <Checkbox id="select-all" checked={selectAllUsers} onCheckedChange={handleSelectAllUsers} />
                  <Label htmlFor="select-all" className="font-semibold">Select All Users ({users.length})</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox id={`user-${user.id}`} checked={selectedRecipients.includes(user.email)} onCheckedChange={() => handleRecipientToggle(user.email)} />
                      <Label htmlFor={`user-${user.id}`} className="text-sm truncate">{user.email}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject *</Label>
              <Input id="email-subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-content">Content * (HTML)</Label>
              <Textarea id="email-content" value={emailContent} onChange={(e) => setEmailContent(e.target.value)} className="min-h-[200px] font-mono text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={sendBulkEmail} disabled={sendingEmail}>
              {sendingEmail ? "Sending..." : <><Send className="h-4 w-4 mr-2" />Send Email</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email View Dialog */}
      <Dialog open={emailViewDialogOpen} onOpenChange={setEmailViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
          </DialogHeader>
          {viewingEmail && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium">{viewingEmail.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Recipients ({viewingEmail.recipients.length})</Label>
                <ScrollArea className="h-24 border rounded-md p-2 mt-1">
                  {viewingEmail.recipients.map((email, i) => <p key={i} className="text-sm">{email}</p>)}
                </ScrollArea>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  {viewingEmail.status === 'sent' ? (
                    <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>
                  ) : (
                    <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Picker Dialog */}
      <Dialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Choose Email Template
            </DialogTitle>
            <DialogDescription>Sending to: <span className="font-medium text-foreground">{pendingEmailRecipient}</span></DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {emailTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto py-6 px-4 flex flex-col items-center gap-3 hover:border-primary"
                  onClick={() => selectTemplateAndOpenComposer(template.id)}
                >
                  <div className="p-3 rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-sm">{template.name}</p>
                </Button>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <Button variant="ghost" className="w-full" onClick={openCustomEmailComposer}>
                <Plus className="h-4 w-4 mr-2" />
                Write Custom Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-500">
              <Ban className="h-5 w-5" />
              Ban User
            </DialogTitle>
            <DialogDescription>Are you sure you want to ban this user?</DialogDescription>
          </DialogHeader>
          {selectedUserForAction && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedUserForAction.email}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedUserForAction.unique_id}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="banReason">Reason for ban</Label>
                <Textarea id="banReason" value={banReason} onChange={(e) => setBanReason(e.target.value)} className="min-h-[100px]" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
            <Button variant="destructive" onClick={banUser} disabled={actionLoading} className="bg-orange-500 hover:bg-orange-600">
              {actionLoading ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <UserX className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>Are you sure you want to permanently delete this user?</DialogDescription>
          </DialogHeader>
          {selectedUserForAction && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedUserForAction.email}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedUserForAction.unique_id}</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-sm text-destructive">This action cannot be undone.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
            <Button variant="destructive" onClick={deleteUser} disabled={actionLoading}>
              {actionLoading ? "Deleting..." : "Delete User Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Template Preview Dialog */}
      <Dialog open={!!previewingTemplate} onOpenChange={(open) => !open && setPreviewingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Email Preview: {previewingTemplate?.name}
            </DialogTitle>
            <DialogDescription>Subject: {previewingTemplate?.subject}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-lg bg-white">
            {previewingTemplate && (
              <iframe
                srcDoc={previewingTemplate.content}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewingTemplate(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (previewingTemplate) {
                handleTemplateSelect(previewingTemplate.id);
                setPreviewingTemplate(null);
                setEmailDialogOpen(true);
              }
            }}>
              <Send className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
