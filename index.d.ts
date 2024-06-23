type DarkModeOptions = 'light' | 'dark'

declare module 'nuxt/schema' {
    interface AppConfigInput {
        darkMode: DarkModeOptions
        connString: string
    }
}

export { }