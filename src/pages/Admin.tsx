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
import { AlertTriangle, Home, Plus, Pencil, Trash2, Eye, EyeOff, Users, FileText, Flag, Settings, Mail, Send, Clock, CheckCircle, XCircle, Ban, UserX } from "lucide-react";
import { sendPremiumUpgradeEmail } from "@/utils/emailNotifications";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface User {
  id: string;
  email: string;
  unique_id: string;
  is_premium: boolean;
  age: number | null;
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
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ <strong>Premium</strong> — Unlock priority matching & more</p>
      </div>
      <p style="color: #64748b; font-size: 13px; text-align: center;">Questions? Just reply to this email — we're always here to help!</p>
    `),
  },
  {
    id: "password-reset",
    name: "Password Reset",
    subject: "Reset Your Wallly Password 🔑",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">🔑</span>
        <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Reset Your Password</h2>
        <p style="color: #94a3b8; margin: 0;">No worries, we've got you covered!</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">We received a request to reset the password for your Wallly account.</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">If you didn't make this request, you can safely ignore this email.</p>
      <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent); margin: 30px 0;"></div>
      <p style="color: #64748b; font-size: 13px; text-align: center;">This link expires in 1 hour. Didn't request this? You can safely ignore this email.</p>
    `),
  },
  {
    id: "notification",
    name: "General Notification",
    subject: "Important Update from Wallly 📢",
    content: emailTemplateWrapper(`
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; display: block; margin-bottom: 16px;">📢</span>
        <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 8px; font-weight: 700;">Important Update</h2>
        <p style="color: #94a3b8; margin: 0;">We have something to share with you</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Hey there! 👋</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">We have an important update to share with you.</p>
      <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <p style="color: #a5b4fc; margin: 0;">[Your message here]</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Thank you for being part of Wallly!</p>
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
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Congratulations! 🎉</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">You've upgraded to Wallly Premium! Enjoy all the exclusive perks:</p>
      <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #fbbf24; margin: 0 0 16px; font-size: 17px; font-weight: 700;">✨ Your Premium Benefits:</h3>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ <strong>Priority Matching</strong> — Get matched faster</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ <strong>Premium Badge</strong> — Stand out from the crowd</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ <strong>Ad-Free Experience</strong> — No interruptions</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ <strong>Advanced Filters</strong> — Find exactly who you want</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ <strong>Unlimited Connections</strong> — No daily limits</p>
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
      <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #fca5a5; margin: 0 0 12px; font-weight: 700;">⚠️ Community Guidelines Violation</h3>
        <p style="color: #fecaca; margin: 0;">We've detected activity on your account that may violate our community guidelines.</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;"><strong>Details:</strong> [Specify the violation here]</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Please review our community guidelines and ensure your future interactions comply with our policies.</p>
      <p style="color: #fca5a5; line-height: 1.8; margin: 0 0 18px;"><strong>Continued violations may result in account suspension or termination.</strong></p>
      <p style="color: #64748b; font-size: 13px; text-align: center;">Believe this was sent in error? Contact our support team.</p>
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
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Hey there! 👋</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Here's what's happening at Wallly this week:</p>
      <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #a5b4fc; margin: 0 0 16px; font-size: 17px; font-weight: 700;">🚀 What's New</h3>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Improved video chat quality</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ New community features</p>
        <p style="color: #94a3b8; margin: 8px 0; font-size: 14px;">✦ Enhanced matching algorithm</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">Thanks for being part of our community!</p>
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
      <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #fca5a5; margin: 0 0 12px; font-weight: 700;">🚫 Account Banned</h3>
        <p style="color: #fecaca; margin: 0;">Your Wallly account has been suspended due to violations of our community guidelines.</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;"><strong>Reason:</strong> [BAN_REASON]</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">This means you will no longer be able to access your account or use Wallly services.</p>
      <p style="color: #64748b; font-size: 13px; text-align: center;">If you believe this was a mistake, please contact our support team.</p>
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
      <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #fca5a5; margin: 0 0 12px; font-weight: 700;">Account Permanently Deleted</h3>
        <p style="color: #fecaca; margin: 0;">Your Wallly account and all associated data have been permanently deleted by an administrator.</p>
      </div>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">All your connections, messages, and profile information have been removed from our system.</p>
      <p style="color: #cbd5e1; line-height: 1.8; margin: 0 0 18px;">We're sorry to see you go. If you'd like to rejoin Wallly in the future, you're welcome to create a new account.</p>
      <p style="color: #64748b; font-size: 13px; text-align: center;">If you have any questions, please contact our support team.</p>
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
    // Get user's current role to check if upgrading to premium
    const previousRole = userRoles[userId];
    
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role: newRole as "admin" | "premium_user" | "user" }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
      return;
    }

    const isPremium = newRole === "premium_user";
    await supabase
      .from("profiles")
      .update({ is_premium: isPremium })
      .eq("id", userId);

    // Send premium upgrade email if user was upgraded to premium
    if (newRole === "premium_user" && previousRole !== "premium_user") {
      const user = users.find(u => u.id === userId);
      if (user?.email) {
        try {
          await sendPremiumUpgradeEmail(user.email, userId);
          toast({
            title: "Success",
            description: "User upgraded to premium and notification email sent",
          });
        } catch (emailError) {
          console.error("Failed to send premium upgrade email:", emailError);
          toast({
            title: "Success",
            description: "User role updated (email notification failed)",
          });
        }
      }
    } else {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    }

    fetchUsers();
  };

  const fetchReports = async () => {
    const { data: reportsData, error } = await supabase
      .from("reports")
      .select(`
        *,
        reporter:reporter_id(email),
        reported:reported_user_id(email)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      return;
    }

    const formattedReports = reportsData?.map((report: any) => ({
      ...report,
      reporter_email: report.reporter?.email || "Unknown",
      reported_email: report.reported?.email || "Unknown",
    })) || [];

    setReports(formattedReports);
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", reportId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Report status updated",
    });

    fetchReports();
  };

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error);
      return;
    }

    setBlogPosts(data || []);
  };

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching communities:", error);
      return;
    }

    setCommunities(data || []);
  };

  const fetchEmailLogs = async () => {
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching email logs:", error);
      return;
    }

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
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const blogData = {
      ...blogForm,
      published_at: blogForm.is_published ? new Date().toISOString() : null,
    };

    if (editingBlog) {
      const { error } = await supabase
        .from("blog_posts")
        .update(blogData)
        .eq("id", editingBlog.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update blog post",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Success", description: "Blog post updated" });
    } else {
      const { error } = await supabase
        .from("blog_posts")
        .insert([blogData]);

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to create blog post",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Success", description: "Blog post created" });
    }

    setBlogDialogOpen(false);
    fetchBlogPosts();
  };

  const deleteBlogPost = async (id: string) => {
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Blog post deleted" });
    fetchBlogPosts();
  };

  const toggleBlogPublished = async (blog: BlogPost) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ 
        is_published: !blog.is_published,
        published_at: !blog.is_published ? new Date().toISOString() : blog.published_at
      })
      .eq("id", blog.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update blog status",
        variant: "destructive",
      });
      return;
    }

    toast({ 
      title: "Success", 
      description: `Blog post ${!blog.is_published ? 'published' : 'unpublished'}` 
    });
    fetchBlogPosts();
  };

  const deleteCommunity = async (id: string) => {
    const { error } = await supabase
      .from("communities")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete community",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Community deleted" });
    fetchCommunities();
  };

  // Email functions
  const handleSelectAllUsers = (checked: boolean) => {
    setSelectAllUsers(checked);
    if (checked) {
      setSelectedRecipients(users.map(u => u.email));
    } else {
      setSelectedRecipients([]);
    }
  };

  const handleRecipientToggle = (email: string) => {
    setSelectedRecipients(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
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
    if (selectedRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    if (!emailSubject || !emailContent) {
      toast({
        title: "Error",
        description: "Please fill in subject and content",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-ses-email', {
        body: {
          to: selectedRecipients,
          subject: emailSubject,
          html: emailContent,
          templateUsed: selectedTemplate || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Email sent to ${selectedRecipients.length} recipient(s)`,
      });

      setEmailDialogOpen(false);
      setEmailSubject("");
      setEmailContent("");
      setSelectedRecipients([]);
      setSelectAllUsers(false);
      setSelectedTemplate("");
      fetchEmailLogs();
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
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
          body: {
            to: selectedUserForAction.email,
            subject: banTemplate.subject,
            html: emailContent,
            templateUsed: "account-banned",
          },
        });
      }

      // Delete user's data (this effectively bans them)
      // Delete connections
      await supabase.from("connections").delete().eq("user_id", selectedUserForAction.id);
      await supabase.from("connections").delete().eq("connected_user_id", selectedUserForAction.id);
      
      // Delete connection requests
      await supabase.from("connection_requests").delete().eq("from_user_id", selectedUserForAction.id);
      await supabase.from("connection_requests").delete().eq("to_user_id", selectedUserForAction.id);
      
      // Delete messages
      await supabase.from("messages").delete().eq("sender_id", selectedUserForAction.id);
      await supabase.from("messages").delete().eq("receiver_id", selectedUserForAction.id);
      
      // Delete user interests
      await supabase.from("user_interests").delete().eq("user_id", selectedUserForAction.id);
      
      // Delete matchmaking queue entries
      await supabase.from("matchmaking_queue").delete().eq("user_id", selectedUserForAction.id);
      
      // Delete community memberships
      await supabase.from("community_members").delete().eq("user_id", selectedUserForAction.id);
      
      // Update profile to mark as banned (we keep profile for record)
      await supabase.from("profiles").update({ 
        name: "[BANNED]",
        age: null,
        gender: null 
      }).eq("id", selectedUserForAction.id);

      toast({
        title: "User Banned",
        description: `${selectedUserForAction.email} has been banned and notified via email.`,
      });

      setBanDialogOpen(false);
      setSelectedUserForAction(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error banning user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
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
          body: {
            to: selectedUserForAction.email,
            subject: deleteTemplate.subject,
            html: deleteTemplate.content,
            templateUsed: "account-deleted",
          },
        });
      }

      // Delete all user data
      // Delete connections
      await supabase.from("connections").delete().eq("user_id", selectedUserForAction.id);
      await supabase.from("connections").delete().eq("connected_user_id", selectedUserForAction.id);
      
      // Delete connection requests
      await supabase.from("connection_requests").delete().eq("from_user_id", selectedUserForAction.id);
      await supabase.from("connection_requests").delete().eq("to_user_id", selectedUserForAction.id);
      
      // Delete messages
      await supabase.from("messages").delete().eq("sender_id", selectedUserForAction.id);
      await supabase.from("messages").delete().eq("receiver_id", selectedUserForAction.id);
      
      // Delete user interests
      await supabase.from("user_interests").delete().eq("user_id", selectedUserForAction.id);
      
      // Delete matchmaking queue entries
      await supabase.from("matchmaking_queue").delete().eq("user_id", selectedUserForAction.id);
      
      // Delete community memberships
      await supabase.from("community_members").delete().eq("user_id", selectedUserForAction.id);
      
      // Delete user roles
      await supabase.from("user_roles").delete().eq("user_id", selectedUserForAction.id);
      
      // Delete profile
      await supabase.from("profiles").delete().eq("id", selectedUserForAction.id);

      toast({
        title: "User Deleted",
        description: `${selectedUserForAction.email} has been permanently deleted and notified via email.`,
      });

      setDeleteDialogOpen(false);
      setSelectedUserForAction(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Wallly</title>
        <meta name="description" content="Wallly admin panel for managing users, reports, blogs, and communities." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Admin Panel</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-4xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">Full control over users, reports, blogs, and communities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Flag className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</p>
                    <p className="text-sm text-muted-foreground">Pending Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">{blogPosts.length}</p>
                    <p className="text-sm text-muted-foreground">Blog Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Settings className="h-8 w-8 text-secondary-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{communities.length}</p>
                    <p className="text-sm text-muted-foreground">Communities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Mail className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{emailLogs.length}</p>
                    <p className="text-sm text-muted-foreground">Emails Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-3xl">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Reports
                {reports.filter(r => r.status === 'pending').length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {reports.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="blogs" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Blogs
              </TabsTrigger>
              <TabsTrigger value="communities" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Communities
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Update user roles and subscription status</CardDescription>
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
                            <span className={user.is_premium ? "text-accent font-semibold" : "text-muted-foreground"}>
                              {user.is_premium ? "Yes" : "No"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{userRoles[user.id] || "user"}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Select
                                value={userRoles[user.id] || "user"}
                                onValueChange={(value) => updateUserRole(user.id, value)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="premium_user">Premium User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => sendEmailToUser(user.email)}
                                title="Send email"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openBanDialog(user)}
                                title="Ban user"
                                className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(user)}
                                title="Delete user"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
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
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    User Reports
                  </CardTitle>
                  <CardDescription>Review and manage user reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Reported User</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No reports found
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-mono text-sm">{report.reporter_email}</TableCell>
                            <TableCell className="font-mono text-sm">{report.reported_email}</TableCell>
                            <TableCell>
                              <span className="capitalize">{report.reason.replace(/_/g, ' ')}</span>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {report.details || "No additional details"}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  report.status === 'pending' ? 'destructive' : 
                                  report.status === 'resolved' ? 'default' : 
                                  'secondary'
                                }
                              >
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(report.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={report.status}
                                onValueChange={(value) => updateReportStatus(report.id, value)}
                              >
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
            </TabsContent>

            {/* Blogs Tab */}
            <TabsContent value="blogs">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Blog Management</CardTitle>
                      <CardDescription>Create, edit, and manage blog posts</CardDescription>
                    </div>
                    <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => openBlogDialog()}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
                          <DialogDescription>
                            Fill in the details for your blog post
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title *</Label>
                              <Input
                                id="title"
                                value={blogForm.title}
                                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                                placeholder="Blog post title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="slug">Slug *</Label>
                              <Input
                                id="slug"
                                value={blogForm.slug}
                                onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                placeholder="url-friendly-slug"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="meta_description">Meta Description *</Label>
                            <Textarea
                              id="meta_description"
                              value={blogForm.meta_description}
                              onChange={(e) => setBlogForm({ ...blogForm, meta_description: e.target.value })}
                              placeholder="SEO description (max 160 characters)"
                              maxLength={160}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="author">Author</Label>
                              <Input
                                id="author"
                                value={blogForm.author}
                                onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category">Category</Label>
                              <Input
                                id="category"
                                value={blogForm.category}
                                onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="image_url">Image URL</Label>
                              <Input
                                id="image_url"
                                value={blogForm.image_url}
                                onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content">Content * (HTML supported)</Label>
                            <Textarea
                              id="content"
                              value={blogForm.content}
                              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                              placeholder="<h2>Introduction</h2><p>Your content here...</p>"
                              className="min-h-[200px] font-mono text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_published"
                              checked={blogForm.is_published}
                              onCheckedChange={(checked) => setBlogForm({ ...blogForm, is_published: checked })}
                            />
                            <Label htmlFor="is_published">Publish immediately</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={saveBlogPost}>
                            {editingBlog ? "Update" : "Create"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No blog posts found. Create your first post!
                          </TableCell>
                        </TableRow>
                      ) : (
                        blogPosts.map((blog) => (
                          <TableRow key={blog.id}>
                            <TableCell className="max-w-xs truncate font-medium">
                              {blog.title}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              {blog.slug}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{blog.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={blog.is_published ? "default" : "outline"}>
                                {blog.is_published ? "Published" : "Draft"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(blog.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleBlogPublished(blog)}
                                  title={blog.is_published ? "Unpublish" : "Publish"}
                                >
                                  {blog.is_published ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openBlogDialog(blog)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteBlogPost(blog.id)}
                                  className="text-destructive hover:text-destructive"
                                >
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
            </TabsContent>

            {/* Communities Tab */}
            <TabsContent value="communities">
              <Card>
                <CardHeader>
                  <CardTitle>Community Management</CardTitle>
                  <CardDescription>Manage and moderate communities</CardDescription>
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
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No communities found
                          </TableCell>
                        </TableRow>
                      ) : (
                        communities.map((community) => (
                          <TableRow key={community.id}>
                            <TableCell className="font-mono">{community.name}</TableCell>
                            <TableCell>{community.display_name}</TableCell>
                            <TableCell>{community.member_count}</TableCell>
                            <TableCell>{community.post_count}</TableCell>
                            <TableCell>
                              {new Date(community.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/c/${community.name}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteCommunity(community.id)}
                                  className="text-destructive hover:text-destructive"
                                >
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
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email">
              <div className="space-y-6">
                {/* Compose Email Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Email Management
                        </CardTitle>
                        <CardDescription>Send emails to your users via Amazon SES</CardDescription>
                      </div>
                      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Send className="h-4 w-4 mr-2" />
                            Compose Email
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Compose Email</DialogTitle>
                            <DialogDescription>
                              Send an email to selected users
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            {/* Template Selection */}
                            <div className="space-y-2">
                              <Label>Email Template (Optional)</Label>
                              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a template or write from scratch" />
                                </SelectTrigger>
                                <SelectContent>
                                  {emailTemplates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Recipients */}
                            <div className="space-y-2">
                              <Label>Recipients ({selectedRecipients.length} selected)</Label>
                              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                                <div className="flex items-center space-x-2 mb-3 pb-3 border-b">
                                  <Checkbox
                                    id="select-all"
                                    checked={selectAllUsers}
                                    onCheckedChange={handleSelectAllUsers}
                                  />
                                  <Label htmlFor="select-all" className="font-semibold">
                                    Select All Users ({users.length})
                                  </Label>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {users.map((user) => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`user-${user.id}`}
                                        checked={selectedRecipients.includes(user.email)}
                                        onCheckedChange={() => handleRecipientToggle(user.email)}
                                      />
                                      <Label htmlFor={`user-${user.id}`} className="text-sm truncate">
                                        {user.email}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                              <Label htmlFor="email-subject">Subject *</Label>
                              <Input
                                id="email-subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Email subject"
                              />
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                              <Label htmlFor="email-content">Content * (HTML supported)</Label>
                              <Textarea
                                id="email-content"
                                value={emailContent}
                                onChange={(e) => setEmailContent(e.target.value)}
                                placeholder="<h1>Hello!</h1><p>Your message here...</p>"
                                className="min-h-[250px] font-mono text-sm"
                              />
                            </div>

                            {/* Preview */}
                            {emailContent && (
                              <div className="space-y-2">
                                <Label>Preview</Label>
                                <div 
                                  className="border rounded-md p-4 bg-white text-black max-h-48 overflow-y-auto"
                                  dangerouslySetInnerHTML={{ __html: emailContent }}
                                />
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={sendBulkEmail} disabled={sendingEmail}>
                              {sendingEmail ? (
                                <>Sending...</>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Email
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Quick Templates */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Quick Templates</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {emailTemplates.map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            className="h-auto py-3 px-4 flex flex-col items-center gap-2"
                            onClick={() => {
                              handleTemplateSelect(template.id);
                              setEmailDialogOpen(true);
                            }}
                          >
                            <Mail className="h-5 w-5" />
                            <span className="text-xs text-center">{template.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email History Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Email History
                    </CardTitle>
                    <CardDescription>Track all emails sent from the admin panel</CardDescription>
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
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              No emails sent yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          emailLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="max-w-xs truncate font-medium">
                                {log.subject}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {log.recipients.length} recipient{log.recipients.length > 1 ? 's' : ''}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {log.template_used ? (
                                  <Badge variant="outline">
                                    {emailTemplates.find(t => t.id === log.template_used)?.name || log.template_used}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Custom</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {log.status === 'sent' ? (
                                  <Badge variant="default" className="bg-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Sent
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Failed
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(log.created_at).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => viewEmailDetails(log)}
                                >
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Email View Dialog */}
      <Dialog open={emailViewDialogOpen} onOpenChange={setEmailViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              Sent on {viewingEmail && new Date(viewingEmail.created_at).toLocaleString()}
            </DialogDescription>
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
                  <div className="space-y-1">
                    {viewingEmail.recipients.map((email, i) => (
                      <p key={i} className="text-sm">{email}</p>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  {viewingEmail.status === 'sent' ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Sent
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
              {viewingEmail.message_id && (
                <div>
                  <Label className="text-muted-foreground">Message ID</Label>
                  <p className="font-mono text-sm">{viewingEmail.message_id}</p>
                </div>
              )}
              {viewingEmail.error_message && (
                <div>
                  <Label className="text-muted-foreground text-destructive">Error</Label>
                  <p className="text-sm text-destructive">{viewingEmail.error_message}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Content Preview</Label>
                <div 
                  className="border rounded-md p-4 bg-white text-black mt-1 max-h-64 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: viewingEmail.content }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailViewDialogOpen(false)}>
              Close
            </Button>
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
            <DialogDescription>
              Sending to: <span className="font-medium text-foreground">{pendingEmailRecipient}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {emailTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto py-6 px-4 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={() => selectTemplateAndOpenComposer(template.id)}
                >
                  <div className="p-3 rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.subject}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={openCustomEmailComposer}
              >
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
            <DialogDescription>
              Are you sure you want to ban this user? They will be notified via email.
            </DialogDescription>
          </DialogHeader>
          {selectedUserForAction && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedUserForAction.email}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedUserForAction.unique_id}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="banReason">Reason for ban</Label>
                <Textarea
                  id="banReason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Explain why this user is being banned..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <p className="text-sm text-orange-500">
                  <strong>Warning:</strong> Banning will remove all user data (connections, messages, etc.) and mark the account as banned.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={banUser} 
              disabled={actionLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
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
            <DialogDescription>
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUserForAction && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedUserForAction.email}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedUserForAction.unique_id}</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-sm text-destructive">
                  <strong>Warning:</strong> This will permanently delete all user data including their profile, connections, messages, and account. The user will be notified via email.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteUser} 
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete User Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
