<script setup lang="ts">
import { ReqType } from '#shared/domain/requirements/ReqType'
import { InterfaceType } from '#shared/domain/requirements/InterfaceType'
import { Interface } from '#shared/domain/requirements'
import type { RequirementType } from '#shared/domain'
import { z } from 'zod'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'API Interfaces' })

const route = useRoute(),
    { organizationslug, solutionslug } = route.params as {
        organizationslug: string
        solutionslug: string
    },
    { data: allInterfaces, refresh, status } = await useApiRequest({ url: `/api/requirements/${ReqType.INTERFACE}`, options: {
        query: {
            solutionSlug: solutionslug,
            organizationSlug: organizationslug
        },
        schema: z.array(Interface)
    } }),
    apiInterfaces = computed(() => {
        return allInterfaces.value?.filter((iface: RequirementType & { interfaceType?: InterfaceType }) =>
            iface.interfaceType === InterfaceType.API
        ) || []
    })
</script>

<template>
    <article class="space-y-6">
        <header>
            <h1 class="text-3xl font-bold text-highlighted">
                API Interfaces
            </h1>
            <p class="text-muted mt-1">
                Manage Application Programming Interfaces (APIs)
            </p>
        </header>

        <RequirementList
            :requirements="apiInterfaces || []"
            :req-type="ReqType.INTERFACE"
            :organization-slug="organizationslug"
            :solution-slug="solutionslug"
            :loading="status === 'pending'"
            @refresh="refresh"
        />
    </article>
</template>
