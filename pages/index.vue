<script lang="ts" setup>
definePageMeta({ name: 'Home', middleware: 'auth' })
</script>

<template>
    <AuthState v-slot="{ loggedIn }">
        <OrgManager v-if="loggedIn" />
    </AuthState>
</template>