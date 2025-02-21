<script lang="ts" setup>
import type { OutcomeViewModel, SolutionViewModel } from '#shared/models';
import { debounce } from '~/shared/utils';

useHead({ title: 'Context and Objective' })
definePageMeta({ name: 'Context and Objective' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Context and Objective').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: outcomes, error: getOutcomesError } = await useFetch<OutcomeViewModel[]>(`/api/outcome`, {
    query: { name: 'G.1', solutionId, organizationSlug }
});

if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const contextObjectiveDescription = ref(outcomes.value?.[0].description!),
    contextObjective = outcomes.value![0]

watch(contextObjectiveDescription, debounce(() => {
    contextObjective.description = contextObjectiveDescription.value;
    $fetch(`/api/outcome/${contextObjective.id}`, {
        method: 'PUT',
        body: {
            solutionId,
            organizationSlug,
            name: contextObjective.name,
            description: contextObjective.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e));
}, 500));
</script>

<template>
    <form autocomplete="off">
        <h2>Context and Objective</h2>
        <div class="field">
            <p>
                High-level view of the project: organizational context and reason for building a system
            </p>
            <Textarea name="contextObjective" id="contextObjective" class="w-full h-10rem"
                v-model.trim.lazy="contextObjectiveDescription" />
        </div>
    </form>
</template>