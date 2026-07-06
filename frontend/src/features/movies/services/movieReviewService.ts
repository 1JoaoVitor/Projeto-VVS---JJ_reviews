import { supabase } from "@/lib/supabase";
import { normalizePrivateListIds, shouldDeleteFromPrivateLists } from "../logic/movieReviewServiceTransforms";

export async function deleteReviewById(reviewId: string | number): Promise<void> {
   const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
   if (error) throw error;
}

export async function removeMovieFromPrivateLists(tmdbId: number, privateListIds: string[]): Promise<void> {
   if (!shouldDeleteFromPrivateLists(privateListIds)) return;

   const normalizedPrivateListIds = normalizePrivateListIds(privateListIds);

   const { error } = await supabase
      .from("list_movies")
      .delete()
      .eq("tmdb_id", tmdbId)
      .in("list_id", normalizedPrivateListIds);

   if (error) throw error;
}
