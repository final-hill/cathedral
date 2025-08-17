import { defineOAuthEntraExternalIDEventHandler } from '~/server/utils/oauth-entra-external-id'
import { createEntraService } from '~/server/utils/createEntraService'
import { ENTRA_OAUTH_SCOPES } from '~/server/utils/oauth-constants'

export default defineOAuthEntraExternalIDEventHandler({
    async config(event) {
        const runtimeConfig = useRuntimeConfig(event)
        return {
            clientId: runtimeConfig.oauth?.microsoft?.clientId || '',
            clientSecret: runtimeConfig.oauth?.microsoft?.clientSecret || '',
            tenant: runtimeConfig.oauth?.microsoft?.tenant || '',
            redirectURL: runtimeConfig.oauth?.microsoft?.redirectURL || '',
            scope: ENTRA_OAUTH_SCOPES
        }
    },
    async onSuccess(event, { user, tokens }) {
        // Parse group memberships from ID token claims (required with optional claims)
        const entraService = createEntraService()

        try {
            if (!tokens.id_token) {
                throw new Error('ID token is required for group claims')
            }

            const userGroups = await entraService.getUserGroups(tokens.id_token),
                parsedPermissions = entraService.parseGroups(userGroups)

            await setUserSession(event, {
                user: {
                    id: user.id,
                    name: user.displayName || `${user.givenName || ''} ${user.surname || ''}`.trim() || user.userPrincipalName,
                    email: user.mail || user.userPrincipalName,
                    avatar: null,
                    isSystemAdmin: parsedPermissions.isSystemAdmin,
                    organizationRoles: parsedPermissions.organizationRoles
                },
                loggedInAt: Date.now()
            })

            return sendRedirect(event, '/auth/callback')
        } catch (error) {
            console.error('ERROR: Failed to extract groups from token. See sanitized error details below.')
            console.error('Error details:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            })

            // Don't fail the login, but log the issue for investigation
            // User will have no permissions until issue is resolved
            await setUserSession(event, {
                user: {
                    id: user.id,
                    name: user.displayName || `${user.givenName || ''} ${user.surname || ''}`.trim() || user.userPrincipalName,
                    email: user.mail || user.userPrincipalName,
                    avatar: null,
                    isSystemAdmin: false,
                    organizationRoles: []
                },
                loggedInAt: Date.now()
            })

            return sendRedirect(event, '/auth/callback')
        }
    },
    async onError(event, error) {
        console.error('OAuth error:', error)
        const message = error instanceof Error ? error.message : String(error)

        return sendRedirect(event, '/auth?error=' + encodeURIComponent(message))
    }
})
