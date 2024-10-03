<script lang="ts" setup>
useHead({ title: 'Environment' })
definePageMeta({ name: 'Environment' })

const { solutionslug, organizationslug } = useRoute('Environment').params

const links = [
    { name: 'Assumptions' as const, icon: 'pi-sun', label: 'Assumptions' },
    { name: 'Environment Components' as const, icon: 'pi-th-large', label: 'Components' },
    { name: 'Constraints' as const, icon: 'pi-link', label: 'Constraints' },
    { name: 'Effects' as const, icon: 'pi-bolt', label: 'Effects' },
    { name: 'Glossary' as const, icon: 'pi-book', label: 'Glossary' },
    { name: 'Invariants' as const, icon: 'pi-lock', label: 'Invariants' }
]
</script>

<template>
    <p>
        An environment is the set of entities (people, organizations, regulations, devices and other material objects,
        other systems) external to the project or system but with the potential to affect it or be affected by it.
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name"
            :to="{ name: link.name, params: { organizationslug, solutionslug } }" class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>