<script lang="ts" setup>
useHead({ title: 'System' })
definePageMeta({ name: 'System', middleware: 'auth' })

const { solutionslug, organizationslug } = useRoute('System').params

const links = [
    { name: 'System Components' as const, icon: 'i-lucide-blocks', label: 'Components', reqId: 'S.1' },
    { name: 'Functionality' as const, icon: 'i-lucide-square-function', label: 'Functionality', reqId: 'S.2' },
    { name: 'Scenarios' as const, icon: 'i-lucide-list', label: 'Scenarios', reqId: 'S.4' },
]
</script>

<template>
    <PegsLanding :cards="links" :solutionslug="solutionslug" :organizationslug="organizationslug">
        <template #header>
            <h1>
                System
            </h1>

            <p>
                The set of related artifacts that work together achieve the desired outcomes of the organization.
            </p>
        </template>
    </PegsLanding>
</template>