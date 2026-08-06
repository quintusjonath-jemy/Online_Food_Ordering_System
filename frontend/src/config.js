/**
 * Centralized Application Configuration
 * Provides dynamic environment variables loaded via Vite (VITE_API_BASE_URL and VITE_IMAGE_BASE_URL)
 * with automatic fallback endpoints for local LAMPP/Apache development servers.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api';
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost/uploads/';
