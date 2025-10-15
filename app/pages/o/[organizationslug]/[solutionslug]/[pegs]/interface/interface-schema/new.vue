<script setup lang="ts">
import { ReqType } from '#shared/domain/requirements/ReqType'
import { InterfaceSchema } from '#shared/domain/requirements/InterfaceSchema'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Create Interface Data Type' })

const route = useRoute(),
    { organizationslug, solutionslug, pegs: _pegs } = route.params as {
        organizationslug: string
        solutionslug: string
        pegs: string
    }
</script>

<template>
    <RequirementForm
        :schema="InterfaceSchema"
        :req-type="ReqType.INTERFACE_SCHEMA"
        :organization-slug="organizationslug"
        :solution-slug="solutionslug"
        :is-edit="false"
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
