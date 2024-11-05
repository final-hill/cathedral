<script lang="ts" setup>
import debounce from '#shared/debounce';

type ObstacleViewModel = {
    id: string;
    reqId: string;
    name: string;
    description: string;
    lastModified: Date;
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

const { data: obstacles, refresh, status, error: getObstaclesError } = await useFetch<ObstacleViewModel[]>(`/api/obstacle`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    }).filter((item) => item.reqId !== 'G.2.0')
})

const onCreate = async (data: ObstacleViewModel) => {
    await $fetch(`/api/obstacle`, {
        method: 'POST',
        body: {
            solutionId,
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
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/obstacle/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
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

    <h2>Obstacles</h2>
    <p>
        Obstacles are the challenges that prevent the goals from being achieved.
    </p>
    <XDataTable :viewModel="{ reqId: 'text', name: 'text', description: 'text' }"
        :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="obstacles" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'" :organizationSlug="organizationslug"
        entityName="Obstacle" :showRecycleBin="true">
    </XDataTable>
</template>