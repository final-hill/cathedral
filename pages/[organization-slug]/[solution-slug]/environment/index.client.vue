<script lang="ts" setup>
useHead({ title: 'Environment' })
definePageMeta({ name: 'Environment' })

const solutionSlug = useRoute().params.solutionSlug as string

const links = [
    { name: 'Assumptions', icon: 'pi-sun', label: 'Assumptions' },
    { name: 'Environment Components', icon: 'pi-th-large', label: 'Components' },
    { name: 'Constraints', icon: 'pi-link', label: 'Constraints' },
    { name: 'Effects', icon: 'pi-bolt', label: 'Effects' },
    { name: 'Glossary', icon: 'pi-book', label: 'Glossary' },
    { name: 'Invariants', icon: 'pi-lock', label: 'Invariants' }
]
</script>

<template>
    <p>
        An environment is the set of entities (people, organizations, regulations, devices and other material objects,
        other systems) external to the project or system but with the potential to affect it or be affected by it.
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name" :to="{ name: link.name, params: { solutionSlug } }"
            class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>