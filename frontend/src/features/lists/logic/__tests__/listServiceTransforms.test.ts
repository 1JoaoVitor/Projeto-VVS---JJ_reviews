import { describe, expect, it } from "vitest";
import {
   applyLikedState,
   buildCollaboratorInsertData,
   buildInviteNotificationData,
   flattenCollaborativeListsResponse,
} from "../listServiceTransforms";

describe("listServiceTransforms", () => {
   it("flattens collaborative list rows with mixed shapes", () => {
      const result = flattenCollaborativeListsResponse([
         { lists: { id: "a" } as never },
         { lists: [{ id: "b" } as never, { id: "c" } as never] },
         { lists: null },
      ]);

      expect(result).toEqual([{ id: "a" }, { id: "b" }, { id: "c" }]);
   });

   it("returns an empty array for empty collaborative rows", () => {
      expect(flattenCollaborativeListsResponse(null)).toEqual([]);
      expect(flattenCollaborativeListsResponse(undefined)).toEqual([]);
   });

   it("applies liked state from a list of ids", () => {
      const result = applyLikedState([
         { id: "a", name: "Lista A" },
         { id: "b", name: "Lista B" },
      ], ["b"]);

      expect(result).toEqual([
         { id: "a", name: "Lista A", is_liked: false },
         { id: "b", name: "Lista B", is_liked: true },
      ]);
   });

   it("keeps liked state false when no ids match", () => {
      expect(applyLikedState([{ id: "a", name: "Lista A" }], [])).toEqual([
         { id: "a", name: "Lista A", is_liked: false },
      ]);
   });

   it("builds collaborator payloads with the expected role and status", () => {
      expect(buildCollaboratorInsertData("l1", ["u2", "u3"])).toEqual([
         { list_id: "l1", user_id: "u2", role: "member", status: "pending" },
         { list_id: "l1", user_id: "u3", role: "member", status: "pending" },
      ]);
   });

   it("returns no collaborator payloads for an empty list", () => {
      expect(buildCollaboratorInsertData("l1", [])).toEqual([]);
   });

   it("builds notifications only for shared lists", () => {
      expect(buildInviteNotificationData("u1", "l1", "private", ["u2"])).toEqual([]);

      expect(buildInviteNotificationData("u1", "l1", "partial_shared", ["u2"])).toEqual([
         {
            user_id: "u2",
            sender_id: "u1",
            type: "list_invite",
            message: "convidou você para uma Lista Colaborativa!",
            reference_id: "l1",
         },
      ]);

      expect(buildInviteNotificationData("u1", "l1", "full_shared", ["u2"])).toEqual([
         {
            user_id: "u2",
            sender_id: "u1",
            type: "list_invite",
            message: "convidou você para uma Lista Unificada!",
            reference_id: "l1",
         },
      ]);

      expect(buildInviteNotificationData("u1", "l1", "full_shared", ["u2", "u3"])).toEqual([
         {
            user_id: "u2",
            sender_id: "u1",
            type: "list_invite",
            message: "convidou você para uma Lista Unificada!",
            reference_id: "l1",
         },
         {
            user_id: "u3",
            sender_id: "u1",
            type: "list_invite",
            message: "convidou você para uma Lista Unificada!",
            reference_id: "l1",
         },
      ]);
   });

   it("returns an empty notification list when there are no collaborators", () => {
      expect(buildInviteNotificationData("u1", "l1", "full_shared", [])).toEqual([]);
   });
});