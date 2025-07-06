import { z } from 'zod'
import { dedent } from '../../utils/dedent.js'

/**
 * The AppCredentials schema defines the structure of the credentials used by the application.
 * This is used for WebAuthn authentication.
 */
export const AppCredentials = z.object({
    id: z.string()
        .describe('The unique identifier of the Credentials'),
    appUser: z.object({
        id: z.string().uuid()
            .describe('The id of the AppUser associated with the Credentials'),
        name: z.string()
            .describe('The name of the AppUser associated with the Credentials'),
        email: z.string().email()
            .describe('The email of the AppUser associated with the Credentials')
    }).describe('The user associated with the Credentials'),
    publicKey: z.string()
        .describe('The public key bytes, used for subsequent authentication signature verification'),
    counter: z.number().int().min(0)
        .describe('The number of times the authenticator has been used on this site so far'),
    backedUp: z.boolean()
        .describe(dedent(`
            Whether the credentials have been backed up or not on the generating device.
            When you use a password manager or authenticator, the credential is "backed up"
            because it can be used on multiple devices
        `)),
    transports: z.array(z.enum(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb'])).default([])
        .describe('How the browser can talk with this credential\'s authenticator')
})
