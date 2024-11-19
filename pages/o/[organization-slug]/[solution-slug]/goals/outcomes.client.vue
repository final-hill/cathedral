<script lang="ts" setup>
import type { OutcomeViewModel, SolutionViewModel } from '~/shared/models'

useHead({ title: 'Outcomes' })
definePageMeta({ name: 'Outcomes' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Outcomes').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: outcomes, refresh, status, error: getOutcomesError } = await useFetch<OutcomeViewModel[]>(`/api/outcome`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    }).filter((item) => item.reqId !== 'G.3.1') // FIXME: Filter out the default outcome (Context and Objective)
})

if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const onCreate = async (data: OutcomeViewModel) => {
    await $fetch(`/api/outcome`, {
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

const onUpdate = async (data: OutcomeViewModel) => {
    await $fetch(`/api/outcome/${data.id}`, {
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
    await $fetch(`/api/outcome/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        Outcomes are the expected benefits, capabilities, or processes
        of the system that will be achieved by the associated project.
    </p>

    <XDataTable :viewModel="{ reqId: 'text', name: 'text', description: 'text' }"
        :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="outcomes" :onCreate="onCreate"
        :onUpdate="onUpdate" :onDelete="onDelete" :loading="status === 'pending'" :organizationSlug="organizationSlug"
        entityName="Outcome" :showRecycleBin="true">
    </XDataTable>
</template>