import type { RawSupabaseList } from "./listOperations";

type CollaborativeListRow = {
   lists?: RawSupabaseList | RawSupabaseList[] | null;
};

type ListType = "private" | "partial_shared" | "full_shared";

export function flattenCollaborativeListsResponse(rows: CollaborativeListRow[] | null | undefined): RawSupabaseList[] {
   return (rows || []).flatMap((item) => {
      if (!item.lists) return [];
      return Array.isArray(item.lists) ? item.lists : [item.lists];
   });
}

export function applyLikedState<T extends { id: string }>(lists: T[], likedListIds: Iterable<string>): Array<T & { is_liked: boolean }> {
   const likedSet = new Set(likedListIds);
   return lists.map((list) => ({
      ...list,
      is_liked: likedSet.has(list.id),
   }));
}

export function buildCollaboratorInsertData(listId: string, collaboratorIds: string[]): Array<{ list_id: string; user_id: string; role: "member"; status: "pending" }> {
   return collaboratorIds.map((friendId) => ({
      list_id: listId,
      user_id: friendId,
      role: "member" as const,
      status: "pending" as const,
   }));
}

export function buildInviteNotificationData(
   ownerId: string,
   listId: string,
   listType: ListType,
   collaboratorIds: string[]
): Array<{
   user_id: string;
   sender_id: string;
   type: "list_invite";
   message: string;
   reference_id: string;
}> {
   if (collaboratorIds.length === 0 || listType === "private") return [];

   const message =
      listType === "full_shared"
         ? "convidou você para uma Lista Unificada!"
         : "convidou você para uma Lista Colaborativa!";

   return collaboratorIds.map((friendId) => ({
      user_id: friendId,
      sender_id: ownerId,
      type: "list_invite" as const,
      message,
      reference_id: listId,
   }));
}
