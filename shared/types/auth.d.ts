// Type declarations for nuxt-auth-utils
import type { AppRole } from '../domain/application/AppRole'

declare module '#auth-utils' {
    interface User {
        id: string
        email: string
        name: string
        avatar?: string | null
        isSystemAdmin: boolean
        organizationRoles: Array<{ orgId: string, role: AppRole }>
    }

    interface UserSession {
        user: User
        loggedInAt: number
    }

    interface SecureSessionData {
        // Define secure session data structure
        [key: string]: unknown
    }
}

export {}
