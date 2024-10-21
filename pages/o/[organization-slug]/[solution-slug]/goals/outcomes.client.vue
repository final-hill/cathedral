<script lang="ts" setup>
import { Outcome } from '~/server/domain/requirements/Outcome.js';

useHead({ title: 'Outcomes' })
definePageMeta({ name: 'Outcomes' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Outcomes').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: outcomes, refresh, status, error: getOutcomesError } = await useFetch<Outcome[]>(`/api/outcomes`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const onCreate = async (data: Outcome) => {
    await $fetch(`/api/outcomes`, {
        method: 'POST',
        body: {
            solutionId,
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: Outcome) => {
    await $fetch(`/api/outcomes/${data.id}`, {
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
    await $fetch(`/api/outcomes/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        Outcomes are the expected benefits, capabilities, or processes
        of the system that will be achieved by the associated project.
    </p>

    <XDataTable :viewModel="{ name: 'text', description: 'text' }" :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="outcomes" :onCreate="onCreate"
        :onUpdate="onUpdate" :onDelete="onDelete" :loading="status === 'pending'" :organizationSlug="organizationslug"
        entityName="Outcome" :showRecycleBin="true">
    </XDataTable>
</template>