<script lang="ts" setup>
type GoalViewModel = {
    id: string;
    name: string;
    description: string;
};

useHead({ title: 'Context and Objective' })
definePageMeta({ name: 'Context and Objective' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Context and Objective').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: goals, error: getGoalsError } = await useFetch<GoalViewModel[]>(`/api/goal`, { query: { name: 'G.1', solutionId } });

if (getGoalsError.value)
    $eventBus.$emit('page-error', getGoalsError.value);

const contextObjectiveDescription = ref(goals.value?.[0].description!),
    contextObjective = goals.value![0]

watch(contextObjectiveDescription, debounce(() => {
    contextObjective.description = contextObjectiveDescription.value;
    $fetch(`/api/goal/${contextObjective.id}`, {
        method: 'PUT',
        body: {
            solutionId,
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