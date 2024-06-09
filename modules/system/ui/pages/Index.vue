<script lang="ts" setup>
const router = useRouter(),
    route = useRoute()
</script>

<template>
    <h1>System</h1>

    <div class="grid">
        <NuxtLink class="col-fixed w-2 mr-4" :to="`${route.path}/functionality`">
            <Button label="Functionality" class="w-full h-5rem text-1xl" icon="pi pi-bolt text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>