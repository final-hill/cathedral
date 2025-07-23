import { defineOAuthEntraExternalIDEventHandler } from '~/server/utils/oauth-entra-external-id'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'
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
        console.log('OAuth success:', { user, tokenType: tokens.token_type })

        // Parse group memberships from ID token claims (required with optional claims)
        const groupService = createEntraGroupService()

        try {
            const userGroups = await groupService.getUserGroups(
                tokens.access_token,
                user.id,
                tokens.id_token // ID token is required for group claims
            )
            const parsedPermissions = groupService.parseGroups(userGroups)

            console.log('User groups extracted successfully:', userGroups)
            console.log('Parsed permissions:', parsedPermissions)

            await setUserSession(event, {
                user: {
                    id: user.id,
                    name: user.displayName || `${user.givenName || ''} ${user.surname || ''}`.trim() || user.userPrincipalName,
                    email: user.mail || user.userPrincipalName,
                    avatar: null,
                    groups: userGroups
                },
                loggedInAt: Date.now()
            })

            return sendRedirect(event, '/')
        } catch (error) {
            console.error('ERROR: Failed to extract groups from token:', error)
            console.error('Error details:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            })

            // Don't fail the login, but log the issue for investigation
            // User will have no groups (no permissions) until issue is resolved
            await setUserSession(event, {
                user: {
                    id: user.id,
                    name: user.displayName || `${user.givenName || ''} ${user.surname || ''}`.trim() || user.userPrincipalName,
                    email: user.mail || user.userPrincipalName,
                    avatar: null,
                    groups: [] // Empty groups array - user will have no permissions
                },
                loggedInAt: Date.now()
            })

            return sendRedirect(event, '/')
        }
    },
    async onError(event, error) {
        console.error('OAuth error:', error)
        const message = error instanceof Error ? error.message : String(error)

        return sendRedirect(event, '/auth?error=' + encodeURIComponent(message))
    }
})
