/** Enumerations shared by the schema and the UI. Kept zod-free so the client bundle stays small. */
export const FREE_TYPES = [
  'fully-free',
  'free-open-source',
  'free-tier',
  'free-with-limits',
  'free-credits',
  'free-trial',
  'self-hosted',
  'community-edition',
  'student-only',
  'non-commercial-only',
] as const;

export const CATEGORIES = [
  'infrastructure',
  'development',
  'ai',
  'design',
  'data-apis',
  'open-source-local',
] as const;

export const ROLES = [
  'frontend',
  'backend',
  'hosting',
  'database',
  'auth',
  'storage',
  'ai',
  'analytics',
  'email',
  'monitoring',
  'automation',
  'extras',
] as const;

export const STATUSES = ['verified', 'needs-review', 'pricing-changed', 'discontinued', 'unverified'] as const;

export const METRICS = [
  'requests',
  'bandwidth_gb',
  'storage_gb',
  'db_storage_gb',
  'mau',
  'emails',
  'function_invocations',
  'ai_requests',
  'ai_tokens',
  'events',
  'commands',
  'build_minutes',
  'compute_hours',
  'rows_read',
  'rows_written',
  'monitors',
  'errors',
  'builds',
  'neurons',
  'credits',
  'projects',
] as const;

export const PERIODS = ['month', 'day', 'minute', 'total'] as const;

