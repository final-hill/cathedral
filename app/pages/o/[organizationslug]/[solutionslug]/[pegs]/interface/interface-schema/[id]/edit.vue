<script setup lang="ts">
import { InterfaceSchema } from '#shared/domain/requirements/InterfaceSchema'
import { ReqType } from '#shared/domain'

definePageMeta({ middleware: 'auth' })

const route = useRoute(),
    { organizationslug, solutionslug, id } = route.params as {
        organizationslug: string
        solutionslug: string
        id: string
    },
    { data: requirement } = await useApiRequest({ url: `/api/requirements/${ReqType.INTERFACE_SCHEMA}/${id}`, options: {
        query: {
            organizationSlug: organizationslug,
            solutionSlug: solutionslug
        },
        schema: InterfaceSchema
    } })

if (!requirement.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Interface Data Type not found'
    })
}

useHead({
    title: requirement.value?.name ? `Edit ${requirement.value.name}` : 'Edit Interface Data Type'
})
</script>

<template>
    <RequirementForm
        :requirement="requirement"
        :schema="InterfaceSchema"
        :req-type="ReqType.INTERFACE_SCHEMA"
        :organization-slug="organizationslug"
        :solution-slug="solutionslug"
        :is-edit="true"
    >
        <!-- Custom JSON Schema editor for schema field -->
        <template #field-schema="{ modelValue, disabled, updateModelValue }">
            <JsonSchemaEditor
                :model-value="modelValue"
                :disabled="disabled"
                @update:model-value="updateModelValue"
            />
        </template>
    </RequirementForm>
</template>
