<script setup lang="ts">
import { ReqType } from '#shared/domain/requirements/ReqType'
import { InterfaceSchema } from '#shared/domain/requirements/InterfaceSchema'
import { z } from 'zod'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Interface Data Types' })

const route = useRoute(),
    { organizationslug, solutionslug } = route.params as {
        organizationslug: string
        solutionslug: string
    },
    { data: requirements, refresh, status } = await useApiRequest({ url: `/api/requirements/${ReqType.INTERFACE_SCHEMA}`, options: {
        query: {
            solutionSlug: solutionslug,
            organizationSlug: organizationslug
        },
        schema: z.array(InterfaceSchema)
    } })
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
