export const PAGE_SIZE = 20;

export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
}

/** One page of `items` (1-based), or null when `page` is out of range. */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize = PAGE_SIZE,
): Page<T> | null {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  if (!Number.isInteger(page) || page < 1 || page > pageCount) return null;

  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageCount,
    total: items.length,
  };
}
