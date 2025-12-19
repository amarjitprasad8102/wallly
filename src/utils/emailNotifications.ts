import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 
  | "welcome"
  | "connection_request"
  | "connection_accepted"
  | "new_message"
  | "premium_upgrade"
  | "account_warning"
  | "community_join"
  | "newsletter";

interface NotificationParams {
  userName?: string;
  connectionName?: string;
  communityName?: string;
  customMessage?: string;
}

interface SendNotificationOptions {
  type: NotificationType;
  recipientEmail: string;
  recipientUserId?: string;
  params?: NotificationParams;
}

export const sendNotificationEmail = async (options: SendNotificationOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: options,
    });

    if (error) {
      console.error('Error sending notification email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error sending notification email:', err);
    return { success: false, error: err.message };
  }
};

// Helper to send welcome email after signup
export const sendWelcomeEmail = async (email: string, userId?: string, userName?: string) => {
  return sendNotificationEmail({
    type: 'welcome',
    recipientEmail: email,
    recipientUserId: userId,
    params: { userName },
  });
};

// Helper to send connection request notification
export const sendConnectionRequestEmail = async (
  recipientEmail: string, 
  recipientUserId: string, 
  senderName?: string
) => {
  return sendNotificationEmail({
    type: 'connection_request',
    recipientEmail,
    recipientUserId,
    params: { connectionName: senderName },
  });
};

// Helper to send connection accepted notification
export const sendConnectionAcceptedEmail = async (
  recipientEmail: string, 
  recipientUserId: string, 
  accepterName?: string
) => {
  return sendNotificationEmail({
    type: 'connection_accepted',
    recipientEmail,
    recipientUserId,
    params: { connectionName: accepterName },
  });
};

// Helper to send new message notification
export const sendNewMessageEmail = async (
  recipientEmail: string, 
  recipientUserId: string, 
  senderName?: string
) => {
  return sendNotificationEmail({
    type: 'new_message',
    recipientEmail,
    recipientUserId,
    params: { connectionName: senderName },
  });
};

// Helper to send premium upgrade notification
export const sendPremiumUpgradeEmail = async (
  email: string, 
  userId: string, 
  userName?: string
) => {
  return sendNotificationEmail({
    type: 'premium_upgrade',
    recipientEmail: email,
    recipientUserId: userId,
    params: { userName },
  });
};

// Helper to send community join notification
export const sendCommunityJoinEmail = async (
  email: string, 
  userId: string, 
  communityName: string, 
  userName?: string
) => {
  return sendNotificationEmail({
    type: 'community_join',
    recipientEmail: email,
    recipientUserId: userId,
    params: { userName, communityName },
  });
};
