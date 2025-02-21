<script lang="ts" setup>
import type { LimitViewModel, SolutionViewModel } from '#shared/models'

useHead({ title: 'Limitations' })
definePageMeta({ name: 'Limitations' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Limitations').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: limits, status, refresh, error: getLimitsError } = await useFetch<LimitViewModel[]>(`/api/limit`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getLimitsError.value)
    $eventBus.$emit('page-error', getLimitsError.value)

const onCreate = async (data: LimitViewModel) => {
    await $fetch(`/api/limit`, {
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

const onUpdate = async (data: LimitViewModel) => {
    await $fetch(`/api/limit/${data.id}`, {
        method: 'PUT', body: {
            solutionId,
            organizationSlug,
            id: data.id,
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/limit/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>
<template>
    <p>
        Limitations are the constraints on functionality. They describe What that is out-of-scope and excluded.
        Example: "Providing an interface to the user to change the color of the background is out-of-scope."
    </p>

    <XDataTable :viewModel="{ reqId: 'text', name: 'text', description: 'text' }"
        :createModel="{ name: 'text', description: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', description: 'text' }" :datasource="limits" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'" :organizationSlug="organizationSlug"
        entityName="Limit" :showRecycleBin="true">
    </XDataTable>
</template>