<script lang="ts" setup>
useHead({ title: 'Goals' })
definePageMeta({ name: 'Goals', middleware: 'auth' })

const { solutionslug, organizationslug } = useRoute('Goals').params

const links = [
    { name: 'Context and Objective' as const, icon: 'i-lucide-target', label: 'Context and Objective', reqId: 'G.1' },
    { name: 'Situation' as const, icon: 'i-lucide-search', label: 'Situation', reqId: 'G.2' },
    { name: 'Outcomes' as const, icon: 'i-lucide-circle-check-big', label: 'Outcomes', reqId: 'G.3' },
    { name: 'Goals Functionality' as const, icon: 'i-lucide-settings', label: 'Functionality', reqId: 'G.4' },
    { name: 'Goal Scenarios' as const, icon: 'i-lucide-briefcase', label: 'Scenarios', reqId: 'G.5' },
    { name: 'Limitations' as const, icon: 'i-lucide-file-warning', label: 'Limitations', reqId: 'G.6' },
    { name: 'Stakeholders' as const, icon: 'i-lucide-users', label: 'Stakeholders', reqId: 'G.7' }
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
                Goals
            </h1>
            <p>
                Goals are the desired outcomes and needs of an
                organization for which a system must satisfy.
            </p>
        </template>
    </PegsLanding>
</template>
