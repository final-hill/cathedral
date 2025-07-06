<!-- Ref: https://nuxt.com/docs/guide/directory-structure/error -->
<script setup lang="ts">
import type { NuxtError } from '#app'

definePageMeta({ middleware: 'guest' })

const _props = defineProps({
    error: {
        type: Object as () => NuxtError,
        default: () => ({}) as NuxtError
    }
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
    <h2>{{ error?.statusCode }}</h2>
    <pre>{{ error?.message }}</pre>
    <UButton
        size="xl"
        label="Clear error"
        @click="handleError"
    />
</template>
