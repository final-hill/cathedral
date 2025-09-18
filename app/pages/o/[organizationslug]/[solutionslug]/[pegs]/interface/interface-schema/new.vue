<script setup lang="ts">
import { z } from 'zod'
import { ReqType } from '#shared/domain/requirements/ReqType'
import { InterfaceSchema } from '#shared/domain/requirements/InterfaceSchema'
import type { FormSchema } from '~/components/XForm.vue'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Create Interface Data Type' })

const route = useRoute(),
    { organizationslug, solutionslug, pegs: _pegs } = route.params as {
        organizationslug: string
        solutionslug: string
        pegs: string
    },
    innerSchema = InterfaceSchema instanceof z.ZodEffects
        ? InterfaceSchema.innerType()
        : InterfaceSchema,
    baseSchema = innerSchema as FormSchema
</script>

<template>
    <RequirementForm
        :schema="baseSchema"
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
