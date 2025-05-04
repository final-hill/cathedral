<script lang="ts" setup>
import { Functionality, ReqType } from '#shared/domain';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Functionality', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Functionality').params

const tabs = [
    { label: 'Functional Behaviors', slot: 'functional-behaviors' },
    { label: 'Non-Functional Behaviors', slot: 'non-functional-behaviors' }
]
</script>

<template>
    <h1>Functionality</h1>
    <p>{{ Functionality.description }}</p>

    <UTabs :items="tabs">
        <template #functional-behaviors>
            <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.FUNCTIONAL_BEHAVIOR"
                :solution-slug="solutionSlug" />
        </template>
        <template #non-functional-behaviors>
            <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.NON_FUNCTIONAL_BEHAVIOR"
                :solution-slug="solutionSlug" />
        </template>
    </UTabs>
</template>