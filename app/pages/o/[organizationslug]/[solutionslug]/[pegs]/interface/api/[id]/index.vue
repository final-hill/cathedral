<script setup lang="ts">
import { z } from 'zod'
import type { ZodRawShape } from 'zod'
import type { InterfaceEntityType } from '#shared/domain'
import { ReqType, Interface } from '#shared/domain'

definePageMeta({ middleware: 'auth' })

const route = useRoute(),
    { organizationslug, solutionslug, _pegs, id } = route.params as {
        organizationslug: string
        solutionslug: string
        _pegs: string
        id: string
    },
    { data: requirement } = await useFetch<InterfaceEntityType>(`/api/requirements/${ReqType.INTERFACE}/${id}`, {
        query: {
            organizationSlug: organizationslug,
            solutionSlug: solutionslug
        },
        transform: transformRequirementDates
    }),
    innerSchema = Interface instanceof z.ZodEffects
        ? Interface.innerType()
        : Interface,
    // For API interface pages, we don't want to show the interface type since we're already in the API section
    displaySchema = (innerSchema as z.ZodObject<ZodRawShape>).omit({
        interfaceType: true
    })

useHead({
    title: requirement.value?.name ? `${requirement.value.name} - API Interface` : 'API Interface'
})
</script>

<template>
    <div
        v-if="requirement"
        class="space-y-6"
    >
        <!-- Interface Details -->
        <RequirementView
            :requirement="requirement"
            :schema="displaySchema"
        />
    </div>
</template>
