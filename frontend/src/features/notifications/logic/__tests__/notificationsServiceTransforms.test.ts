import { describe, expect, it } from "vitest";
import {
   buildMarkAllNotificationsReadPayload,
   buildNotificationsChannelName,
   normalizeRecentNotifications,
} from "../notificationsServiceTransforms";

describe("notificationsServiceTransforms", () => {
   it("normalizes empty notification rows to an empty array", () => {
      expect(normalizeRecentNotifications(null)).toEqual([]);
      expect(normalizeRecentNotifications(undefined)).toEqual([]);
   });

   it("returns existing notification rows unchanged", () => {
      const rows = [{ id: "n1" } as never];
      expect(normalizeRecentNotifications(rows)).toBe(rows);
   });

   it("builds the realtime channel name and mark-read payload", () => {
      expect(buildNotificationsChannelName()).toBe("realtime:notifications");
      expect(buildMarkAllNotificationsReadPayload()).toEqual({ is_read: true });
   });
});