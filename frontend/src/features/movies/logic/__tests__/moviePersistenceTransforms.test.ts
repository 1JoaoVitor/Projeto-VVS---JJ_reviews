import { describe, expect, it } from "vitest";
import {
   buildFullSharedListReviewInsertPayload,
   buildPartialSharedListReviewInsertPayload,
   buildPersonalReviewPayload,
   buildSyncListReviewRpcPayload,
   shouldSaveDiaryEntry,
} from "../moviePersistenceTransforms";

describe("moviePersistenceTransforms", () => {
   it("builds personal review payload without watched_date", () => {
      const result = buildPersonalReviewPayload("u1", 77, {
         rating: 9,
         review: "excelente",
         recommended: "Assista com certeza",
         runtime: 120,
         location: "Cinema",
         status: "watched",
         attachment_url: null,
         watched_date: "2026-01-01",
      });

      expect(result.reviewPayload).toEqual({
         tmdb_id: 77,
         user_id: "u1",
         rating: 9,
         review: "excelente",
         recommended: "Assista com certeza",
         runtime: 120,
         location: "Cinema",
         status: "watched",
         attachment_url: null,
      });
      expect(result.watchedDate).toBe("2026-01-01");
   });

   it("drops watched_date when it is not provided", () => {
      const result = buildPersonalReviewPayload("u1", 77, {
         rating: null,
         review: null,
         recommended: null,
         runtime: 0,
         location: null,
         status: "watchlist",
         attachment_url: null,
      });

      expect(result.reviewPayload).toEqual({
         tmdb_id: 77,
         user_id: "u1",
         rating: null,
         review: null,
         recommended: null,
         runtime: 0,
         location: null,
         status: "watchlist",
         attachment_url: null,
      });
      expect(result.watchedDate).toBeUndefined();
   });

   it("builds full shared list review insert payload", () => {
      expect(
         buildFullSharedListReviewInsertPayload("l1", 50, {
            rating: 8,
            review: "ok",
            recommended: "Vale a pena assistir",
         })
      ).toEqual({
         list_id: "l1",
         tmdb_id: 50,
         user_id: null,
         rating: 8,
         review: "ok",
         recommended: "Vale a pena assistir",
      });
   });

   it("builds partial shared list review insert payload", () => {
      expect(
         buildPartialSharedListReviewInsertPayload("l1", 50, "u1", {
            rating: 7,
            review: "bom",
            recommended: "Vale a pena assistir",
            location: "Casa",
            runtime: 130,
         })
      ).toEqual({
         list_id: "l1",
         tmdb_id: 50,
         user_id: "u1",
         rating: 7,
         review: "bom",
         recommended: "Vale a pena assistir",
         location: "Casa",
         runtime: 130,
      });
   });

   it("builds sync rpc payload and diary condition", () => {
      expect(
         buildSyncListReviewRpcPayload({
            listId: "l1",
            tmdbId: 99,
            rating: 9,
            review: "Bom",
            recommended: "Assista com certeza",
            status: "watched",
            addedBy: "u1",
            location: "Casa",
            runtime: 120,
         })
      ).toEqual({
         p_list_id: "l1",
         p_tmdb_id: 99,
         p_rating: 9,
         p_review: "Bom",
         p_recommended: "Assista com certeza",
         p_status: "watched",
         p_added_by: "u1",
         p_location: "Casa",
         p_runtime: 120,
      });

      expect(shouldSaveDiaryEntry("watched")).toBe(true);
      expect(shouldSaveDiaryEntry("watchlist")).toBe(false);
   });

   it("keeps sync rpc payload fields stable for watchlist entries", () => {
      expect(
         buildSyncListReviewRpcPayload({
            listId: "l2",
            tmdbId: 100,
            rating: 0,
            review: "",
            recommended: "",
            status: "watchlist",
            addedBy: "u2",
            location: "",
            runtime: 0,
         })
      ).toEqual({
         p_list_id: "l2",
         p_tmdb_id: 100,
         p_rating: 0,
         p_review: "",
         p_recommended: "",
         p_status: "watchlist",
         p_added_by: "u2",
         p_location: "",
         p_runtime: 0,
      });
   });

   it("treats watched as the only diary-saving status", () => {
      expect(shouldSaveDiaryEntry("watched")).toBe(true);
      expect(shouldSaveDiaryEntry("watchlist")).toBe(false);
   });
});