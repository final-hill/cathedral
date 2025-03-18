<script lang="ts" setup>
useHead({ title: 'Environment' })
definePageMeta({ name: 'Environment' })

const { solutionslug, organizationslug } = useRoute('Environment').params

const links = [
    { name: 'Glossary' as const, icon: 'i-lucide-book', label: 'Glossary', reqId: 'E.1' },
    { name: 'Environment Components' as const, icon: 'i-lucide-blocks', label: 'Components', reqId: 'E.2' },
    { name: 'Constraints' as const, icon: 'i-lucide-link', label: 'Constraints', reqId: 'E.3' },
    { name: 'Assumptions' as const, icon: 'i-lucide-sunrise', label: 'Assumptions', reqId: 'E.4' },
    { name: 'Effects' as const, icon: 'i-lucide-cloud-lightning', label: 'Effects', reqId: 'E.5' },
    { name: 'Invariants' as const, icon: 'i-lucide-lock-keyhole', label: 'Invariants', reqId: 'E.6' }
]
</script>

<template>
    <PegsLanding :cards="links" :solutionslug="solutionslug" :organizationslug="organizationslug">
        <template #header>
            <h1>
                Environment
            </h1>
            <p>
                An environment is the set of entities (people, organizations, regulations, devices and other material
                objects,
                other systems) external to the project or system but with the potential to affect it or be affected by
                it.
            </p>
        </template>
    </PegsLanding>
</template>