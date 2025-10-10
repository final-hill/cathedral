<script setup lang="ts">
import { z } from 'zod'
import { InterfaceSchema } from '#shared/domain/requirements/InterfaceSchema'
import { ReqType } from '#shared/domain'

const route = useRoute(),
    { organizationslug, solutionslug, _pegs, id } = route.params as {
        organizationslug: string
        solutionslug: string
        _pegs: string
        id: string
    },
    { data: requirement } = await useApiRequest(`/api/requirements/${ReqType.INTERFACE_SCHEMA}/${id}`, {
        query: {
            organizationSlug: organizationslug,
            solutionSlug: solutionslug
        },
        schema: InterfaceSchema
    }),
    innerSchema = InterfaceSchema instanceof z.ZodEffects
        ? InterfaceSchema.innerType()
        : InterfaceSchema

definePageMeta({ middleware: 'auth' })

useHead({
    title: requirement.value?.name ? `${requirement.value.name} - Interface Data Type` : 'Interface Data Type'
})
</script>

<template>
    <RequirementView
        v-if="requirement"
        :requirement="requirement"
        :schema="innerSchema"
    >
        <template #field-schema="{ modelValue }">
            <JsonSchemaEditor
                :model-value="modelValue as object"
                :disabled="true"
            />
        </template>
    </RequirementView>
</template>
