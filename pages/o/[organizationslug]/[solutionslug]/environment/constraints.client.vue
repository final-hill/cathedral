<script lang="ts" setup>
import { useFetch } from 'nuxt/app';
import { Constraint } from '#shared/domain'
import type { z } from 'zod';

useHead({ title: 'Constraints' })
definePageMeta({ name: 'Constraints' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Constraints').params,
    { data: solution, error: getSolutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id,
    { data: constraints, status, refresh, error: getConstraintsError } = await useFetch<z.infer<typeof Constraint>[]>(`/api/constraint`, {
        query: { solutionId, organizationSlug },
        transform: (data) => data.map((item) => ({
            ...item,
            lastModified: new Date(item.lastModified),
            creationDate: new Date(item.creationDate)
        }))
    });

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

if (getConstraintsError.value)
    $eventBus.$emit('page-error', getConstraintsError.value)

const viewSchema = Constraint.pick({
    reqId: true,
    name: true,
    category: true,
    description: true
})

const createSchema = Constraint.pick({
    name: true,
    category: true,
    description: true
})

const editSchema = Constraint.pick({
    id: true,
    reqId: true,
    name: true,
    category: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/constraint`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            category: data.category,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/constraint/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: z.infer<typeof editSchema>) => {
    await $fetch(`/api/constraint/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            description: data.description,
            category: data.category,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}
</script>

<template>
    <h1>Constraints</h1>
    <p> {{ Constraint.description }} </p>
    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="constraints"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>