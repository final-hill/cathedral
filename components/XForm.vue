<script lang="ts" generic="F extends FormSchema" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { getSchemaFields } from '~/shared/utils'
import { ReqType } from '~/shared/domain/requirements/ReqType'

export type FormSchema = z.ZodObject<{ [key: string]: z.ZodTypeAny }>

const props = defineProps<{
    id?: string
    disabled?: boolean
    class?: string
    schema: F
    state: Partial<z.output<F>>
    onSubmit: (data: z.output<F>) => Promise<void>
    onCancel?: () => void
}>(),
    emit = defineEmits<{
        'update:state': [value: Partial<z.output<F>>]
    }>(),
    // Nuxt UI doesn't support resetting of a form <https://github.com/nuxt/ui/issues/964#issuecomment-1810253480>
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

// Custom validation function to run child component validators
const customValidate = async (): Promise<{ name: string, message: string }[]> => {
        const errors: { name: string, message: string }[] = []

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
    registerChildValidator = (fieldName: string, validator: () => Promise<{ isValid: boolean, message?: string }>) => {
        childValidators.value.set(fieldName, validator)
    },
    // Function to unregister a child validator (for future use)
    _unregisterChildValidator = (fieldName: string) => {
        childValidators.value.delete(fieldName)
    }

// Clean up validators when component unmounts
onBeforeUnmount(() => {
    childValidators.value.clear()
})

const onSubmit = async ({ data }: FormSubmitEvent<z.output<F>>) => {
        isSubmitting.value = true
        try {
            await props.onSubmit(data)
            toast.add({
                icon: 'i-lucide-check',
                title: 'Success',
                description: 'Data saved successfully'
            })
        } catch {
        // Error handling is done by the parent component
        // The toast error will be shown by the error handler
        } finally {
            isSubmitting.value = false
        }
    },
    onCancel = () => {
        form.value?.clear()
        Object.assign(localState, backupState)

        if (props.onCancel) props.onCancel()
    },

    schemaFields = getSchemaFields(props.schema)

// Autocomplete data for UInputMenu
type RouteType = { solutionslug?: string, organizationslug?: string }
const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute().params as RouteType,
    autocompleteFetchObjects = await Promise.all(schemaFields.map(async (field) => {
        const reqType = field.reqType
        if ((field.isObject || (field.isArrayOfObjects && reqType !== ReqType.SCENARIO_STEP)) && reqType) {
            return {
                [field.key]: await useFetch('/api/autocomplete', {
                    query: { solutionSlug, organizationSlug, reqType }
                })
            }
        }
        return {}
    })).then(results => results.reduce((acc, result) => ({ ...acc, ...result }), {}))
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
        :aria-disabled="props.disabled ? 'true' : undefined"
        @submit="onSubmit"
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
                <template #help>
                    <span
                        v-if="field.innerType instanceof z.ZodString && field.maxLength && field.maxLength > 254"
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
                    v-model.trim="(localState as any)[field.key]"
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
                    v-model.trim="(localState as any)[field.key]"
                    class="w-full"
                    autoresize
                />
                <UInput
                    v-else-if="field.isReadOnly"
                    v-model.trim="(localState as any)[field.key]"
                    type="text"
                    disabled
                    tabindex="-1"
                    class="w-full"
                />
                <UInputNumber
                    v-else-if="field.innerType instanceof z.ZodNumber"
                    v-model.trim="(localState as any)[field.key]"
                    :min="field.min"
                    :max="field.max"
                    class="w-full"
                />
                <UInput
                    v-else-if="field.innerType instanceof z.ZodDate"
                    v-model.trim="(localState as any)[field.key]"
                    type="datetime-local"
                    class="w-full"
                />
                <USelect
                    v-else-if="field.isEnum"
                    v-model="(localState as any)[field.key]"
                    :items="field.enumOptions"
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
                    v-else-if="field.isArrayOfObjects && props.disabled && field.reqType !== ReqType.SCENARIO_STEP"
                    :value="((localState as any)[field.key] as any[])?.map(item => item.name).join(', ') || ''"
                    type="text"
                    disabled
                    tabindex="-1"
                    class="w-full"
                />
                <ScenarioStepsEditor
                    v-else-if="field.isArrayOfObjects && field.reqType === ReqType.SCENARIO_STEP"
                    v-model="(localState as any)[field.key]"
                    :label="field.label"
                    :disabled="props.disabled"
                    @validation-ready="(validator) => registerChildValidator(field.key, validator)"
                />
                <UInputMenu
                    v-else-if="field.isObject && !props.disabled"
                    v-model="(localState as any)[field.key]"
                    :items="(autocompleteFetchObjects[field.key].data.value || []) as any"
                    value-key="value"
                    :loading="(autocompleteFetchObjects[field.key].status as any) === 'pending'"
                    class="w-full"
                    placeholder="Search for an item"
                />
                <UInputMenu
                    v-else-if="field.isArrayOfObjects && !props.disabled && field.reqType !== ReqType.SCENARIO_STEP"
                    v-model="(localState as any)[field.key]"
                    :items="(autocompleteFetchObjects[field.key].data.value || []) as any"
                    value-key="value"
                    :loading="(autocompleteFetchObjects[field.key].status as any) === 'pending'"
                    multiple
                    class="w-full"
                    placeholder="Search for items"
                />
                <UInput
                    v-else-if="field.innerType instanceof z.ZodString && field.isEmail"
                    v-model.trim="(localState as any)[field.key]"
                    type="email"
                    class="w-full"
                />
                <UInput
                    v-else
                    v-model.trim="(localState as any)[field.key]"
                    class="w-full"
                />
            </UFormField>
        </template>

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
                :disabled="isSubmitting"
                @click="onCancel"
            />
        </div>
    </UForm>
</template>
