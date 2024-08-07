type DarkModeOptions = 'light' | 'dark'

declare module 'nuxt/schema' {
    interface AppConfigInput {
        darkMode: DarkModeOptions
    }
}

export { }