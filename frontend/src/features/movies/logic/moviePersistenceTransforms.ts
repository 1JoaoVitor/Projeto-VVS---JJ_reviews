export interface PersonalReviewPayload {
   rating: number | null;
   review: string | null;
   recommended: string | null;
   runtime: number;
   location: string | null;
   status: "watched" | "watchlist";
   attachment_url: string | null;
   watched_date?: string;
}

export interface FullSharedListReviewPayload {
   rating: number;
   review: string;
   recommended: string;
}

export interface PartialSharedListReviewPayload {
   rating: number;
   review: string;
   recommended: string;
   location: string;
   runtime: number;
}

export interface SyncListReviewPayload {
   listId: string;
   tmdbId: number;
   rating: number;
   review: string;
   recommended: string;
   status: "watched" | "watchlist";
   addedBy: string;
   location: string;
   runtime: number;
}

export function buildPersonalReviewPayload(userId: string, tmdbId: number, payload: PersonalReviewPayload): {
   reviewPayload: Omit<PersonalReviewPayload, "watched_date"> & { tmdb_id: number; user_id: string };
   watchedDate?: string;
} {
   const reviewPayload = {
      tmdb_id: tmdbId,
      user_id: userId,
      ...payload,
   };

   const watchedDate = payload.watched_date;
   delete (reviewPayload as { watched_date?: string }).watched_date;

   return { reviewPayload, watchedDate };
}

export function buildFullSharedListReviewInsertPayload(
   listId: string,
   tmdbId: number,
   payload: FullSharedListReviewPayload
): { list_id: string; tmdb_id: number; user_id: null } & FullSharedListReviewPayload {
   return {
      list_id: listId,
      tmdb_id: tmdbId,
      user_id: null,
      ...payload,
   };
}

export function buildPartialSharedListReviewInsertPayload(
   listId: string,
   tmdbId: number,
   userId: string,
   payload: PartialSharedListReviewPayload
): { list_id: string; tmdb_id: number; user_id: string } & PartialSharedListReviewPayload {
   return {
      list_id: listId,
      tmdb_id: tmdbId,
      user_id: userId,
      ...payload,
   };
}

export function buildSyncListReviewRpcPayload(payload: SyncListReviewPayload): Record<string, unknown> {
   return {
      p_list_id: payload.listId,
      p_tmdb_id: payload.tmdbId,
      p_rating: payload.rating,
      p_review: payload.review,
      p_recommended: payload.recommended,
      p_status: payload.status,
      p_added_by: payload.addedBy,
      p_location: payload.location,
      p_runtime: payload.runtime,
   };
}

export function shouldSaveDiaryEntry(status: "watched" | "watchlist"): boolean {
   return status === "watched";
}