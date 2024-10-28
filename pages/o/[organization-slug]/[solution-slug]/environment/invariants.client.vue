<script lang="ts" setup>
interface InvariantViewModel {
    id: string;
    name: string;
    description: string;
    lastModified: Date;
}

useHead({ title: 'Invariants' })
definePageMeta({ name: 'Invariants' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Invariants').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: invariants, refresh, status, error: getInvariantsError } = await useFetch<InvariantViewModel[]>(`/api/invariant`, {
    query: { solutionId },
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
            solutionId
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
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await useFetch(`/api/invariant/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        Invariants are properties that must always be true. They are used to
        constrain the possible states of a system.
    </p>

    <XDataTable :viewModel="{ name: 'text', description: 'text' }" :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="invariants" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'" :organizationSlug="organizationslug"
        entityName="Invariant" :showRecycleBin="true">
    </XDataTable>
</template>