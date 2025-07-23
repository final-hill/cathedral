/**
 * OAuth constants for Entra External ID
 * Centralized configuration to avoid duplication
 */
export const ENTRA_OAUTH_SCOPES = [
    'openid',
    'profile',
    'email'
]

export const ENTRA_OAUTH_CONFIG = {
    scopes: ENTRA_OAUTH_SCOPES,
    prompt: 'login'
} as const
