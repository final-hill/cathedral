<script lang="ts" setup>
useHead({ title: 'System' })
definePageMeta({ name: 'System' })

const { solutionslug, organizationslug } = useRoute('System').params

const links = [
    { name: 'System Components' as const, icon: 'pi-sitemap', label: 'Components', reqId: 'S.1' },
    { name: 'Functionality' as const, icon: 'pi-bolt', label: 'Functionality', reqId: 'S.2' },
    { name: 'Scenarios' as const, icon: 'pi-list', label: 'Scenarios', reqId: 'S.4' },
]
</script>

<template>
    <h1>System</h1>

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