<script lang="ts" generic="F extends FormSchema" setup>
import type { FormSubmitEvent } from '@nuxt/ui';
import { z } from 'zod';
import { getSchemaFields } from '~/shared/utils';

export type FormSchema = z.ZodObject<{ [key: string]: z.ZodTypeAny }>

const props = defineProps<{
    id?: string,
    disabled?: boolean,
    class?: string,
    schema: F,
    state: Partial<z.output<F>>,
    onSubmit: (data: z.output<F>) => Promise<void>,
    onCancel?: () => void
}>()

// Nuxt UI still doesn't support resetting of a form <https://github.com/nuxt/ui/issues/964#issuecomment-1810253480>

const form = useTemplateRef('form'),
    backupState = reactive(Object.create(props.state)),
    toast = useToast()

const onSubmit = async ({ data }: FormSubmitEvent<z.output<F>>) => {
    await props.onSubmit(data)
    toast.add({
        icon: 'i-lucide-check',
        title: 'Success',
        description: 'Data saved successfully'
    })
}

const onCancel = () => {
    form.value?.clear()
    Object.assign(props.state, backupState)

    if (props.onCancel)
        props.onCancel()
}

const schemaFields = getSchemaFields(props.schema);

// Autocomplete data for UInputMenu
type RouteType = { solutionslug?: string, organizationslug?: string }
const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute().params as RouteType

const autocompleteFetchObjects = await Promise.all(schemaFields.map(async (field) => {
    const reqType = field.reqType;
    if (field.isObject) {
        return {
            [field.key]: await useFetch('/api/autocomplete', {
                query: { solutionSlug, organizationSlug, reqType }
            })
        };
    }
    return {};
})).then(results => results.reduce((acc, result) => ({ ...acc, ...result }), {}));
</script>

<template>
    <UForm ref="form" :id="props.id" :state="props.state" :schema="props.schema as any"
        :class="`gap-4 flex flex-col ${props.class}`" @submit="onSubmit" autocomplete="off" :disabled="props.disabled"
        :aria-disabled="props.disabled ? 'true' : undefined">
        <template v-for="field of schemaFields" :key="field.key">
            <UInput v-if="field.key === 'id'" type="hidden" v-model="props.state.id" name="id" />
            <UFormField v-if="field.key !== 'id'" :label="field.label" :name="field.key" :field="field.key"
                :required="!field.isOptional" :description="field.description"
                :hint="field.isReadOnly ? '(Read Only)' : undefined" size="xl" class="w-full">
                <template #help>
                    <span v-if="field.innerType instanceof z.ZodString && field.maxLength && field.maxLength > 254"
                        :class="{ 'text-error': props.state[field.key]?.length ?? 0 > field.maxLength! }">
                        Max length: {{ props.state[field.key]?.length ?? 0 }}/{{ field.maxLength }}
                    </span>
                </template>
                <UCheckbox v-if="field.innerType instanceof z.ZodBoolean" v-model="props.state[field.key]"
                    class="w-full" />
                <UInput type="text"
                    v-else-if="field.innerType instanceof z.ZodString && field.maxLength && field.maxLength <= 254 && !field.isEmail"
                    v-model.trim="props.state[field.key]" class="w-full" aria-describedby="character-count"
                    :ui="{ trailing: 'pointer-events-none' }">
                    <template #trailing>
                        <div id="character-count" class="text-xs text-muted tabular-nums" aria-live="polite"
                            role="status">
                            {{ props.state[field.key]?.length ?? 0 }}/{{ field.maxLength }}
                        </div>
                    </template>
                </UInput>
                <UTextarea
                    v-else-if="field.innerType instanceof z.ZodString && field.maxLength && field.maxLength > 254 && !field.isEmail"
                    v-model.trim="props.state[field.key]" class="w-full" autoresize>
                </UTextarea>
                <UInput v-else-if="field.isReadOnly" type="text" v-model.trim="props.state[field.key]" disabled
                    tabindex="-1" class="w-full" />
                <UInputNumber v-else-if="field.innerType instanceof z.ZodNumber" v-model.trim="props.state[field.key]"
                    :min="field.min" :max="field.max" class="w-full" />
                <UInput type="datetime-local" v-else-if="field.innerType instanceof z.ZodDate"
                    v-model.trim="props.state[field.key]" class="w-full" />
                <USelect v-else-if="field.isEnum" v-model="props.state[field.key]" :items="field.enumOptions"
                    class="w-full" />
                <UInputMenu v-else-if="field.isObject" v-model="props.state[field.key]"
                    :items="(autocompleteFetchObjects[field.key].data.value || []) as any" value-key="value"
                    :loading="(autocompleteFetchObjects[field.key].status as any) === 'pending'" class="w-full"
                    placeholder="Search for an item" />
                <UInput type="email" v-else-if="field.innerType instanceof z.ZodString && field.isEmail"
                    v-model.trim="props.state[field.key]" class="w-full" />
                <UInput v-else v-model.trim="props.state[field.key]" class="w-full" />
            </UFormField>
        </template>

        <div class="flex gap-2" v-if="!props.disabled">
            <UButton label="Submit" type="submit" color="primary" />
            <UButton label="Cancel" type="reset" @click="onCancel" color="neutral" />
        </div>
    </UForm>
</template>