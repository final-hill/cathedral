<script lang="ts" setup>
useHead({ title: 'Project' })
definePageMeta({ name: 'Project', middleware: 'auth' })

const { solutionslug, organizationslug } = useRoute('Project').params,
    links = [
        { name: 'Roles & Personnel' as const, icon: 'i-lucide-users', label: 'Roles & Personnel', reqId: 'P.1' },
        { name: 'Imposed Technical Choices' as const, icon: 'i-lucide-cpu', label: 'Imposed technical choices', reqId: 'P.2', disabled: true },
        { name: 'Schedule and Milestones' as const, icon: 'i-lucide-calendar', label: 'Schedule and milestones', reqId: 'P.3', disabled: true },
        { name: 'Tasks and Deliverables' as const, icon: 'i-lucide-clipboard-list', label: 'Tasks and deliverables', reqId: 'P.4', disabled: true },
        { name: 'Required Technology Elements' as const, icon: 'i-lucide-cog', label: 'Required technology elements', reqId: 'P.5', disabled: true },
        { name: 'Risk and Mitigation Analysis' as const, icon: 'i-lucide-shield-alert', label: 'Risk and mitigation analysis', reqId: 'P.6', disabled: true },
        { name: 'Requirements Process and Report' as const, icon: 'i-lucide-file-text', label: 'Requirements Process and Report', reqId: 'P.7' }
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
                Project
            </h1>
            <p>
                A Project is the set of human processes involved in the planning, construction,
                revision, and operation of a system
            </p>
        </template>
    </PegsLanding>
</template>
