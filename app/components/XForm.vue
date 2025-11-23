<script lang="ts" generic="F extends FormSchema" setup>
import type { FormSubmitEvent, FormError, FormErrorEvent, SelectItem, InferInput, InferOutput } from '@nuxt/ui'
import { z } from 'zod'
import { getSchemaFields } from '#shared/utils'
import * as refs from '#shared/domain/requirements/EntityReferences'
import { AppUserReference } from '#shared/domain/application/EntityReferences'
import { ReqType } from '#shared/domain/requirements/enums'
import { computeStakeholderCategory } from '#shared/domain/requirements/stakeholderUtils'
import type { StakeholderType } from '#shared/domain/requirements'

export type FormSchema = z.ZodObject<{ [key: string]: z.ZodType }>

type AutocompleteItem = {
    label: string
    value: unknown | undefined
}

const props = defineProps<{
        id?: string
        disabled?: boolean
        class?: string
        schema: F
        state: Partial<z.output<F>>
        attach?: boolean
        autocompleteContext?: Record<string, string> // Additional context for autocomplete
    }>(),
    emit = defineEmits<{
        'update:state': [value: Partial<z.output<F>>]
        'submit': [data: z.output<F>]
        'cancel': []
    }>(),
    // Nuxt UI doesn't support resetting of a form
    // https://github.com/nuxt/ui/issues/964#issuecomment-1810253480
    form = useTemplateRef('form'),
    localState = reactive({ ...props.state }) as z.output<F>,
    backupState = reactive(Object.create(props.state)),
    toast = useToast(),
    isSubmitting = ref(false),
    isValidating = ref(false),
    // Store validation functions from child components (e.g., ScenarioStepsEditor)
    childValidators = ref<Map<string, () => Promise<{ isValid: boolean, message?: string }>>>(new Map())

watch(localState, (newState) => {
    emit('update:state', newState)
}, { deep: true })

watch(() => props.state, (newState) => {
    Object.assign(localState, newState)
}, { deep: true, immediate: true })

// FIXME: <https://github.com/final-hill/cathedral/issues/720>
//
// Special handling for Stakeholder forms: auto-compute category from interest and influence
// Detect if this is a Stakeholder form by checking if the schema has interest, influence, and category fields
const isStakeholderForm = computed(() => {
    const fields = schemaFields.map(f => f.key)
    return fields.includes('interest') && fields.includes('influence') && fields.includes('category')
})

watch(localState, (state) => {
    if (isStakeholderForm.value) {
        const stakeholderState = state as Partial<StakeholderType>
        if (typeof stakeholderState.interest === 'number' && typeof stakeholderState.influence === 'number') {
            const newCategory = computeStakeholderCategory({
                interest: stakeholderState.interest,
                influence: stakeholderState.influence
            })
            stakeholderState.category = newCategory
        }
    }
}, { deep: true })

// Custom validation function to run child component validators
const customValidate = async (_state: Partial<InferInput<F>>): Promise<FormError[]> => {
        const errors: FormError[] = []

        // Set validation loading state if there are child validators to run
        if (childValidators.value.size > 0)
            isValidating.value = true

        try {
            // Run all child component validators
            for (const [fieldName, validator] of childValidators.value) {
                try {
                    const result = await validator()
                    if (!result.isValid) {
                        errors.push({
                            name: fieldName,
                            message: result.message || 'Invalid content - please check the data you entered'
                        })
                    }
                } catch (error) {
                    console.error(`Validation error for field ${fieldName}:`, error)
                    toast.add({
                        icon: 'i-lucide-alert-circle',
                        title: 'Validation Error',
                        description: `Field "${fieldName}" validation failed - please check your input`,
                        color: 'error'
                    })
                    errors.push({
                        name: fieldName,
                        message: 'Validation failed - please try again'
                    })
                }
            }
        } finally {
            isValidating.value = false
        }

        return errors
    },
    // Function to register a child validator
    registerChildValidator = ({ fieldName, validator }: { fieldName: string, validator: () => Promise<{ isValid: boolean, message?: string }> }) => {
        childValidators.value.set(fieldName, validator)
    }
    // Function to unregister a child validator (for future use)
    // unregisterChildValidator = (fieldName: string) => {
    //     childValidators.value.delete(fieldName)
    // }

// Clean up validators when component unmounts
onBeforeUnmount(() => {
    childValidators.value.clear()
})

const onSubmit = async ({ data }: FormSubmitEvent<InferOutput<F>>) => {
        isSubmitting.value = true
        try {
            // Trim all string values before submission
            // eslint-disable-next-line max-params
            const trimmedData = Object.keys(data).reduce((acc, key) => {
                const value = data[key as keyof typeof data]
                if (typeof value === 'string')
                    acc[key as keyof InferOutput<F>] = value.trim() as InferOutput<F>[keyof InferOutput<F>]
                else
                    acc[key as keyof InferOutput<F>] = value as InferOutput<F>[keyof InferOutput<F>]

                return acc
            }, {} as InferOutput<F>)

            emit('submit', trimmedData as z.output<F>)

            toast.add({
                icon: 'i-lucide-check',
                title: 'Success',
                description: 'Data saved successfully'
            })
        } catch (error) {
            console.error('Error in XForm onSubmit:', error)
            toast.add({
                icon: 'i-lucide-alert-triangle',
                title: 'Submission Error',
                description: 'Failed to submit form - please try again',
                color: 'error'
            })
        // Error handling is done by the parent component
        // The toast error will be shown by the error handler
        } finally {
            isSubmitting.value = false
        }
    },
    onCancel = () => {
        form.value?.clear()
        Object.assign(localState, backupState)
        emit('cancel')
    },
    onError = (event: FormErrorEvent) => {
        console.error('Form validation errors:', event.errors)
        toast.add({
            icon: 'i-lucide-x-circle',
            title: 'Form Validation Failed',
            description: 'Please correct the highlighted errors and try again',
            color: 'error'
        })
    },
    schemaFields = getSchemaFields(props.schema),

    // Helper function to add empty option for optional select fields
    getSelectOptions = (field: { isOptional: boolean, enumOptions?: unknown[] }): SelectItem[] => {
        if (field.isOptional && field.enumOptions) {
            return [{ label: '-None-', value: undefined }, ...field.enumOptions.map((option: unknown) =>
                typeof option === 'string' ? { label: option, value: option } : option as SelectItem
            )]
        }
        return field.enumOptions?.map((option: unknown) =>
            typeof option === 'string' ? { label: option, value: option } : option as SelectItem
        ) || []
    },
    // Helper function to add empty option for autocomplete fields
    getAutocompleteOptions = ({ items, isOptional, isMultiple = false }: { items: AutocompleteItem[], isOptional: boolean, isMultiple?: boolean }): AutocompleteItem[] => {
        // Don't add -None- option for multi-select fields since they can be left empty
        if (isOptional && items.length > 0 && !isMultiple)
            return [{ label: '-None-', value: undefined }, ...items]

        return items
    }

// Autocomplete data for UInputMenu
type RouteType = { solutionslug?: string, organizationslug?: string }
const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute().params as RouteType,
    AutocompleteResponseSchema = z.array(z.object({
        label: z.string(),
        value: z.unknown().optional()
    })),
    autocompleteFetchObjects = await Promise.all(schemaFields.map(async (field) => {
        const reqType = field.reqType,
            entityType = field.entityType

        if ((field.isObject || field.isArrayOfObjects) && (reqType || entityType)) {
            // Handle special case for app_user entity type
            if (entityType === 'app_user') {
                return {
                    [field.key]: await useApiRequest({ url: '/api/autocomplete', options: {
                        schema: AutocompleteResponseSchema,
                        query: {
                            solutionSlug,
                            organizationSlug,
                            entityType: 'app_user'
                        },
                        transform: (data: { label: string, value?: unknown }[]) => data.map(item => ({
                            ...item,
                            value: item.value ? AppUserReference.parse(item.value) : item.value
                        })),
                        errorMessage: `Failed to load autocomplete data for ${field.label}`
                    } })
                }
            }

            // Handle regular requirement types
            if (reqType) {
                const reqTypeSnakeCase = slugToSnakeCase(reqType),
                    reqTypeValue = reqTypeSnakeCase.toUpperCase() as keyof typeof ReqType,
                    actualReqType = ReqType[reqTypeValue],
                    ReqTypePascal = snakeCaseToPascalCase(actualReqType) as keyof typeof refs,
                    RequirementReferenceSchema = `${ReqTypePascal}Reference` as keyof typeof refs,
                    RequirementSchema = refs[RequirementReferenceSchema]

                return {
                    [field.key]: await useApiRequest({ url: '/api/autocomplete', options: {
                        schema: AutocompleteResponseSchema,
                        query: {
                            solutionSlug,
                            organizationSlug,
                            reqType
                        },
                        transform: (data: { label: string, value?: unknown }[]) => data.map(item => ({
                            ...item,
                            value: item.value ? RequirementSchema.parse(item.value) : item.value
                        })),
                        errorMessage: `Failed to load autocomplete data for ${field.label}`
                    } })
                }
            }
        }
        return {}
    // eslint-disable-next-line max-params
    })).then(results => results.reduce((acc, result) => ({ ...acc, ...result }), {}))

// Auto-populate form fields from autocompleteContext when data is available
watch(
    () => autocompleteFetchObjects,
    () => {
        if (props.autocompleteContext) {
            Object.entries(props.autocompleteContext).forEach(([fieldKey, expectedId]) => {
                const autocompleteData = autocompleteFetchObjects[fieldKey]?.data.value as AutocompleteItem[]
                if (autocompleteData && Array.isArray(autocompleteData)) {
                    const matchingItem = autocompleteData.find(item =>
                        item.value && typeof item.value === 'object' && 'id' in item.value
                        && (item.value as { id: string }).id === expectedId
                    )
                    if (matchingItem && matchingItem.value)
                        (localState as Record<string, unknown>)[fieldKey] = matchingItem.value
                }
            })
        }
    },
    { deep: true, immediate: true }
)
</script>

<template>
    <UForm
        :id="props.id"
        ref="form"
        :state="localState as any"
        :schema="props.schema as any"
        :validate="customValidate"
        :class="`gap-4 flex flex-col ${props.class}`"
        autocomplete="off"
        :disabled="props.disabled"
        :attach="props.attach ?? true"
        :aria-disabled="props.disabled ? 'true' : undefined"
        @submit="onSubmit"
        @error="onError"
    >
        <template
            v-for="field of schemaFields"
            :key="field.key"
        >
            <UInput
                v-if="field.key === 'id'"
                v-model="(localState as any).id"
                type="hidden"
                name="id"
            />
            <UFormField
                v-if="field.key !== 'id'"
                :label="field.label"
                :name="field.key"
                :field="field.key"
                :required="!field.isOptional"
                :description="field.description"
                :hint="field.isReadOnly ? '(Read Only)' : undefined"
                size="xl"
                class="w-full"
            >
                <template
                    v-if="field.maxLength && field.maxLength > 254"
                    #help
                >
                    <span
                        v-if="field.maxLength && field.maxLength > 254"
                        :class="{ 'text-error': (localState as any)[field.key]?.length ?? 0 > field.maxLength! }"
                    >
                        Max length: {{ (localState as any)[field.key]?.length ?? 0 }}/{{ field.maxLength }}
                    </span>
                </template>
                <UCheckbox
                    v-if="field.innerType instanceof z.ZodBoolean"
                    v-model="(localState as any)[field.key]"
                    class="w-full"
                />
                <UInput
                    v-else-if="field.innerType instanceof z.ZodString && field.maxLength && field.maxLength <= 254 && !field.isEmail"
                    v-model="(localState as any)[field.key]"
                    type="text"
                    class="w-full"
                    aria-describedby="character-count"
                    :ui="{ trailing: 'pointer-events-none' }"
                >
                    <template #trailing>
                        <div
                            id="character-count"
                            class="text-xs text-muted tabular-nums"
                            aria-live="polite"
                            role="status"
                        >
                            {{ (localState as any)[field.key]?.length ?? 0 }}/{{ field.maxLength }}
                        </div>
                    </template>
                </UInput>
                <UTextarea
                    v-else-if="field.innerType instanceof z.ZodString && field.maxLength && field.maxLength > 254 && !field.isEmail"
                    v-model="(localState as any)[field.key]"
                    class="w-full"
                    autoresize
                />
                <USelect
                    v-else-if="field.isReadOnly && field.isEnum"
                    v-model="(localState as any)[field.key]"
                    :items="getSelectOptions(field)"
                    disabled
                    class="w-full"
                />
                <UInput
                    v-else-if="field.isReadOnly && !field.isObject && !field.isArrayOfObjects"
                    v-model="(localState as any)[field.key]"
                    type="text"
                    disabled
                    tabindex="-1"
                    class="w-full"
                />
                <UInput
                    v-else-if="field.isReadOnly && field.isObject"
                    :value="(localState as any)[field.key]?.name || ''"
                    type="text"
                    disabled
                    tabindex="-1"
                    class="w-full"
                />
                <UInput
                    v-else-if="field.isReadOnly && field.isArrayOfObjects"
                    :value="((localState as any)[field.key] as any[])?.map(item => item.name).join(', ') || ''"
                    type="text"
                    disabled
                    tabindex="-1"
                    class="w-full"
                />
                <UInputNumber
                    v-else-if="field.innerType instanceof z.ZodNumber"
                    v-model="(localState as any)[field.key]"
                    :min="field.min"
                    :max="field.max"
                    class="w-full"
                />
                <UInput
                    v-else-if="field.innerType instanceof z.ZodDate"
                    v-model="(localState as any)[field.key]"
                    type="datetime-local"
                    class="w-full"
                />
                <USelect
                    v-else-if="field.isEnum"
                    v-model="(localState as any)[field.key]"
                    :items="getSelectOptions(field)"
                    class="w-full"
                />
                <UInput
                    v-else-if="field.isObject && props.disabled"
                    :value="(localState as any)[field.key]?.name || ''"
                    type="text"
                    disabled
                    tabindex="-1"
                    class="w-full"
                />
                <UInput
                    v-else-if="field.isArrayOfObjects && props.disabled"
                    :value="((localState as any)[field.key] as any[])?.map(item => item.name).join(', ') || ''"
                    type="text"
                    disabled
                    tabindex="-1"
                    class="w-full"
                />
                <!-- Custom field slot - allows parent to provide custom editors -->
                <slot
                    v-else-if="$slots[`field-${field.key}`]"
                    :name="`field-${field.key}`"
                    :field="field"
                    :model-value="(localState as any)[field.key]"
                    :disabled="props.disabled"
                    :update-model-value="(value: any) => (localState as any)[field.key] = value"
                    :register-validator="(validator: () => Promise<{ isValid: boolean, message?: string }>) => registerChildValidator({ fieldName: field.key, validator })"
                />
                <UInputMenu
                    v-else-if="field.isObject && !props.disabled"
                    v-model="(localState as any)[field.key]"
                    :items="getAutocompleteOptions({ items: (autocompleteFetchObjects[field.key]?.data.value || []) as AutocompleteItem[], isOptional: field.isOptional })"
                    :loading="(autocompleteFetchObjects[field.key]?.status as any) === 'pending'"
                    value-key="value"
                    class="w-full"
                    placeholder="Search for an item"
                />
                <UInputMenu
                    v-else-if="field.isArrayOfObjects && !props.disabled"
                    v-model="(localState as any)[field.key]"
                    :items="getAutocompleteOptions({ items: (autocompleteFetchObjects[field.key]?.data.value || []) as AutocompleteItem[], isOptional: field.isOptional, isMultiple: true })"
                    :loading="(autocompleteFetchObjects[field.key]?.status as any) === 'pending'"
                    value-key="value"
                    multiple
                    class="w-full"
                    placeholder="Search for items"
                />
                <UInput
                    v-else-if="field.innerType instanceof z.ZodString && field.isEmail"
                    v-model="(localState as any)[field.key]"
                    type="email"
                    class="w-full"
                />
                <UInput
                    v-else
                    v-model="(localState as any)[field.key]"
                    class="w-full"
                />
            </UFormField>
        </template>

        <!-- Generic slot for additional content that's not tied to specific fields -->
        <slot name="additional-content" />

        <UProgress
            v-if="isSubmitting || isValidating"
            animation="carousel"
            class="w-full"
        />

        <UAlert
            v-if="isValidating"
            title="Validating scenario steps..."
            icon="i-lucide-sparkles"
            color="info"
            variant="soft"
        />

        <div
            v-if="!props.disabled"
            class="flex gap-2"
        >
            <UButton
                label="Submit"
                type="submit"
                color="primary"
                :loading="isSubmitting || isValidating"
                :disabled="isSubmitting || isValidating"
            />
            <UButton
                label="Cancel"
                type="reset"
                color="neutral"
                :disabled="isSubmitting || isValidating"
                @click="onCancel"
            />
        </div>
    </UForm>
</template>
