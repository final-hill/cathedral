<script lang="ts" setup>
useHead({ title: 'Solution' })
definePageMeta({ name: 'Solution' })

const solutionSlug = useRoute().params.solutionSlug as string

const links = [
    { name: 'Project', icon: 'pi-box', label: 'Project' },
    { name: 'Environment', icon: 'pi-cloud', label: 'Environment' },
    { name: 'Goals', icon: 'pi-bullseye', label: 'Goals' },
    { name: 'System', icon: 'pi-sitemap', label: 'System' }
]
</script>

<template>
    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name" :to="{ name: link.name, params: { solutionSlug } }"
            class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>