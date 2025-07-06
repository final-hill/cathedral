<script lang="ts" setup>
import { ContextAndObjective, ReqType } from '#shared/domain'

useHead({ title: 'Context and Objective' })
definePageMeta({ name: 'Context and Objective', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Context and Objective').params
</script>

<template>
    <div>
        <h1>G.1 Context and Objective</h1>
        <p> {{ ContextAndObjective.description }} </p>

        <XWorkflow
            :organization-slug="organizationSlug"
            :req-type="ReqType.CONTEXT_AND_OBJECTIVE"
            :solution-slug="solutionSlug"
            :disable-new-requirement="true"
        />
    </div>
</template>
