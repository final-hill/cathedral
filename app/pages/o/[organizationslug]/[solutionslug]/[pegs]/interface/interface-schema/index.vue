<script setup lang="ts">
import { ReqType } from '#shared/domain/requirements/ReqType'
import type { RequirementType } from '#shared/domain'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Interface Data Types' })

const route = useRoute(),
    { organizationslug, solutionslug, pegs: _pegs } = route.params as {
        organizationslug: string
        solutionslug: string
        pegs: string
    },
    { data: requirements, refresh, status } = await useFetch<RequirementType[]>(`/api/requirements/${ReqType.INTERFACE_SCHEMA}`, {
        query: {
            solutionSlug: solutionslug,
            organizationSlug: organizationslug
        },
        transform: data => data.map(transformRequirementDates)
    })
</script>

<template>
    <article class="space-y-6">
        <header>
            <h1 class="text-3xl font-bold text-highlighted">
                Interface Data Types
            </h1>
            <p class="text-muted mt-1">
                Manage reusable data schemas for interface operations
            </p>
        </header>

        <RequirementList
            :requirements="requirements || []"
            :req-type="ReqType.INTERFACE_SCHEMA"
            :organization-slug="organizationslug"
            :solution-slug="solutionslug"
            :loading="status === 'pending'"
            @refresh="refresh"
        />
    </article>
</template>
