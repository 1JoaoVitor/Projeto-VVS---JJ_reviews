export function normalizePrivateListIds(privateListIds: string[]): string[] {
   return Array.from(new Set(privateListIds.filter(Boolean)));
}

export function shouldDeleteFromPrivateLists(privateListIds: string[]): boolean {
   return normalizePrivateListIds(privateListIds).length > 0;
}