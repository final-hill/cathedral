import type { H3Event } from 'h3'
import { eventHandler, getQuery, sendRedirect, createError } from 'h3'
import { withQuery } from 'ufo'
import { ENTRA_OAUTH_SCOPES } from './oauth-constants'

export interface OAuthEntraExternalIDConfig {
    /**
     * Entra External ID OAuth Client ID (REQUIRED)
     * @default process.env.NUXT_OAUTH_ENTRA_EXTERNAL_ID_CLIENT_ID
     */
    clientId: string
    /**
     * Entra External ID OAuth Client Secret (REQUIRED)
     * @default process.env.NUXT_OAUTH_ENTRA_EXTERNAL_ID_CLIENT_SECRET
     */
    clientSecret: string
    /**
     * Entra External ID tenant domain (REQUIRED)
     * @example 'cathedralfinalhill.onmicrosoft.com'
     * @default process.env.NUXT_OAUTH_ENTRA_EXTERNAL_ID_TENANT
     */
    tenant: string
    /**
     * Redirect URL (REQUIRED)
     * @example 'https://cathedral.localhost/auth/entra-external-id'
     * @default process.env.NUXT_OAUTH_ENTRA_EXTERNAL_ID_REDIRECT_URL
     */
    redirectURL: string
    /**
     * Entra External ID OAuth Scope
     * @default ['openid', 'profile', 'email']
     */
    scope?: string[]
    /**
     * Entra External ID Authorization URL
     * @default 'https://{tenant}.ciamlogin.com/{tenant}/oauth2/v2.0/authorize'
     */
    authorizationURL?: string
    /**
     * Entra External ID Token URL
     * @default 'https://{tenant}.ciamlogin.com/{tenant}/oauth2/v2.0/token'
     */
    tokenURL?: string
    /**
     * Microsoft Graph API URL for user info
     * @default 'https://graph.microsoft.com/v1.0/me'
     */
    userURL?: string
}

type ConfigResolver = (event: H3Event) => OAuthEntraExternalIDConfig | Promise<OAuthEntraExternalIDConfig>

interface ExtendedOAuthConfig<T, U> {
    config: T | ConfigResolver
    onSuccess: (event: H3Event, result: U) => Promise<unknown> | unknown
    onError?: (event: H3Event, error: unknown) => Promise<unknown> | unknown
}

interface EntraExternalIDUser {
    id: string
    displayName: string
    mail?: string
    userPrincipalName: string
    givenName?: string
    surname?: string
}

interface EntraExternalIDTokens {
    access_token: string
    token_type: string
    expires_in: number
    scope: string
    id_token?: string
}

export function defineOAuthEntraExternalIDEventHandler({
    config,
    onSuccess,
    onError
}: ExtendedOAuthConfig<OAuthEntraExternalIDConfig, { user: EntraExternalIDUser, tokens: EntraExternalIDTokens }>) {
    return eventHandler(async (event: H3Event) => {
        const query = getQuery<{ code?: string, error?: string }>(event)

        if (query.error) {
            const error = createError({
                statusCode: 401,
                message: `Entra External ID login failed: ${query.error || 'Unknown error'}`,
                data: query
            })
            if (!onError) throw error
            return onError(event, error)
        }

        // Resolve config - it can be a function or a static object
        const resolvedConfig = typeof config === 'function' ? await config(event) : config

        if (!resolvedConfig?.clientId || !resolvedConfig?.clientSecret || !resolvedConfig?.tenant || !resolvedConfig?.redirectURL) {
            const missingKeys = []
            if (!resolvedConfig?.clientId) missingKeys.push('clientId')
            if (!resolvedConfig?.clientSecret) missingKeys.push('clientSecret')
            if (!resolvedConfig?.tenant) missingKeys.push('tenant')
            if (!resolvedConfig?.redirectURL) missingKeys.push('redirectURL')

            const error = createError({
                statusCode: 500,
                message: `Missing required configuration for Entra External ID: ${missingKeys.join(', ')} are required`
            })
            if (!onError) throw error
            return onError(event, error)
        }

        const tenant = resolvedConfig.tenant,
            tenantDomain = tenant.replace('.onmicrosoft.com', ''),
            authorizationURL = resolvedConfig.authorizationURL || `https://${tenantDomain}.ciamlogin.com/${tenant}/oauth2/v2.0/authorize`,
            tokenURL = resolvedConfig.tokenURL || `https://${tenantDomain}.ciamlogin.com/${tenant}/oauth2/v2.0/token`,
            userURL = resolvedConfig.userURL || 'https://graph.microsoft.com/v1.0/me',
            scope = resolvedConfig.scope || ENTRA_OAUTH_SCOPES,
            redirectURL = resolvedConfig.redirectURL

        if (!query.code) {
            return sendRedirect(
                event,
                withQuery(authorizationURL, {
                    client_id: resolvedConfig.clientId,
                    redirect_uri: redirectURL,
                    response_type: 'code',
                    scope: scope.join(' ')
                })
            )
        }

        // Exchange code for tokens
        const tokenBody = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: resolvedConfig.clientId,
            client_secret: resolvedConfig.clientSecret,
            redirect_uri: redirectURL,
            code: query.code
        })

        type TokenResponse = EntraExternalIDTokens & { error?: string, error_description?: string }
        let tokens: TokenResponse
        try {
            tokens = await $fetch<TokenResponse>(tokenURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: tokenBody.toString()
            })
        } catch (error) {
            if (process.env.NODE_ENV === 'production')
                console.error('Token exchange error occurred')
            else
                console.error('Token exchange error:', error instanceof Error ? error.message : 'Unknown error')

            const tokenExchangeError = createError({
                statusCode: 500,
                message: 'Token exchange failed',
                data: { error: 'token_exchange_failed', details: process.env.NODE_ENV === 'production' ? undefined : error }
            })

            if (!onError) throw tokenExchangeError
            return onError(event, tokenExchangeError)
        }

        if (tokens.error) {
            const error = createError({
                statusCode: 401,
                message: `Token exchange failed: ${tokens.error_description || tokens.error || 'Unknown error'}`,
                data: tokens
            })

            if (!onError) throw error
            return onError(event, error)
        }

        const accessToken = tokens.access_token
        type UserResponse = EntraExternalIDUser & { error?: string }
        let user: UserResponse
        try {
            user = await $fetch<UserResponse>(userURL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
        } catch (error) {
            console.error('User fetch error:', error)
            user = { id: '', displayName: '', userPrincipalName: '', error: 'user_fetch_failed' }
        }

        if (user.error) {
            const error = createError({
                statusCode: 401,
                message: `User fetch failed: ${user.error || 'Unknown error'}`,
                data: user
            })
            if (!onError) throw error
            return onError(event, error)
        }

        return onSuccess(event, {
            user: user as EntraExternalIDUser,
            tokens: tokens as EntraExternalIDTokens
        })
    })
}
