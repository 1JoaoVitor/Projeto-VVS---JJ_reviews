import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateImportFiles, parseImportCsvContent } from "../importValidationService";
import type { ProfileData, RatingData, ListData, DiaryData } from "../../types/importTypes";

vi.mock("../../utils/movieMatcher", () => ({
  batchMatchMovies: vi.fn(async () => ({
    successful: 2,
    failed: 0,
    results: new Map(),
    cacheHits: 0,
  })),
}));

const { batchMatchMovies } = await import("../../utils/movieMatcher");

describe("importValidationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateImportFiles", () => {
    it("validates empty file set", async () => {
      const result = await validateImportFiles({});
      expect(result.isValid).toBe(true);
      expect(result.canProceed).toBe(true);
    });

    it("rejects profile without username", async () => {
      const profile: ProfileData = {
        username: "",
        dateJoined: "2024-01-01T00:00:00.000Z",
      };

      const result = await validateImportFiles({ profile });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("username"))).toBe(true);
    });

    it("accepts valid ratings", async () => {
      const ratings: RatingData[] = [
        {
          date: "2024-01-01T00:00:00.000Z",
          name: "The Matrix",
          year: 1999,
          rating: 5,
        },
      ];

      const result = await validateImportFiles({ ratings });
      expect(result.canProceed).toBe(true);
    });

    it("warns on invalid rating values", async () => {
      const ratings: RatingData[] = [
        {
          date: "2024-01-01T00:00:00.000Z",
          name: "The Matrix",
          year: 1999,
          rating: 10,
        },
      ];

      const result = await validateImportFiles({ ratings });
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("warns on diary rows with missing watched date", async () => {
      const diary: DiaryData[] = [
        {
          date: "2024-01-01T00:00:00.000Z",
          name: "",
          year: 1700,
          watchedDate: "",
        },
      ];

      const result = await validateImportFiles({ diary });
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("adds TMDB warnings when batch matching reports failures", async () => {
      vi.mocked(batchMatchMovies).mockResolvedValueOnce({
        successful: 1,
        failed: 2,
        results: new Map(),
        cacheHits: 5,
      });

      const ratings: RatingData[] = [
        {
          date: "2024-01-01T00:00:00.000Z",
          name: "The Matrix",
          year: 1999,
          rating: 5,
        },
      ];

      const result = await validateImportFiles({ ratings });
      expect(result.warnings.some((warning) => warning.includes("could not be matched in TMDB"))).toBe(true);
    });
  });

  describe("parseImportCsvContent", () => {
    it("parses profile CSV", async () => {
      const csv = `Username,Date Joined,Given Name
testuser,2024-01-01,John`;

      const profile = (await parseImportCsvContent(csv, "profile")) as ProfileData;
      expect(profile.username).toBe("testuser");
      expect(profile.givenName).toBe("John");
    });

    it("parses list metadata and movie rows", async () => {
      const csv = `Date,Name,Tags,URL,Description
2026-03-20,Minha Lista,,https://boxd.it/abc,desc
Position,Name,Year,URL,Description
1,Movie One,2024,https://boxd.it/1,
2,Movie Two,2023,https://boxd.it/2,`;

      const list = (await parseImportCsvContent(csv, "list")) as ListData;
      expect(list.name).toBe("Minha Lista");
      expect(list.movies).toHaveLength(2);
    });

    it("skips invalid diary rows without watched date", async () => {
      const csv = `Name,Year,Date,Watched Date
"Valid",2024,2024-01-01,2024-01-01
"Invalid",2024,2024-01-02,`;

      const diary = (await parseImportCsvContent(csv, "diary")) as DiaryData[];
      expect(diary).toHaveLength(1);
      expect(diary[0]?.name).toBe("Valid");
    });

    it("throws for invalid CSV content", async () => {
      await expect(parseImportCsvContent("", "ratings")).rejects.toThrow();
    });

    it("throws for unknown file type", async () => {
      await expect(async () => {
        await parseImportCsvContent("valid,csv,data", "unknown" as unknown as "profile" | "ratings" | "reviews" | "watched" | "watchlist" | "list");
      }).rejects.toThrow();
    });
  });
});