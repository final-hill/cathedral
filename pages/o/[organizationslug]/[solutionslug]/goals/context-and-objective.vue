<script lang="ts" setup>
import { Outcome } from '#shared/domain';
import { z } from 'zod';

useHead({ title: 'Context and Objective' })
definePageMeta({ name: 'Context and Objective' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Context and Objective').params

const { data: outcomes, error: getOutcomesError } = await useFetch<z.infer<typeof Outcome>[]>(`/api/outcome`, {
    query: { name: 'G.1', solutionSlug, organizationSlug }
});

if (getOutcomesError.value || !outcomes.value || outcomes.value.length === 0)
    $eventBus.$emit('page-error', getOutcomesError.value);

const contextAndObjective = outcomes.value![0];

const formSchema = Outcome.pick({
    description: true
});

type FormSchema = z.infer<typeof formSchema>;

const formState = reactive<FormSchema>({
    description: contextAndObjective.description
});

const onUpdate = async (data: FormSchema) => {
    await $fetch(`/api/outcome/${contextAndObjective.id}`, {
        method: 'PUT',
        body: {
            solutionSlug,
            organizationSlug,
            name: contextAndObjective.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e));
}
</script>

<template>
    <h1>Context and Objective</h1>

    <p>
        High-level view of the project: organizational context and reason for building the system
    </p>

    <XForm :schema="formSchema" :state="formState" :onSubmit="onUpdate" />
</template>