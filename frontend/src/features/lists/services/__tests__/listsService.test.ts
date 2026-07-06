import { beforeEach, describe, expect, it, vi } from "vitest";

const {
   fromMock,
   channelMock,
   removeChannelMock,
   selectMock,
   eqMock,
   inMock,
   matchMock,
   maybeSingleMock,
   insertMock,
   singleMock,
   subscribeMock,
   onMock,
} = vi.hoisted(() => ({
   fromMock: vi.fn(),
   channelMock: vi.fn(),
   removeChannelMock: vi.fn(),
   selectMock: vi.fn(),
   eqMock: vi.fn(),
   inMock: vi.fn(),
   matchMock: vi.fn(),
   maybeSingleMock: vi.fn(),
   insertMock: vi.fn(),
   singleMock: vi.fn(),
   subscribeMock: vi.fn(),
   onMock: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
   supabase: {
      from: fromMock,
      channel: channelMock,
      removeChannel: removeChannelMock,
   },
}));

import {
   addCollaboratorsToList,
   fetchCollaborativeLists,
   fetchListMovieIds,
   fetchOwnedLists,
   fetchPrivateListReviews,
   fetchSharedListReviews,
   listMovieExists,
   notifyListCollaborators,
   subscribeListDetailsChanges,
   subscribeListsChanges,
} from "../listsService";

describe("listsService", () => {
   beforeEach(() => {
      vi.clearAllMocks();

      selectMock.mockReturnValue({ eq: eqMock, match: matchMock });
      eqMock.mockReturnValue({ in: inMock, single: singleMock });
      matchMock.mockReturnValue({ maybeSingle: maybeSingleMock });
      inMock.mockResolvedValue({ data: [], error: null });
      insertMock.mockReturnValue({ select: () => ({ single: singleMock }) });

      onMock.mockReturnThis();
      subscribeMock.mockReturnValue({ id: "channel-id" });
      channelMock.mockReturnValue({ on: onMock, subscribe: subscribeMock });

      fromMock.mockReturnValue({
         select: selectMock,
         match: matchMock,
         insert: insertMock,
      });
   });

   it("fetches owned lists and applies likes", async () => {
      const listsEqMock = vi.fn().mockResolvedValue({ data: [{ id: "l1" }, { id: "l2" }], error: null });
      const listsSelectMock = vi.fn().mockReturnValue({ eq: listsEqMock });

      const likesInMock = vi.fn().mockResolvedValue({ data: [{ list_id: "l2" }], error: null });
      const likesEqMock = vi.fn().mockReturnValue({ in: likesInMock });
      const likesSelectMock = vi.fn().mockReturnValue({ eq: likesEqMock });

      fromMock.mockImplementation((table: string) => {
         if (table === "lists") return { select: listsSelectMock };
         if (table === "list_likes") return { select: likesSelectMock };
         return { select: selectMock, match: matchMock, insert: insertMock };
      });

      const result = await fetchOwnedLists("u1", "current-user");

      expect(result).toEqual([
         { id: "l1", is_liked: false },
         { id: "l2", is_liked: true },
      ]);
   });

   it("fetches collaborative lists and applies likes", async () => {
      const collabInMock = vi.fn().mockResolvedValue({ data: [{ lists: { id: "a" } }, { lists: { id: "b" } }], error: null });
      const collabEqMock = vi.fn().mockReturnValue({ in: collabInMock });
      const collabSelectMock = vi.fn().mockReturnValue({ eq: collabEqMock });

      const likesInMock = vi.fn().mockResolvedValue({ data: [{ list_id: "a" }], error: null });
      const likesEqMock = vi.fn().mockReturnValue({ in: likesInMock });
      const likesSelectMock = vi.fn().mockReturnValue({ eq: likesEqMock });

      fromMock.mockImplementation((table: string) => {
         if (table === "list_collaborators") return { select: collabSelectMock };
         if (table === "list_likes") return { select: likesSelectMock };
         return { select: selectMock, match: matchMock, insert: insertMock };
      });

      const result = await fetchCollaborativeLists("u1", "current-user");
      expect(result).toEqual([
         { id: "a", is_liked: true },
         { id: "b", is_liked: false },
      ]);
   });

   it("adds collaborators when list is not empty", async () => {
      insertMock.mockResolvedValue({ error: null });
      await expect(addCollaboratorsToList("l1", ["u2", "u3"])).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith("list_collaborators");
   });

   it("skips notifications for private lists", async () => {
      await expect(notifyListCollaborators("u1", "l1", "private", ["u2"])).resolves.toBeUndefined();
      expect(fromMock).not.toHaveBeenCalledWith("notifications");
   });

   it("sends notifications for shared lists", async () => {
      insertMock.mockResolvedValue({ error: null });
      await expect(notifyListCollaborators("u1", "l1", "full_shared", ["u2"])).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith("notifications");
   });

   it("checks movie existence by list and tmdb id", async () => {
      maybeSingleMock.mockResolvedValue({ data: { tmdb_id: 10 }, error: null });
      const exists = await listMovieExists("l1", 10);
      expect(exists).toBe(true);
   });

   it("throws when movie existence query fails", async () => {
      maybeSingleMock.mockResolvedValue({ data: null, error: new Error("exists-failed") });
      await expect(listMovieExists("l1", 99)).rejects.toThrow("exists-failed");
   });

   it("fetches private list reviews and short-circuits empty ids", async () => {
      const inLocalMock = vi.fn().mockResolvedValue({ data: [{ id: "r1" }], error: null });
      const eqLocalMock = vi.fn().mockReturnValue({ in: inLocalMock });
      const selectLocalMock = vi.fn().mockReturnValue({ eq: eqLocalMock });

      fromMock.mockImplementation((table: string) => {
         if (table === "reviews") return { select: selectLocalMock };
         return { select: selectMock, match: matchMock, insert: insertMock };
      });

      await expect(fetchPrivateListReviews("u1", [])).resolves.toEqual([]);
      const result = await fetchPrivateListReviews("u1", [10]);
      expect(result).toEqual([{ id: "r1" }]);
   });

   it("fetches shared list reviews and short-circuits empty ids", async () => {
      const inLocalMock = vi.fn().mockResolvedValue({ data: [{ tmdb_id: 10 }], error: null });
      const eqLocalMock = vi.fn().mockReturnValue({ in: inLocalMock });
      const selectLocalMock = vi.fn().mockReturnValue({ eq: eqLocalMock });

      fromMock.mockImplementation((table: string) => {
         if (table === "list_reviews") return { select: selectLocalMock };
         return { select: selectMock, match: matchMock, insert: insertMock };
      });

      await expect(fetchSharedListReviews("l1", [])).resolves.toEqual([]);
      const result = await fetchSharedListReviews("l1", [10]);
      expect(result).toEqual([{ tmdb_id: 10 }]);
   });

   it("fetches list movie ids", async () => {
      const eqLocalMock = vi.fn().mockResolvedValue({ data: [{ tmdb_id: 10 }, { tmdb_id: 20 }], error: null });
      const selectLocalMock = vi.fn().mockReturnValue({ eq: eqLocalMock });

      fromMock.mockImplementation((table: string) => {
         if (table === "list_movies") return { select: selectLocalMock };
         return { select: selectMock, match: matchMock, insert: insertMock };
      });

      const result = await fetchListMovieIds("l1");
      expect(result).toEqual([10, 20]);
   });

   it("subscribes to list changes and details", () => {
      const listChangeUnsubscribe = subscribeListsChanges("u1", vi.fn());
      const detailsChangeUnsubscribe = subscribeListDetailsChanges("l1", "u1", vi.fn());

      expect(channelMock).toHaveBeenCalledWith("custom-all-lists-changes");
      expect(channelMock).toHaveBeenCalledWith("list_updates_l1");
      listChangeUnsubscribe();
      detailsChangeUnsubscribe();
      expect(removeChannelMock).toHaveBeenCalledTimes(2);
   });
});