declare module '#auth-utils' {
    interface User {
        id: string
        name: string
        email: string
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface UserSession {
        // User session data will be added as needed

    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface SecureSessionData {
        // Secure session data will be added as needed

    }
}

export { }
