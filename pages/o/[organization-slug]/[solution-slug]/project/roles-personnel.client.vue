<script lang="ts" setup>
import { Person } from '~/server/domain/requirements/Person.js';

useHead({ title: 'Roles & Personnel' })
definePageMeta({ name: 'Roles & Personnel' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Roles & Personnel').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: personnel, refresh, status, error: getPersonnelError } = await useFetch<Person[]>(`/api/person`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getPersonnelError.value)
    $eventBus.$emit('page-error', getPersonnelError.value)

const onCreate = async (data: Person) => {
    await $fetch(`/api/person`, {
        method: 'POST',
        body: {
            name: data.name ?? 'Anonymous',
            email: data.email ?? 'anonymous@example.com',
            solutionId,
            description: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onUpdate = async (data: Person) => {
    await $fetch(`/api/person/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name ?? 'Anonymous',
            email: data.email ?? 'anonymous@example.com',
            solutionId,
            description: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onDelete = async (id: string) => {
    await $fetch(`/api/person/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh();
}
</script>
<template>
    <p>
        Roles & Personnel lists the roles and personnel involved in the project
        along with their responsibilities, availability, and contact information.
    </p>

    <XDataTable :viewModel="{ name: 'text', email: 'text' }" :createModel="{ name: 'text', email: 'text' }"
        :editModel="{ id: 'hidden', name: 'text', email: 'text' }" :datasource="personnel" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'" :organizationSlug="organizationslug"
        entityName="Person" :showRecycleBin="true">
    </XDataTable>
</template>