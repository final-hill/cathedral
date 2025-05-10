<script lang="ts" setup>
useHead({ title: 'Project' })
definePageMeta({ name: 'Project', middleware: 'auth' })

const { solutionslug, organizationslug } = useRoute('Project').params,
    links = [
        { name: 'Roles & Personnel' as const, icon: 'i-lucide-users', label: 'Roles & Personnel', reqId: 'P.1' },
        { name: 'Requirements Process and Report' as const, icon: 'i-lucide-file-text', label: 'Requirements Process and Report', reqId: 'P.7' }
    ]
</script>
<template>
    <PegsLanding :cards="links" :solutionslug="solutionslug" :organizationslug="organizationslug">
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