<script setup lang="ts">
// This page handles post-authentication redirect using sessionStorage
definePageMeta({ middleware: 'auth' })

// Client-side redirect handling
onMounted(() => {
    if (import.meta.client) {
        const savedRedirect = sessionStorage.getItem('auth-redirect')
        if (savedRedirect && savedRedirect.startsWith('/')) {
            // Clean up the stored redirect
            sessionStorage.removeItem('auth-redirect')
            // Redirect to the saved destination
            navigateTo(savedRedirect)
        } else {
            // No saved redirect, go to home
            navigateTo('/')
        }
    }
})
</script>

<template>
    <div class="flex items-center justify-center h-full">
        <div class="text-center">
            <h2 class="text-xl font-semibold mb-4">
                Authentication successful!
            </h2>
            <p class="text-muted mb-4">
                Redirecting you to your destination...
            </p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
    </div>
</template>
