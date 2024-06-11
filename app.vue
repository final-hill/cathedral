<script lang="ts" setup>
useHead({
  titleTemplate: (titleChunk) =>
    titleChunk ? `${titleChunk} - Cathedral` : 'Cathedral'
})

const preAlphaDialogVisible = ref(
  JSON.parse(localStorage.getItem('preAlphaDialogVisible') || 'true')
);

const onAlphaDialogClose = () => {
  preAlphaDialogVisible.value = false;

  // save the setting to local storage
  localStorage.setItem('preAlphaDialogVisible', 'false');
};
</script>

<template>
  <NuxtPwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <Dialog v-model:visible="preAlphaDialogVisible" modal header="Warning" class="w-30rem" :show-close="false">
    <p>
      This is a pre-alpha version of the application. It is not yet ready for production use.
      By continuing to use this application, you accept the risks associated with using pre-alpha software.
      The application may be unstable, and data loss may occur.
    </p>

    <Button type="button" label="Okay" @click="onAlphaDialogClose"></Button>
  </Dialog>
</template>
