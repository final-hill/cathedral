<script lang="ts" setup>
type ObstacleViewModel = {
    id: string;
    name: string;
    description: string;
};

useHead({ title: 'Situation' })
definePageMeta({ name: 'Situation' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Situation').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: situations, error: getSituationError } = await useFetch<ObstacleViewModel[]>(`/api/obstacle`, { query: { name: 'G.2', solutionId } });

if (getSituationError.value)
    $eventBus.$emit('page-error', getSituationError.value);

const situationDescription = ref(situations.value?.[0].description!),
    situation = situations.value![0]

watch(situationDescription, debounce(() => {
    situation.description = situationDescription.value;
    $fetch(`/api/obstacle/${situation.id}`, {
        method: 'PUT',
        body: {
            solutionId,
            name: situation.name,
            description: situation.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e));
}, 500));
</script>

<template>
    <form autocomplete="off">
        <h2>Situation</h2>
        <div class="field">
            <p>
                The situation is the current state of affairs that need to be
                addressed by the system created by a project.
            </p>
            <Textarea name="situation" id="situation" class="w-full h-10rem" v-model.trim.lazy="situationDescription" />
        </div>
    </form>
</template>