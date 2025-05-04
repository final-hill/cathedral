<!-- Ref: https://nuxt.com/docs/guide/directory-structure/error -->
<script setup lang="ts">
import type { NuxtError } from '#app'

definePageMeta({ middleware: 'guest' })

const props = defineProps({
    error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
    <div>
        <h2>{{ error?.statusCode }}</h2>
        <pre>{{ error?.message }}</pre>
        <UButton @click="handleError" size="xl" label="Clear error" />
    </div>
</template>