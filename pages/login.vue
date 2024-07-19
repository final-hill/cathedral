<template>
    <h2>Sign in to Cathedral</h2>

    <Button @click="signIn('github')" icon="pi pi-github" label="Sign in with Github" />
</template>

<script lang="ts" setup>
// Ref: https://sidebase.io/nuxt-auth/application-side/custom-sign-in-page#configure-authjs-to-redirect-to-the-custom-sign-in-page
definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    }
})

const { signIn } = useAuth()
</script>