/**
 * Standardized paginated response envelope for all list endpoints.
 * Enforces { data: T[], nextCursor: string | null } structure.
 */
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  total?: number;
}
