<script lang="ts" setup>
useHead({ title: 'Goals' })
definePageMeta({ name: 'Goals' })

const { solutionslug, organizationslug } = useRoute('Goals').params

const links = [
    { name: 'Context and Objective' as const, icon: 'pi-bullseye', label: 'Context and Objective', reqId: 'G.1' },
    { name: 'Situation' as const, icon: 'pi-search', label: 'Situation', reqId: 'G.2' },
    { name: 'Outcomes' as const, icon: 'pi-check-circle', label: 'Outcomes', reqId: 'G.3' },
    { name: 'Goals Functionality' as const, icon: 'pi-cog', label: 'Functionality', reqId: 'G.4' },
    { name: 'Goal Scenarios' as const, icon: 'pi-briefcase', label: 'Scenarios', reqId: 'G.5' },
    { name: 'Limitations' as const, icon: 'pi-exclamation-circle', label: 'Limitations', reqId: 'G.6' },
    { name: 'Stakeholders' as const, icon: 'pi-users', label: 'Stakeholders', reqId: 'G.7' }
]
</script>

<template>
    <p>
        Goals are the desired outcomes and needs of an
        organization for which a system must satisfy.
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name"
            :to="{ name: link.name, params: { organizationslug, solutionslug } }" class="col-fixed w-2 mr-4"
            v-badge="link.reqId">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>
<style scoped>
:deep(.p-overlay-badge .p-badge) {
    top: 1.8rem;
    left: 0.2rem;
    right: auto;
}
</style>