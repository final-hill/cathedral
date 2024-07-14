<script lang="ts" setup>
useHead({ title: 'Project' })
definePageMeta({ name: 'Project' })

const slug = useRoute().params.slug as string,
    links = [
        { name: 'Roles & Personnel', icon: 'pi-users', label: 'Roles & Personnel' }
    ]
</script>
<template>
    <p>
        A Project is the set of human processes involved in the planning, construction,
        revision, and operation of a system
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name" :to="{ name: link.name, params: { slug } }"
            class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>