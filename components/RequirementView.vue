<script lang="ts" setup>
import type * as req from '#shared/domain/requirements'
import type { FormSchema } from '~/components/XForm.vue'
import { getSchemaFields } from '~/shared/utils'
import type { ReqType } from '#shared/domain/requirements/enums'
import { WorkflowState } from '#shared/domain/requirements/enums'
import { snakeCaseToPascalCase, workflowColorMap } from '#shared/utils'
import type { RequirementType } from '~/shared/domain'
import { z } from 'zod'

const route = useRoute(),
    organizationSlug = computed(() => (route.params as Record<string, string>).organizationslug || ''),
    solutionSlug = computed(() => (route.params as Record<string, string>).solutionslug || ''),
    props = defineProps<{
        requirement?: req.RequirementType | null
        schema: FormSchema
        loading?: boolean
    }>(),
    { requirement, schema, loading = false } = toRefs(props),
    displayFields = computed(() => {
        if (!schema.value) return []
        return getSchemaFields(schema.value)
    }),
    requirementAsRecord = computed(() => requirement.value as Record<string, unknown>),
    groupedTemplateRequirements = computed(() => {
        const grouped: Record<string, Record<string, Array<{ reqType: string, id: string }>>> = {}

        for (const field of displayFields.value) {
            const fieldValue = requirementAsRecord.value[field.key]
            if (isRequirementArray(fieldValue)) {
                const groupedByType = Object.groupBy(fieldValue, req => req.reqType)
                grouped[field.key] = {}
                for (const [key, value] of Object.entries(groupedByType)) {
                    if (value && value.length > 0) {
                        grouped[field.key][key] = value
                    }
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
            const fieldValue = getFieldValue(field.key)
            if (isRequirementArray(fieldValue) && groupedTemplateRequirements.value[field.key]) {
                for (const [reqTypeKey, reqs] of Object.entries(groupedTemplateRequirements.value[field.key])) {
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
        return groupedTemplateRequirements.value[fieldKey]?.[reqTypeKey] || []
    },
    getReqTypeFromSlot = (slot: string) => {
        const [, reqTypeKey] = slot.split('-')
        return reqTypeKey
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
                            v-if="requirement.workflowState === WorkflowState.Proposed || requirement.workflowState === WorkflowState.Active"
                            :to="`${$route.path}/edit`"
                            color="primary"
                            icon="i-lucide-pen"
                            label="Edit"
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
                <div v-if="requirement.description">
                    <h3 class="text-lg font-semibold mb-2">
                        Description
                    </h3>
                    <p class="text-muted whitespace-pre-wrap">
                        {{ requirement.description }}
                    </p>
                </div>

                <!-- Display all other fields dynamically based on schema -->
                <div
                    v-for="field in displayFields"
                    :key="field.key"
                    class="grid gap-2"
                >
                    <template v-if="getFieldValue(field.key) != null && !isRequirementArray(getFieldValue(field.key))">
                        <h3 class="text-lg font-semibold">
                            {{ field.label }}
                        </h3>
                        <div v-if="field.isObject && getObjectName(getFieldValue(field.key))">
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
                            <p class="text-muted">
                                {{ getFieldValue(field.key) }}
                            </p>
                        </div>
                    </template>
                </div>

                <!-- Requirements sections in accordion -->
                <div v-if="requirementAccordionItems.length > 0">
                    <h3 class="text-lg font-semibold mb-4">
                        Requirements
                    </h3>
                    <UAccordion
                        type="multiple"
                        :items="requirementAccordionItems"
                        :unmount-on-hide="false"
                    >
                        <template
                            v-for="item in requirementAccordionItems"
                            :key="item.slot"
                            #[item.slot]
                        >
                            <div class="pb-4">
                                <RequirementList
                                    :requirements="getRequirementsForSlot(item.slot) as RequirementType[]"
                                    :req-type="getReqTypeFromSlot(item.slot) as ReqType"
                                    :organization-slug="organizationSlug"
                                    :solution-slug="solutionSlug"
                                    :hide-header="true"
                                />
                            </div>
                        </template>
                    </UAccordion>
                </div>
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
            <div class="text-center">
                <UIcon
                    name="i-lucide-alert-circle"
                    class="w-8 h-8 text-error mx-auto mb-2"
                />
                <p class="text-muted">
                    Requirement not found
                </p>
            </div>
        </div>
    </div>
</template>
