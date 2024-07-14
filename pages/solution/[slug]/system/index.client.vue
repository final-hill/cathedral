<script lang="ts" setup>
useHead({ title: 'System' })
definePageMeta({ name: 'System' })

const slug = useRoute().params.slug as string

const links = [
    { name: 'System Components', icon: 'pi-sitemap', label: 'Components' },
    { name: 'Scenarios', icon: 'pi-list', label: 'Scenarios' },
    { name: 'Functionality', icon: 'pi-bolt', label: 'Functionality' }
]
</script>

<template>
    <h1>System</h1>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name" :to="{ name: link.name, params: { slug } }"
            class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>