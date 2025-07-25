<script setup lang="ts">
import type { z } from 'zod'
import { reactive } from 'vue'
import type { ButtonProps, FormSubmitEvent } from '@nuxt/ui'
import { ParsedRequirements } from '~/shared/domain/requirements/ParsedRequirements'
import { getSchemaFields } from '~/shared/utils'
import { ReqType } from '~/shared/domain'

const props = defineProps<{
    organizationSlug: string
    solutionSlug: string
}>()

const requirementsFormSchema = ParsedRequirements.pick({
    description: true
})

type RequirementsFormSchema = z.infer<typeof requirementsFormSchema>

const requirementsFormState = reactive<RequirementsFormSchema>({
    description: ''
})

const schemaField = getSchemaFields(requirementsFormSchema).filter(field => field.key === 'description')[0]

/**
 * The type of the parsed requirements result
 */
export type ParsedRequirementsResult = {
    id: string
    requirementCount: number
}

const isLoading = ref(false),
    parsedResultCount = ref<ParsedRequirementsResult | null>(null),
    parsedResultError = ref<string | null>(null),
    parsedResultActions = ref<ButtonProps[]>([])

async function submitRequirements({ data: { description } }: FormSubmitEvent<RequirementsFormSchema>) {
    try {
        resetRequirements()

        isLoading.value = true

        const parsedResultId = await $fetch(`/api/requirements/${ReqType.PARSED_REQUIREMENTS}/propose`, {
            method: 'PUT',
            body: {
                solutionSlug: props.solutionSlug,
                organizationSlug: props.organizationSlug,
                name: 'Free-Form Requirements',
                description
            }
        }) as string

        const parsedResult = await $fetch(`/api/requirements/${ReqType.PARSED_REQUIREMENTS}/${parsedResultId}`, {
                method: 'GET',
                params: {
                    solutionSlug: props.solutionSlug,
                    organizationSlug: props.organizationSlug
                }
            }) as z.infer<typeof ParsedRequirements>,
            parsedReq = ParsedRequirements.parse({
                ...parsedResult,
                creationDate: new Date(parsedResult.creationDate),
                lastModified: new Date(parsedResult.lastModified)
            })

        parsedResultCount.value = {
            id: parsedResultId,
            requirementCount: parsedReq.requirements.length
        }

        parsedResultActions.value = [{
            label: 'View',
            color: 'neutral',
            variant: 'solid',
            to: {
                name: 'Parsed Requirements Details',
                params: {
                    organizationslug: props.organizationSlug,
                    solutionslug: props.solutionSlug,
                    id: parsedResultId
                }
            }
        }]

        isLoading.value = false
    } catch (error) {
        parsedResultError.value = String(error)
    }
}

function resetRequirements() {
    parsedResultCount.value = null
    parsedResultError.value = null
    isLoading.value = false
    requirementsFormState.description = ''
}
</script>

<template>
    <UCard class="w-2xl m-auto">
        <template #header>
            <h2 class="text-lg font-semibold leading-6">
                Add Requirement
            </h2>

            <p class="mt-4">
                Below you can add a requirement statement. The application will parse the statement and extract one or
                more requirements.
            </p>
        </template>
        <span v-if="isLoading">
            Parsing requirements...
            <UProgress animation="carousel" />
        </span>
        <UAlert
            v-if="parsedResultCount"
            title="Parsing Complete"
            icon="i-lucide-check-circle"
            color="success"
            :description="`Parsed ${parsedResultCount.requirementCount} requirements`"
            :actions="parsedResultActions"
        />
        <UAlert
            v-if="parsedResultError"
            title="Parsing Failed"
            icon="i-lucide-alert-triangle"
            color="error"
            :description="parsedResultError"
        />
        <UForm
            class="flex flex-col gap-6 h-60 mt-4"
            :state="requirementsFormState"
            :schema="requirementsFormSchema"
            @submit.prevent="submitRequirements"
        >
            <UFormField
                label="Statement"
                name="requirements"
                field="requirements"
                size="xl"
                required
            >
                <UTextarea
                    v-model="requirementsFormState.description"
                    class="w-full"
                    :rows="4"
                />

                <template #help>
                    <span :class="{ 'text-error': requirementsFormState.description.length > schemaField.maxLength! }">
                        Max length: {{ requirementsFormState.description.length }}/{{ schemaField.maxLength }}
                    </span>
                </template>
            </UFormField>
            <div class="flex gap-2">
                <UButton
                    type="submit"
                    color="success"
                    label="Submit"
                    size="xl"
                    :disabled="requirementsFormState.description === '' || requirementsFormState.description.length > schemaField.maxLength!"
                />
                <UButton
                    type="button"
                    color="secondary"
                    label="Reset"
                    size="xl"
                    @click="resetRequirements"
                />
            </div>
        </UForm>
    </UCard>
</template>
