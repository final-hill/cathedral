<script setup lang="ts">
import { z } from 'zod'
import type { InterfaceEntityType, InterfaceOperationType } from '#shared/domain'
import { Interface, ReqType } from '#shared/domain'
import type { FormSchema } from '~/components/XForm.vue'

const innerSchema = Interface instanceof z.ZodEffects
        ? Interface.innerType()
        : Interface,
    // Apply omits specific to API interface editing
    baseSchema = (innerSchema as FormSchema).omit({
        interfaceType: true, // Hide interface type since we're on the API path - it will be set automatically
        operations: true // Hide operations field - handled via custom slot
    })

definePageMeta({ middleware: 'auth' })

const route = useRoute(),
    router = useRouter(),
    { organizationslug, solutionslug, pegs, id } = route.params as {
        organizationslug: string
        solutionslug: string
        pegs: string
        id: string
    },
    { data: interfaceData } = await useFetch<InterfaceEntityType>(`/api/requirements/interface/${id}`, {
        query: {
            solutionSlug: solutionslug,
            organizationSlug: organizationslug
        },
        transform: transformRequirementDates
    }),
    { data: operations, refresh: refreshOperations } = await useFetch<InterfaceOperationType[]>(`/api/requirements/${ReqType.INTERFACE_OPERATION}`, {
        query: {
            organizationSlug: organizationslug,
            solutionSlug: solutionslug,
            interface: id
        },
        transform: data => data.map(transformRequirementDates),
        default: () => []
    }),
    goBack = () => {
        router.push(`/o/${organizationslug}/${solutionslug}/${pegs}/interface/api/${id}`)
    }
</script>

<template>
    <RequirementForm
        :schema="baseSchema"
        :req-type="ReqType.INTERFACE"
        :organization-slug="organizationslug"
        :solution-slug="solutionslug"
        :is-edit="true"
        :requirement="interfaceData"
        @saved="goBack"
        @cancelled="goBack"
    >
        <template #additional-content>
            <div class="space-y-4">
                <h3 class="text-lg font-semibold">
                    Interface Operations
                </h3>
                <RequirementList
                    :requirements="operations || []"
                    :req-type="ReqType.INTERFACE_OPERATION"
                    :organization-slug="organizationslug"
                    :solution-slug="solutionslug"
                    :parent-references="{ interface: id }"
                    @refresh="refreshOperations"
                />
            </div>
        </template>
    </RequirementForm>
</template>
