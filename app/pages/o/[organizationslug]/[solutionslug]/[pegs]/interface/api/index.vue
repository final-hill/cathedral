<script setup lang="ts">
import { ReqType } from '#shared/domain/requirements/ReqType'
import { InterfaceType } from '#shared/domain/requirements/InterfaceType'
import type { RequirementType } from '#shared/domain'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'API Interfaces' })

const route = useRoute(),
    { organizationslug, solutionslug, pegs: _pegs } = route.params as {
        organizationslug: string
        solutionslug: string
        pegs: string
    },
    { data: allInterfaces, refresh, status } = await useFetch<RequirementType[]>(`/api/requirements/${ReqType.INTERFACE}`, {
        query: {
            solutionSlug: solutionslug,
            organizationSlug: organizationslug
        },
        transform: data => data.map(transformRequirementDates)
    }),
    apiInterfaces = computed(() => {
        return allInterfaces.value?.filter((interface_: RequirementType & { interfaceType?: InterfaceType }) =>
            interface_.interfaceType === InterfaceType.API
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
