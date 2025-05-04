<script lang="ts" setup>
const { loggedIn } = useUserSession()

watch(loggedIn, () => {
  if (!loggedIn.value)
    navigateTo({ name: 'Auth' })
})

useHead({
  titleTemplate: (titleChunk) =>
    titleChunk ? `${titleChunk} - Cathedral` : 'Cathedral'
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
