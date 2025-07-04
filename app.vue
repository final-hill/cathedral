<script lang="ts" setup>
const { loggedIn } = useUserSession()
const { public: publicConfig } = useRuntimeConfig()

watch(loggedIn, () => {
  if (!loggedIn.value)
    navigateTo({ name: 'Auth' })
})

useHead({
  titleTemplate: (titleChunk) =>
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
