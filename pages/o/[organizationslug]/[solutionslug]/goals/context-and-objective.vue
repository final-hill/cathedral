<script lang="ts" setup>
import { ContextAndObjective } from '#shared/domain';
import { z } from 'zod';

useHead({ title: 'Context and Objective' })
definePageMeta({ name: 'Context and Objective' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Context and Objective').params

const { data: outcomes, error: getOutcomesError } = await useFetch<z.infer<typeof ContextAndObjective>[]>(`/api/context-and-objective`, {
    query: { solutionSlug, organizationSlug }
});

if (getOutcomesError.value || !outcomes.value || outcomes.value.length === 0)
    $eventBus.$emit('page-error', getOutcomesError.value);

const contextAndObjective = outcomes.value![0];

const formSchema = ContextAndObjective.pick({
    description: true
});

type FormSchema = z.infer<typeof formSchema>;

const formState = reactive<FormSchema>({
    description: contextAndObjective.description
});

const onUpdate = async ({ description }: FormSchema) => {
    await $fetch(`/api/context-and-objective/${contextAndObjective.id}`, {
        method: 'PUT',
        body: {
            solutionSlug,
            organizationSlug,
            name: contextAndObjective.name,
            description
        }
    }).catch((e) => $eventBus.$emit('page-error', e));
}
</script>

<template>
    <h1>Context and Objective</h1>

    <p> {{ ContextAndObjective.description }} </p>

    <XForm :schema="formSchema" :state="formState" :onSubmit="onUpdate" />
</template>