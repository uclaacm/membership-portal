// Validation constants
export const MIN_GRADUATION_YEAR = 2020;
export const MAX_PAGINATION_LIMIT = 100;
export const DEFAULT_PAGINATION_LIMIT = 10;

// Rate limiting constants - Very lenient settings to handle deadline rushes
// During deadline hours (last 2 hours), we can see 100-200+ applications per hour
export const GENERAL_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const GENERAL_RATE_LIMIT_MAX = 2000; // Increased to handle high traffic
export const CREATE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
export const CREATE_RATE_LIMIT_MAX = 250; // Increased to handle deadline rushes (200+ in final hour)
