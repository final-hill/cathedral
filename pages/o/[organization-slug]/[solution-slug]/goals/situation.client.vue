<script lang="ts" setup>
import type { ObstacleViewModel, SolutionViewModel } from '#shared/models';
import { debounce } from '#shared/utils';

useHead({ title: 'Situation' })
definePageMeta({ name: 'Situation' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Situation').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: situations, error: getSituationError } = await useFetch<ObstacleViewModel[]>(`/api/obstacle`, {
    query: { name: 'G.2', solutionId, organizationSlug }
});

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
            organizationSlug,
            name: situation.name,
            description: situation.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e));
}, 500));

const { data: obstacles, refresh, status, error: getObstaclesError } = await useFetch<ObstacleViewModel[]>(`/api/obstacle`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    }).filter((item) => item.reqId !== 'G.2.1')
})

const onCreate = async (data: ObstacleViewModel) => {
    await $fetch(`/api/obstacle`, {
        method: 'POST',
        body: {
            solutionId,
            organizationSlug,
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: ObstacleViewModel) => {
    await $fetch(`/api/obstacle/${data.id}`, {
        method: 'PUT',
        body: {
            solutionId,
            organizationSlug,
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/obstacle/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <form autocomplete="off">
        <h2>G.2.1 Situation</h2>
        <div class="field">
            <p>
                The situation is the current state of affairs that need to be
                addressed by the system created by a project.
            </p>
            <Textarea name="situation" id="situation" class="w-full h-10rem" v-model.trim.lazy="situationDescription" />
        </div>
    </form>

    <h2>Obstacles</h2>
    <p>
        Obstacles are the challenges that prevent the goals from being achieved.
    </p>
    <XDataTable :viewModel="{ reqId: 'text', name: 'text', description: 'text' }"
        :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="obstacles" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'" :organizationSlug="organizationSlug"
        entityName="Obstacle" :showRecycleBin="true">
    </XDataTable>
</template>