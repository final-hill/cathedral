<script setup lang="ts">
// This page handles authentication requests with optional redirect parameters
definePageMeta({ middleware: 'guest' })

const route = useRoute()
const redirectPath = route.query.redirect as string

// Store redirect in sessionStorage before starting OAuth (client-side only)
if (import.meta.client && redirectPath && redirectPath.startsWith('/')) {
    sessionStorage.setItem('auth-redirect', redirectPath)
}

// Redirect to OAuth
await navigateTo('/auth/entra-external-id', { external: true })
</script>

<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
            <h2 class="text-xl font-semibold mb-4">
                Redirecting to login...
            </h2>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
    </div>
</template>
