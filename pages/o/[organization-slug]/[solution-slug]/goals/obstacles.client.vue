<script lang="ts" setup>
import { Obstacle } from '~/domain/requirements/Obstacle.js';

useHead({ title: 'Obstacles' })
definePageMeta({ name: 'Obstacles' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Obstacles').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: obstacles, refresh, status, error: getObstaclesError } = await useFetch<Obstacle[]>(`/api/obstacle`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

const onCreate = async (data: Obstacle) => {
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

const onUpdate = async (data: Obstacle) => {
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
    <p>
        Obstacles are the challenges that prevent the goals from being achieved.
    </p>

    <XDataTable :viewModel="{ name: 'text', description: 'text' }" :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="obstacles" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'" :organizationSlug="organizationslug"
        entityName="Obstacle" :showRecycleBin="true">
    </XDataTable>
</template>