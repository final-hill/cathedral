<!-- Ref: https://nuxt.com/docs/guide/directory-structure/error -->
<script setup lang="ts">
import type { NuxtError } from '#app'

const _props = defineProps({
    error: {
        type: Object as () => NuxtError,
        default: () => ({}) as NuxtError
    }
})

const handleError = () => {
    if (_props.error?.statusCode === 401) {
        // Store current path in sessionStorage for post-auth redirect (client-side only)
        if (import.meta.client) {
            const currentPath = useRoute().fullPath
            if (currentPath !== '/error') {
                sessionStorage.setItem('auth-redirect', currentPath)
            }
        }
        navigateTo('/auth', { external: true })
        return
    }
    clearError({ redirect: '/' })
}
</script>

<template>
    <h2>{{ _props.error?.statusCode }}</h2>
    <pre>{{ _props.error?.message }}</pre>
    <UButton
        size="xl"
        label="Clear error"
        @click="handleError"
    />
</template>
