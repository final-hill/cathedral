<script lang="ts" setup>
import { Person } from '#shared/domain'
import type { z } from 'zod'

useHead({ title: 'Roles & Personnel' })
definePageMeta({ name: 'Roles & Personnel' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Roles & Personnel').params,
    { data: solution, error: getSolutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: personnel, refresh, status, error: getPersonnelError } = await useFetch<z.infer<typeof Person>[]>(`/api/person`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

if (getPersonnelError.value)
    $eventBus.$emit('page-error', getPersonnelError.value)

const viewSchema = Person.pick({
    name: true,
    email: true
})

const createSchema = Person.pick({
    name: true,
    email: true
})

const editSchema = Person.pick({
    id: true,
    name: true,
    email: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
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

const onUpdate = async (data: z.infer<typeof editSchema>) => {
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
    <h1> Roles &amp; Personnel </h1>
    <p> {{ Person.description }} </p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="personnel"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>