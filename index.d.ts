import type { SemVerString } from "./domain/SemVer"

type DarkModeOptions = 'light' | 'dark'

declare module 'nuxt/schema' {
    interface AppConfigInput {
        serializationVersion: SemVerString
        darkMode: DarkModeOptions
        connString: string
    }
}

export { }