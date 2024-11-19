<script lang="ts" setup>
import type { InvariantViewModel, SolutionViewModel } from '~/shared/models'

useHead({ title: 'Invariants' })
definePageMeta({ name: 'Invariants' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Invariants').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: invariants, refresh, status, error: getInvariantsError } = await useFetch<InvariantViewModel[]>(`/api/invariant`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getInvariantsError.value)
    $eventBus.$emit('page-error', getInvariantsError.value)

const onCreate = async (data: InvariantViewModel) => {
    await useFetch(`/api/invariant`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: InvariantViewModel) => {
    await useFetch(`/api/invariant/${data.id}`, {
        method: 'PUT', body: {
            id: data.id,
            name: data.name,
            description: data.description,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await useFetch(`/api/invariant/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        Invariants are properties that must always be true. They are used to
        constrain the possible states of a system.
    </p>

    <XDataTable :viewModel="{ reqId: 'text', name: 'text', description: 'text' }"
        :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="invariants" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'" :organizationSlug="organizationSlug"
        entityName="Invariant" :showRecycleBin="true">
    </XDataTable>
</template>