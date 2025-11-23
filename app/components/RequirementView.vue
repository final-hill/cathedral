<script lang="ts" setup>
import type * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import type { ReqType } from '#shared/domain/requirements/enums'
import type { RequirementType } from '#shared/domain'
import type { WorkflowAction } from '~/types'
import { z } from 'zod'
import { uiBasePathTemplates } from '#shared/domain/requirements/uiBasePathTemplates'
import { XConfirmModal } from '#components'
import { getWorkflowActions } from '~/utils/workflow-actions'

const route = useRoute(),
    router = useRouter(),
    overlay = useOverlay(),
    confirmModal = overlay.create(XConfirmModal, {}),
    props = defineProps<{
        requirement?: req.RequirementType | null
        schema: FormSchema
        loading?: boolean
    }>(),
    { requirement, schema, loading = false } = toRefs(props),
    organizationSlug = computed(() => (route.params as Record<string, string>).organizationslug || ''),
    solutionSlug = computed(() => (route.params as Record<string, string>).solutionslug || ''),
    // Common fields to always omit from display
    commonOmitFields = {
        reqId: true,
        reqIdPrefix: true,
        createdBy: true,
        creationDate: true,
        lastModified: true,
        id: true,
        workflowState: true,
        reqType: true,
        isDeleted: true,
        modifiedBy: true,
        solution: true,
        parsedRequirements: true,
        uiBasePathTemplate: true
    } as const,
    displaySchema = computed(() => {
        const rawSchema = schema.value

        // If it's already a FormSchema (processed), return it as-is
        if (!rawSchema || !('omit' in rawSchema) || typeof rawSchema.omit !== 'function')
            return rawSchema as FormSchema

        return (rawSchema as z.ZodObject<z.ZodRawShape>).omit(commonOmitFields) as FormSchema
    }),
    displayFields = computed(() => {
        if (!displaySchema.value) return []
        return getSchemaFields(displaySchema.value)
    }),
    requirementAsRecord = computed(() => requirement.value as Record<string, unknown>),
    groupedTemplateRequirements = computed(() => {
        const grouped: Record<string, Record<string, Array<{ reqType: string, id: string }>>> = {}

        for (const field of displayFields.value) {
            const fieldValue = requirementAsRecord.value[field.key]
            if (isRequirementArray(fieldValue)) {
                const groupedByType = Object.groupBy(fieldValue, req => req.reqType)
                if (!grouped[field.key])
                    grouped[field.key] = {}

                for (const [key, value] of Object.entries(groupedByType)) {
                    if (value && value.length > 0 && grouped[field.key])
                        grouped[field.key]![key] = value
                }
            }
        }

        return grouped
    }),
    getFieldValue = (key: string) => requirementAsRecord.value[key],
    getObjectName = (value: unknown): string => (value as { name: string })?.name || '',
    getBooleanValue = (value: unknown): boolean => value as boolean,
    getDateValue = (value: unknown): Date => value as Date,
    getStringValue = (value: unknown): string => value as string,
    isRequirementArray = (fieldValue: unknown): fieldValue is Array<{ reqType: string, id: string, name: string }> => {
        return Array.isArray(fieldValue)
            && fieldValue.length > 0
            && typeof fieldValue[0] === 'object'
            && fieldValue[0] !== null
            && 'reqType' in fieldValue[0]
            && 'id' in fieldValue[0]
            && 'name' in fieldValue[0]
    },
    requirementAccordionItems = computed(() => {
        const items: Array<{
            label: string
            value: string
            content?: string
            slot: string
        }> = []

        for (const field of displayFields.value) {
            const fieldValue = getFieldValue(field.key),
                fieldGroup = groupedTemplateRequirements.value[field.key]
            if (isRequirementArray(fieldValue) && fieldGroup) {
                for (const [reqTypeKey, reqs] of Object.entries(fieldGroup)) {
                    if (reqs && reqs.length > 0) {
                        items.push({
                            label: `${snakeCaseToPascalCase(reqTypeKey)} (${reqs.length})`,
                            value: `${field.key}-${reqTypeKey}`,
                            slot: `${field.key}-${reqTypeKey}`
                        })
                    }
                }
            }
        }

        return items
    }),
    getRequirementsForSlot = (slot: string) => {
        const [fieldKey, reqTypeKey] = slot.split('-')
        if (!fieldKey || !reqTypeKey) return []
        const fieldGroup = groupedTemplateRequirements.value[fieldKey]
        return fieldGroup?.[reqTypeKey] || []
    },
    getReqTypeFromSlot = (slot: string) => {
        const [, reqTypeKey] = slot.split('-')
        return reqTypeKey
    },
    basePath = computed(() => {
        if (!requirement.value) return ''
        const template = uiBasePathTemplates[requirement.value.reqType as keyof typeof uiBasePathTemplates]
        return template
            .replace('[org]', organizationSlug.value)
            .replace('[solutionslug]', solutionSlug.value)
    }),
    workflowActions = computed(() => {
        if (!requirement.value) return []

        return getWorkflowActions({
            requirement: requirement.value,
            basePath: basePath.value,
            performWorkflowAction,
            confirmAndPerformAction,
            navigate: (path: string) => router.push(path),
            callbackPropertyName: 'onClick',
            includeViewAction: false
        })
    }),
    { performWorkflowAction } = useWorkflowActions({
        organizationSlug,
        solutionSlug,
        basePath
    }),
    confirmAndPerformAction = async ({ requirement: req, action, confirmMessage }: { requirement: req.RequirementType, action: WorkflowAction, confirmMessage: string }) => {
        const result = await confirmModal.open({
            title: confirmMessage
        }).result

        if (result)
            await performWorkflowAction({ requirement: req, action })
    }
</script>

<template>
    <div class="requirement-view">
        <!-- Loading State -->
        <div
            v-if="loading"
            class="flex items-center justify-center min-h-96"
        >
            <div class="text-center">
                <UIcon
                    name="i-lucide-loader-2"
                    class="w-8 h-8 animate-spin text-muted mx-auto mb-2"
                />
                <p class="text-muted">
                    Loading requirement...
                </p>
            </div>
        </div>

        <!-- Content -->
        <UCard v-else-if="requirement">
            <template #header>
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h1 class="text-2xl font-bold text-highlighted mb-2">
                            {{ requirement.name }}
                        </h1>
                        <div class="flex items-center gap-3">
                            <UBadge
                                v-if="requirement.reqId"
                                :label="requirement.reqId"
                                color="neutral"
                                variant="solid"
                            />
                            <UBadge
                                :label="requirement.workflowState"
                                :color="workflowColorMap[requirement.workflowState]"
                            />
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <UButton
                            v-for="action in workflowActions"
                            :key="action.label"
                            :color="action.color"
                            :icon="action.icon"
                            :label="action.label"
                            @click="action.onClick as () => void"
                        />
                        <UButton
                            color="neutral"
                            variant="ghost"
                            icon="i-lucide-arrow-left"
                            label="Back"
                            @click="$router.back()"
                        />
                    </div>
                </div>
            </template>

            <div class="grid gap-6">
                <!-- Display all fields dynamically based on schema -->
                <template
                    v-for="field in displayFields"
                    :key="field.key"
                >
                    <div v-if="getFieldValue(field.key) != null && !isRequirementArray(getFieldValue(field.key))">
                        <h3 class="text-lg font-semibold">
                            {{ field.label }}
                        </h3>

                        <!-- Custom field slot - allows parent to provide custom display -->
                        <slot
                            v-if="$slots[`field-${field.key}`]"
                            :name="`field-${field.key}`"
                            :field="field"
                            :model-value="getFieldValue(field.key)"
                            :field-key="field.key"
                        />
                        <!-- Default rendering based on field type -->
                        <div v-else-if="field.isObject && getObjectName(getFieldValue(field.key))">
                            <UBadge
                                :label="getObjectName(getFieldValue(field.key))"
                                color="info"
                                variant="soft"
                            />
                        </div>
                        <div v-else-if="field.innerType instanceof z.ZodBoolean">
                            <UCheckbox
                                :model-value="getBooleanValue(getFieldValue(field.key))"
                                disabled
                            />
                        </div>
                        <div v-else-if="field.innerType instanceof z.ZodDate">
                            <time :datetime="getDateValue(getFieldValue(field.key)).toISOString()">
                                {{ getDateValue(getFieldValue(field.key)).toLocaleString() }}
                            </time>
                        </div>
                        <div v-else-if="field.isEnum">
                            <UBadge
                                :label="getStringValue(getFieldValue(field.key))"
                                color="neutral"
                                variant="soft"
                            />
                        </div>
                        <div v-else>
                            <!-- Default display for field values -->
                            <p class="text-muted">
                                {{ getFieldValue(field.key) }}
                            </p>
                        </div>
                    </div>
                </template>

                <!-- Requirements sections -->
                <template
                    v-for="field in displayFields"
                    :key="`requirements-${field.key}`"
                >
                    <div v-if="getFieldValue(field.key) != null && isRequirementArray(getFieldValue(field.key))">
                        <h3 class="text-lg font-semibold mb-4">
                            {{ field.label }}
                        </h3>

                        <!-- Single reqType - show direct list -->
                        <template v-if="requirementAccordionItems.filter(item => item.slot.startsWith(field.key)).length === 1">
                            <RequirementList
                                :requirements="getRequirementsForSlot(requirementAccordionItems.find(item => item.slot.startsWith(field.key))?.slot || '') as RequirementType[]"
                                :req-type="getReqTypeFromSlot(requirementAccordionItems.find(item => item.slot.startsWith(field.key))?.slot || '') as ReqType"
                                :organization-slug="organizationSlug"
                                :solution-slug="solutionSlug"
                                :hide-header="false"
                            />
                        </template>

                        <!-- Multiple reqTypes - show accordion -->
                        <UAccordion
                            v-else-if="requirementAccordionItems.filter(item => item.slot.startsWith(field.key)).length > 1"
                            type="multiple"
                            :items="requirementAccordionItems.filter(item => item.slot.startsWith(field.key))"
                            :unmount-on-hide="false"
                        >
                            <template
                                v-for="item in requirementAccordionItems.filter(item => item.slot.startsWith(field.key))"
                                :key="item.slot"
                                #[item.slot]
                            >
                                <div class="pb-4">
                                    <RequirementList
                                        :requirements="getRequirementsForSlot(item.slot) as RequirementType[]"
                                        :req-type="getReqTypeFromSlot(item.slot) as ReqType"
                                        :organization-slug="organizationSlug"
                                        :solution-slug="solutionSlug"
                                        :hide-header="false"
                                    />
                                </div>
                            </template>
                        </UAccordion>
                    </div>
                </template>
            </div>

            <template #footer>
                <div>
                    <h3 class="text-lg font-semibold mb-4">
                        Audit Information
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted">
                        <div>
                            <strong class="mr-1">Created:</strong>
                            <time :datetime="requirement.creationDate.toISOString()">
                                {{ requirement.creationDate.toLocaleString() }}
                            </time>
                            by {{ requirement.createdBy?.name || 'Unknown User' }}
                        </div>
                        <div>
                            <strong class="mr-1">Last Modified:</strong>
                            <time :datetime="requirement.lastModified.toISOString()">
                                {{ requirement.lastModified.toLocaleString() }}
                            </time>
                            by {{ requirement.modifiedBy?.name || 'Unknown User' }}
                        </div>
                    </div>
                </div>
            </template>
        </UCard>

        <!-- Error/Empty State -->
        <div
            v-else
            class="flex items-center justify-center min-h-96"
        >
            <UEmpty
                icon="i-lucide-alert-circle"
                title="Requirement not found"
                description="The requested requirement could not be found or you may not have permission to view it."
            />
        </div>
    </div>
</template>
