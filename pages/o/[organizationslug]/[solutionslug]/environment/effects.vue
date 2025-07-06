<script lang="ts" setup>
import { Effect, ReqType } from '~/shared/domain'

useHead({ title: 'Effects' })
definePageMeta({ name: 'Effects', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Effects').params
</script>

<template>
    <div>
        <h1>E.5 Effects</h1>
        <p>{{ Effect.description }}</p>

        <XWorkflow
            :organization-slug="organizationSlug"
            :req-type="ReqType.EFFECT"
            :solution-slug="solutionSlug"
        />
    </div>
</template>
