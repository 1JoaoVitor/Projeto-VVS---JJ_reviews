export interface UserProfileRow {
   username: string | null;
   avatar_url: string | null;
}

export interface UserProfileRecord {
   username: string;
   avatarUrl: string | null;
}

export function normalizeUserProfile(row: UserProfileRow | null | undefined): UserProfileRecord {
   return {
      username: row?.username || "",
      avatarUrl: row?.avatar_url || null,
   };
}

export function buildAvatarFileName(userId: string, randomValue: number): string {
   return `${userId}-${randomValue}.jpg`;
}