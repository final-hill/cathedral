<script lang="ts" setup>
useHead({ title: 'Goals' })
definePageMeta({ name: 'Goals' })

const { solutionslug, organizationslug } = useRoute('Goals').params

const links = [
    { name: 'Rationale' as const, icon: 'pi-book', label: 'Rationale' },
    { name: 'Outcomes' as const, icon: 'pi-check-circle', label: 'Outcomes' },
    { name: 'Stakeholders' as const, icon: 'pi-users', label: 'Stakeholders' },
    { name: 'Goal Scenarios' as const, icon: 'pi-briefcase', label: 'Scenarios' },
    { name: 'Goals Functionality' as const, icon: 'pi-cog', label: 'Functionality' },
    { name: 'Obstacles' as const, icon: ' pi-exclamation-triangle', label: 'Obstacles' },
    { name: 'Limitations' as const, icon: 'pi-exclamation-circle', label: 'Limitations' }
]
</script>

<template>
    <p>
        Goals are the desired outcomes and needs of an
        organization for which a system must satisfy.
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name"
            :to="{ name: link.name, params: { organizationslug, solutionslug } }" class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>