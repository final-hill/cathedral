<script lang="ts" setup>
// Ref: https://sidebase.io/nuxt-auth/application-side/custom-sign-in-page#configure-authjs-to-redirect-to-the-custom-sign-in-page
definePageMeta({
    name: 'Login',
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    }
})

const { signIn, getProviders } = useAuth(),
    providers = (await getProviders())
</script>

<template>
    <h1>Sign in to Cathedral</h1>

    <UButton v-for="provider in providers" :key="provider!.id" size="xl" @click="signIn(provider!.id)">
        Sign in with {{ provider!.name }}
    </UButton>
</template>