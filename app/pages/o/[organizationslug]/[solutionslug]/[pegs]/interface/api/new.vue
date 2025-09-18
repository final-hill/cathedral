<script setup lang="ts">
import { z } from 'zod'
import { ReqType } from '#shared/domain/requirements/ReqType'
import { Interface, InterfaceType } from '#shared/domain'
import type { FormSchema } from '~/components/XForm.vue'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Create API Interface' })

const route = useRoute(),
    { organizationslug, solutionslug, _pegs } = route.params as {
        organizationslug: string
        solutionslug: string
        _pegs: string
    },

    innerSchema = Interface instanceof z.ZodEffects
        ? Interface.innerType()
        : Interface,
    baseSchema = (innerSchema as FormSchema).omit({
        interfaceType: true, // Hide interface type since we're on the API path - it will be set automatically
        operations: true // Hide operations field - will be managed through RequirementList navigation
    }) as FormSchema,
    // Custom data transformation to inject interfaceType
    onBeforeSave = (data: Record<string, unknown>) => {
        // Mutate the data to include interfaceType
        data.interfaceType = InterfaceType.API
    },
    onSaved = (_savedRequirement: Record<string, unknown>) => {
        // The form component handles navigation
    }
</script>

<template>
    <RequirementForm
        :schema="baseSchema"
        :req-type="ReqType.INTERFACE"
        :organization-slug="organizationslug"
        :solution-slug="solutionslug"
        @before-save="onBeforeSave"
        @saved="onSaved"
    >
        <template #additional-content>
            <div class="mt-6 p-4 bg-muted rounded-lg">
                <h3 class="text-sm font-medium text-muted-foreground mb-2">
                    Operations Management
                </h3>
                <p class="text-sm text-muted-foreground">
                    After creating this interface, you can add operations using the standard requirement workflow.
                </p>
            </div>
        </template>
    </RequirementForm>
</template>
