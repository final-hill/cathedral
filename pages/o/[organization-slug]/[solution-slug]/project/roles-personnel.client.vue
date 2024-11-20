<script lang="ts" setup>
import type { PersonViewModel, SolutionViewModel } from '#shared/models'

useHead({ title: 'Roles & Personnel' })
definePageMeta({ name: 'Roles & Personnel' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Roles & Personnel').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: personnel, refresh, status, error: getPersonnelError } = await useFetch<PersonViewModel[]>(`/api/person`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getPersonnelError.value)
    $eventBus.$emit('page-error', getPersonnelError.value)

const onCreate = async (data: PersonViewModel) => {
    await $fetch(`/api/person`, {
        method: 'POST',
        body: {
            name: data.name ?? 'Anonymous',
            email: data.email ?? 'anonymous@example.com',
            solutionId,
            organizationSlug,
            description: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onUpdate = async (data: PersonViewModel) => {
    await $fetch(`/api/person/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name ?? 'Anonymous',
            email: data.email ?? 'anonymous@example.com',
            solutionId,
            organizationSlug,
            description: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onDelete = async (id: string) => {
    await $fetch(`/api/person/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh();
}
</script>
<template>
    <p>
        Roles & Personnel lists the roles and personnel involved in the project
        along with their responsibilities, availability, and contact information.
    </p>

    <XDataTable :viewModel="{ reqId: 'text', name: 'text', email: 'text' }"
        :createModel="{ name: 'text', email: 'text' }" :editModel="{ id: 'hidden', name: 'text', email: 'text' }"
        :datasource="personnel" :on-create="onCreate" :on-update="onUpdate" :on-delete="onDelete"
        :loading="status === 'pending'" :organizationSlug="organizationSlug" entityName="Person" :showRecycleBin="true">
    </XDataTable>
</template>