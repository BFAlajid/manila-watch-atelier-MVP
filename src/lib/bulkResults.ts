export interface BulkResult {
  id: string;
  ok: boolean;
}

export function partitionBulkResults(results: readonly BulkResult[]): {
  okIds: string[];
  failedIds: string[];
} {
  return {
    okIds: results.filter((r) => r.ok).map((r) => r.id),
    failedIds: results.filter((r) => !r.ok).map((r) => r.id),
  };
}

export function applyBulkStatus<T extends { id: string; status?: string }>(
  items: readonly T[],
  okIds: readonly string[],
  status: string
): T[] {
  const ok = new Set(okIds);
  return items.map((item) => (ok.has(item.id) ? { ...item, status } : item));
}
