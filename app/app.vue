<script lang="ts" setup>
const { public: publicConfig } = useRuntimeConfig()

useHead({
    titleTemplate: titleChunk =>
        titleChunk ? `${titleChunk} - Cathedral` : 'Cathedral',
    meta: [
        {
            name: 'slack-app-id',
            content: publicConfig.slackAppId as string
        }
    ]
})
</script>

<template>
    <UApp>
        <NuxtPwaManifest />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
