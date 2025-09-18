<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'System Interfaces' })

const route = useRoute(),
    { organizationslug, solutionslug, pegs } = route.params as {
        organizationslug: string
        solutionslug: string
        pegs: string
    },
    interfaceCards = [
        {
            label: 'Schemas',
            icon: 'i-lucide-braces',
            reqId: 'S.3.1.',
            path: `/o/${organizationslug}/${solutionslug}/${pegs}/interface/interface-schema`
        },
        {
            label: 'Application Programming Interfaces (APIs)',
            icon: 'i-lucide-network',
            reqId: 'S.3.2.',
            path: `/o/${organizationslug}/${solutionslug}/${pegs}/interface/api`
        },
        {
            label: 'User Interfaces (UIs)',
            icon: 'i-lucide-layout',
            reqId: 'S.3.3.',
            disabled: true
        },
        {
            label: 'Command Line Interfaces (CLIs)',
            icon: 'i-lucide-terminal',
            reqId: 'S.3.4.',
            disabled: true
        }
    ]
</script>

<template>
    <PegsLanding
        :cards="interfaceCards"
        :solutionslug="solutionslug"
        :organizationslug="organizationslug"
    >
        <template #header>
            <h1>Interfaces</h1>
            <p>
                The set of related interface artifacts that enable communication with the system components.
            </p>
        </template>
    </PegsLanding>
</template>
