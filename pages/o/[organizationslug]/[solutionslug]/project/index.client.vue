<script lang="ts" setup>
useHead({ title: 'Project' })
definePageMeta({ name: 'Project' })

const { solutionslug, organizationslug } = useRoute('Project').params,
    links = [
        { name: 'Roles & Personnel' as const, icon: 'pi-users', label: 'Roles & Personnel', reqId: 'P.1' }
    ]
</script>
<template>
    <p>
        A Project is the set of human processes involved in the planning, construction,
        revision, and operation of a system
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name"
            :to="{ name: link.name, params: { solutionslug, organizationslug } }" class="col-fixed w-2 mr-4"
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