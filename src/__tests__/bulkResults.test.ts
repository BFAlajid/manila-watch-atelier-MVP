import { describe, it, expect } from 'vitest';
import { applyBulkStatus, partitionBulkResults } from '../lib/bulkResults';

describe('partitionBulkResults', () => {
  it('splits ids by save outcome', () => {
    const { okIds, failedIds } = partitionBulkResults([
      { id: 'a', ok: true },
      { id: 'b', ok: false },
      { id: 'c', ok: true },
    ]);
    expect(okIds).toEqual(['a', 'c']);
    expect(failedIds).toEqual(['b']);
  });
});

describe('applyBulkStatus', () => {
  it('updates only watches whose save succeeded', () => {
    const watches = [
      { id: 'a', status: 'AVAILABLE' },
      { id: 'b', status: 'AVAILABLE' },
      { id: 'c', status: 'AVAILABLE' },
    ];
    const next = applyBulkStatus(watches, ['a', 'c'], 'SOLD');
    expect(next.map((w) => w.status)).toEqual(['SOLD', 'AVAILABLE', 'SOLD']);
  });
});
