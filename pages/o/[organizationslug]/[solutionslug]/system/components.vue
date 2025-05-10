<script lang="ts" setup>
import { ReqType, SystemComponent } from '#shared/domain';

useHead({ title: 'Components' })
definePageMeta({ name: 'System Components', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('System Components').params
</script>

<template>
    <h1>S.1 System Components</h1>
    <p> {{ SystemComponent.description }} </p>

    <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.SYSTEM_COMPONENT"
        :solution-slug="solutionSlug" />
</template>