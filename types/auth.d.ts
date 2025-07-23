// Type declarations for nuxt-auth-utils
declare module '#auth-utils' {
    interface User {
        id: string
        email: string
        name: string
        avatar?: string | null
        groups: string[] // Entra group memberships
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
