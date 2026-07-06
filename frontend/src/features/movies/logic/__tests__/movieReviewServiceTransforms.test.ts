import { describe, expect, it } from "vitest";
import { normalizePrivateListIds, shouldDeleteFromPrivateLists } from "../movieReviewServiceTransforms";

describe("movieReviewServiceTransforms", () => {
   it("removes empty and duplicated private list ids", () => {
      expect(normalizePrivateListIds(["l1", "", "l2", "l1", "l2"])).toEqual(["l1", "l2"]);
   });

   it("detects when there are private list ids to delete from", () => {
      expect(shouldDeleteFromPrivateLists([])).toBe(false);
      expect(shouldDeleteFromPrivateLists(["l1"])).toBe(true);
   });
});