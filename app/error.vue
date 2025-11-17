<!-- Ref: https://nuxt.com/docs/guide/directory-structure/error -->
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
        error: {
            type: Object as () => NuxtError,
            default: () => ({}) as NuxtError
        }
    }),
    handleError = () => {
        if (props.error?.statusCode === 401) {
        // Store current path in sessionStorage for post-auth redirect (client-side only)
            if (import.meta.client) {
                const currentPath = useRoute().fullPath
                if (currentPath !== '/error')
                    sessionStorage.setItem('auth-redirect', currentPath)
            }
            navigateTo('/auth/entra-external-id', { external: true })
            return
        }
        clearError({ redirect: '/' })
    }
</script>

<template>
    <h2>{{ props.error?.statusCode }}</h2>
    <pre>{{ props.error?.message }}</pre>
    <UButton
        size="xl"
        label="Clear error"
        @click="handleError"
    />
</template>
