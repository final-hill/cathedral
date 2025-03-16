<script lang="ts" generic="F extends FormSchema" setup>
import type { AsyncData } from '#app';
import type { FormSubmitEvent, InputMenuItem } from '@nuxt/ui';
import { z } from 'zod';
import { getSchemaFields } from '~/shared/utils';

export type FormSchema = z.ZodObject<{ [key: string]: z.ZodTypeAny }>

const props = defineProps<{
    id?: string,
    class?: string,
    schema: F,
    state: z.infer<F>,
    onSubmit: (data: z.infer<F>) => Promise<void>,
    onCancel?: () => void
}>()

// Nuxt UI still doesn't support resetting of a form <https://github.com/nuxt/ui/issues/964#issuecomment-1810253480>

const form = useTemplateRef('form'),
    backupState = reactive(Object.create(props.state)),
    toast = useToast()

const onSubmit = ({ data }: FormSubmitEvent<z.infer<F>>) => {
    props.onSubmit(data)
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

const autocompleteFetchObjects = schemaFields.reduce((acc, field) => {
    const reqType = field.reqType
    if (field.isObject) {
        acc[field.key] = useFetch('/api/autocomplete', {
            query: { solutionSlug, organizationSlug, reqType },
            transform: (items) => {
                return items.map((item) => ({
                    label: item.name,
                    value: item.id
                }))
            }
        });
    }
    return acc;
}, {} as Record<string, AsyncData<InputMenuItem[], unknown>>);

</script>

<template>
    <UForm ref="form" :id="props.id" :state="props.state" :schema="props.schema"
        :class="`gap-4 flex flex-col ${props.class}`" @submit="onSubmit" autocomplete="off">
        <template v-for="field of schemaFields" :key="field.key">
            <UInput v-if="field.key === 'id'" type="hidden" v-model="props.state.id" name="id" />
            <UFormField v-if="field.key !== 'id'" :label="field.label" :name="field.key" :field="field.key"
                :required="!field.isOptional" :description="field.description"
                :hint="field.isReadOnly ? '(Read Only)' : undefined" size="xl" class="w-full"
                :help="field.innerType instanceof z.ZodString && field.maxLength && field.maxLength > 254 ? `Max length: ${props.state[field.key]?.length ?? 0}/${field.maxLength}` : undefined">

                <UCheckbox v-if="field.innerType instanceof z.ZodBoolean" v-model="props.state[field.key]"
                    class="w-full" />
                <UInput type="text"
                    v-else-if="field.innerType instanceof z.ZodString && field.maxLength && field.maxLength <= 254"
                    v-model.trim="props.state[field.key]" class="w-full" aria-describedby="character-count"
                    :ui="{ trailing: 'pointer-events-none' }">
                    <template #trailing>
                        <div id="character-count" class="text-xs text-(--ui-text-muted) tabular-nums" aria-live="polite"
                            role="status">
                            {{ props.state[field.key]?.length ?? 0 }}/{{ field.maxLength }}
                        </div>
                    </template>
                </UInput>
                <UTextarea
                    v-else-if="field.innerType instanceof z.ZodString && field.maxLength && field.maxLength > 254"
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
                    :items="(autocompleteFetchObjects[field.key].data || []) as any"
                    :loading="(autocompleteFetchObjects[field.key].status as any) === 'pending'" class="w-full"
                    placeholder="Search for an item" />
                <UInput v-else v-model.trim="props.state[field.key]" class="w-full" />
            </UFormField>
        </template>

        <div class="flex gap-2">
            <UButton label="Submit" type="submit" color="primary" />
            <UButton label="Cancel" type="reset" @click="onCancel" color="neutral" />
        </div>
    </UForm>
</template>