<script lang="ts" setup>
import { EnvironmentComponent, ReqType } from '#shared/domain';

useHead({ title: 'Components' })
definePageMeta({ name: 'Environment Components', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Environment Components').params
</script>

<template>
    <h1>Environment Components</h1>
    <p>{{ EnvironmentComponent.description }}</p>

    <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.ENVIRONMENT_COMPONENT"
        :solution-slug="solutionSlug" />
</template>