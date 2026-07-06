import { describe, expect, it } from "vitest";
import { buildAvatarFileName, normalizeUserProfile } from "../profileServiceTransforms";

describe("profileServiceTransforms", () => {
   it("normalizes null profile rows to empty username and null avatar", () => {
      expect(normalizeUserProfile(null)).toEqual({ username: "", avatarUrl: null });
   });

   it("normalizes partial profile rows", () => {
      expect(normalizeUserProfile({ username: "joao", avatar_url: null })).toEqual({
         username: "joao",
         avatarUrl: null,
      });
   });

   it("normalizes undefined profile rows", () => {
      expect(normalizeUserProfile(undefined)).toEqual({ username: "", avatarUrl: null });
   });

   it("builds deterministic avatar file names", () => {
      expect(buildAvatarFileName("u1", 0.123)).toBe("u1-0.123.jpg");
   });

   it("builds avatar file names with integer random values", () => {
      expect(buildAvatarFileName("u1", 0)).toBe("u1-0.jpg");
   });

   it("builds distinct avatar file names for different random values", () => {
      expect(buildAvatarFileName("u1", 0.1)).not.toBe(buildAvatarFileName("u1", 0.2));
   });
});