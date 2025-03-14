<script lang="ts" setup>
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
