import type { RawNotification } from "./notificationOperations";

export function normalizeRecentNotifications(rows: RawNotification[] | null | undefined): RawNotification[] {
   return rows || [];
}

export function buildNotificationsChannelName(): string {
   return "realtime:notifications";
}

export function buildMarkAllNotificationsReadPayload(): { is_read: true } {
   return { is_read: true };
}