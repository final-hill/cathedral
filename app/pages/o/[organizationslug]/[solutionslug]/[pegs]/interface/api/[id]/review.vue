<script setup lang="ts">
import { InterfaceType, ReqType, Interface, WorkflowState } from '#shared/domain'
import { workflowColorMap } from '#shared/utils/workflow-colors'

const route = useRoute(),
    { organizationslug, solutionslug, id } = route.params as {
        organizationslug: string
        solutionslug: string
        id: string
    },
    title = 'Review Interface'

useHead({ title })
definePageMeta({
    middleware: 'auth',
    key: route => route.fullPath
})

const { data: requirement, status, error } = await useApiRequest({ url: `/api/requirements/${ReqType.INTERFACE}/${id}`, options: {
    query: {
        solutionSlug: solutionslug,
        organizationSlug: organizationslug
    },
    schema: Interface,
    // Disable cache to ensure we get fresh data after workflow transitions
    getCachedData: () => undefined
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

const getTypeColor = (type: InterfaceType) => {
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
        :schema="Interface"
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
