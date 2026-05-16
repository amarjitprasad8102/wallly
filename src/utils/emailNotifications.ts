import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
  | "welcome"
  | "connection_request"
  | "connection_accepted"
  | "premium_upgrade"
  | "community_join";

const TEMPLATE_MAP: Record<NotificationType, string> = {
  welcome: "welcome",
  connection_request: "connection-request",
  connection_accepted: "connection-accepted",
  premium_upgrade: "premium-upgrade",
  community_join: "community-join",
};

interface NotificationParams {
  userName?: string;
  connectionName?: string;
  communityName?: string;
}

interface SendOptions {
  type: NotificationType;
  recipientEmail: string;
  recipientUserId?: string;
  params?: NotificationParams;
}

export const sendNotificationEmail = async (opts: SendOptions) => {
  try {
    const idKey = `${opts.type}-${opts.recipientUserId ?? opts.recipientEmail}-${Date.now()}`;
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: TEMPLATE_MAP[opts.type],
        recipientEmail: opts.recipientEmail,
        idempotencyKey: idKey,
        templateData: opts.params ?? {},
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

export const sendWelcomeEmail = (email: string, userId?: string, userName?: string) =>
  sendNotificationEmail({ type: "welcome", recipientEmail: email, recipientUserId: userId, params: { userName } });

export const sendConnectionRequestEmail = (recipientEmail: string, recipientUserId: string, senderName?: string) =>
  sendNotificationEmail({ type: "connection_request", recipientEmail, recipientUserId, params: { connectionName: senderName } });

export const sendConnectionAcceptedEmail = (recipientEmail: string, recipientUserId: string, accepterName?: string) =>
  sendNotificationEmail({ type: "connection_accepted", recipientEmail, recipientUserId, params: { connectionName: accepterName } });

export const sendPremiumUpgradeEmail = (email: string, userId: string, userName?: string) =>
  sendNotificationEmail({ type: "premium_upgrade", recipientEmail: email, recipientUserId: userId, params: { userName } });

export const sendCommunityJoinEmail = (email: string, userId: string, communityName: string, userName?: string) =>
  sendNotificationEmail({ type: "community_join", recipientEmail: email, recipientUserId: userId, params: { userName, communityName } });

// Removed: sendNewMessageEmail (was unused or moved to push)
export const sendNewMessageEmail = sendConnectionRequestEmail;
