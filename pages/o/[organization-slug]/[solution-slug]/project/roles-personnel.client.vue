<script lang="ts" setup>
import { Person } from '~/server/domain/requirements';

useHead({ title: 'Roles & Personnel' })
definePageMeta({ name: 'Roles & Personnel' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Roles & Personnel').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: personnel, refresh, status, error: getPersonnelError } = await useFetch<Person[]>(`/api/persons`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getPersonnelError.value)
    $eventBus.$emit('page-error', getPersonnelError.value)

const onCreate = async (data: Person) => {
    await $fetch(`/api/persons`, {
        method: 'POST',
        body: {
            ...data,
            solutionId,
            statement: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onUpdate = async (data: Person) => {
    await $fetch(`/api/persons/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId,
            statement: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh();
}

const onDelete = async (id: string) => {
    await $fetch(`/api/persons/${id}`, {
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
        :on-update="onUpdate" :on-delete="onDelete" :loading="status === 'pending'">
    </XDataTable>
</template>