<script lang="ts" setup>
useHead({ title: 'System' })
definePageMeta({ name: 'System', middleware: 'auth' })

const { solutionslug, organizationslug } = useRoute('System').params

const links = [
    { name: 'System Components' as const, icon: 'i-lucide-blocks', label: 'Components', reqId: 'S.1' },
    { name: 'Functionality' as const, icon: 'i-lucide-square-function', label: 'Functionality', reqId: 'S.2' },
    { name: 'Interfaces' as const, icon: 'i-lucide-plug', label: 'Interfaces', reqId: 'S.3', disabled: true },
    { name: 'Scenarios' as const, icon: 'i-lucide-list', label: 'Scenarios', reqId: 'S.4' },
    { name: 'Prioritization' as const, icon: 'i-lucide-arrow-up-down', label: 'Prioritization', reqId: 'S.5', disabled: true },
    { name: 'Verification and Acceptance Criteria' as const, icon: 'i-lucide-check-circle', label: 'Verification and acceptance criteria', reqId: 'S.6', disabled: true }
]
</script>

<template>
    <PegsLanding
        :cards="links"
        :solutionslug="solutionslug"
        :organizationslug="organizationslug"
    >
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
