<script lang="ts" setup>
import { Limit } from '~/server/domain/requirements/Limit';

useHead({ title: 'Limitations' })
definePageMeta({ name: 'Limitations' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Limitations').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: limits, status, refresh, error: getLimitsError } = await useFetch<Limit[]>(`/api/limits`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getLimitsError.value)
    $eventBus.$emit('page-error', getLimitsError.value)

const onCreate = async (data: Limit) => {
    await $fetch(`/api/limits`, {
        method: 'POST',
        body: {
            solutionId,
            name: data.name,
            statement: data.statement
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: Limit) => {
    await $fetch(`/api/limits/${data.id}`, {
        method: 'PUT', body: {
            solutionId,
            id: data.id,
            name: data.name,
            statement: data.statement
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/limits/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>
<template>
    <p>
        Limitations are the constraints on functionality. They describe What that is out-of-scope and excluded.
        Example: "Providing an interface to the user to change the color of the background is out-of-scope."
    </p>

    <XDataTable :viewModel="{ name: 'text', statement: 'text' }" :createModel="{ name: 'text', statement: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', statement: 'text' }" :datasource="limits" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'">
    </XDataTable>
</template>