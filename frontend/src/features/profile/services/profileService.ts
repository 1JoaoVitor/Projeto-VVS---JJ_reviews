import { supabase } from "@/lib/supabase";
import { buildAvatarFileName, normalizeUserProfile, type UserProfileRecord } from "../logic/profileServiceTransforms";

export async function fetchUserProfile(userId: string): Promise<UserProfileRecord> {
   const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url, username")
      .eq("id", userId)
      .single();

   if (error) throw error;

   return normalizeUserProfile(data);
}

export async function updateUserProfileName(userId: string, username: string): Promise<void> {
   const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", userId);

   if (error) throw error;
}

export async function uploadUserAvatar(userId: string, imageBlob: Blob): Promise<string> {
   const fileName = buildAvatarFileName(userId, Math.random());

   const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, imageBlob, { upsert: true, contentType: "image/jpeg" });

   if (uploadError) throw uploadError;

   const {
      data: { publicUrl },
   } = supabase.storage.from("avatars").getPublicUrl(fileName);

   const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

   if (updateError) throw updateError;

   return publicUrl;
}
