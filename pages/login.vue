<script lang="ts" setup>
// Ref: https://sidebase.io/nuxt-auth/application-side/custom-sign-in-page#configure-authjs-to-redirect-to-the-custom-sign-in-page
definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    }
})

const { signIn, getProviders } = useAuth(),
    providers = (await getProviders())
</script>

<template>
    <h2>Sign in to Cathedral</h2>

    <Button v-for="provider in providers" :key="provider!.id" @click="signIn(provider!.id)">
        Sign in with {{ provider!.name }}
    </Button>
</template>