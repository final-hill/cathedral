<script setup lang="ts">
import { z } from 'zod'
import { InterfaceType, ReqType, Interface, WorkflowState } from '#shared/domain'
import { workflowColorMap } from '#shared/utils/workflow-colors'
import type { FormSchema } from '~/components/XForm.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute(),
    { organizationslug, solutionslug, pegs: _pegs, id } = route.params as {
        organizationslug: string
        solutionslug: string
        pegs: string
        id: string
    },
    title = 'Review Interface'

useHead({ title })

const { data: requirement, status, error } = await useApiRequest({ url: `/api/requirements/${ReqType.INTERFACE}/${id}`, options: {
    query: {
        solutionSlug: solutionslug,
        organizationSlug: organizationslug
    },
    schema: Interface
} })

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Interface not found'
    })
}

// Validate that the requirement is in Review state
if (requirement.value && requirement.value.workflowState !== WorkflowState.Review) {
    throw createError({
        statusCode: 403,
        statusMessage: `Cannot review requirement in ${requirement.value.workflowState} state. Only requirements in Review state can be reviewed.`
    })
}

const innerSchema = Interface instanceof z.ZodEffects
        ? Interface.innerType()
        : Interface,
    baseSchema = innerSchema as FormSchema,
    getTypeColor = (type: InterfaceType) => {
        switch (type) {
            case InterfaceType.API: return 'info'
            case InterfaceType.CLI: return 'success'
            case InterfaceType.UI: return 'warning'
            default: return 'neutral'
        }
    }
</script>

<template>
    <RequirementReview
        v-if="requirement"
        :requirement="requirement"
        :schema="baseSchema"
        :req-type="ReqType.INTERFACE"
        :organization-slug="organizationslug"
        :solution-slug="solutionslug"
        :loading="status === 'pending'"
    >
        <!-- Custom field for interface type with color coding -->
        <template #field-interfaceType="{ modelValue }">
            <UBadge
                :color="getTypeColor(modelValue as InterfaceType)"
                :label="modelValue as string"
                variant="subtle"
            />
        </template>

        <!-- Custom field for operations list -->
        <template #field-operations="{ modelValue }">
            <div
                v-if="modelValue && (modelValue as any[]).length > 0"
                class="space-y-2"
            >
                <div
                    v-for="operation in (modelValue as any[])"
                    :key="operation.id"
                    class="flex items-center justify-between p-3 border rounded-lg bg-muted/5"
                >
                    <div>
                        <h4 class="font-medium">
                            {{ operation.name }}
                        </h4>
                        <p class="text-sm text-muted">
                            {{ operation.reqIdPrefix }}{{ operation.id }}
                        </p>
                    </div>
                    <UBadge
                        :color="workflowColorMap[operation.workflowState as keyof typeof workflowColorMap]"
                        :label="operation.workflowState"
                        variant="outline"
                    />
                </div>
            </div>
            <p
                v-else
                class="text-sm text-muted"
            >
                No operations defined
            </p>
        </template>
    </RequirementReview>
</template>
