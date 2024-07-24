// Ref: https://auth.sidebase.io/guide/authjs/session-data#typescript

import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    /* Returned by `useAuth`, `getSession` and `getServerSession` */
    interface Session extends DefaultSession {
        id: string
        isSystemAdmin: boolean
        user: {
            name: string
            email: string
            image: string
        }
    }
}