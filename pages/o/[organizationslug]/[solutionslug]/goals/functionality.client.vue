<script lang="ts" setup>
import { FunctionalBehavior, MoscowPriority } from '#shared/domain';
import type { z } from 'zod';

useHead({ title: 'Functionality' })
definePageMeta({ name: 'Goals Functionality' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Functionality').params,
    { data: solution, error: getSolutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

const { data: functionalBehaviors, refresh, status, error: getFunctionalBehaviorsError } = await useFetch<z.infer<typeof FunctionalBehavior>[]>(`/api/functional-behavior`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
})

if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);

const viewSchema = FunctionalBehavior.pick({
    reqId: true,
    name: true,
    description: true
})

const createSchema = FunctionalBehavior.pick({
    name: true,
    description: true
})

const editSchema = FunctionalBehavior.pick({
    id: true,
    name: true,
    description: true
})

const onCreate = async (data: z.infer<typeof createSchema>) => {
    await $fetch(`/api/functional-behavior`, {
        method: 'POST',
        body: {
            ...data,
            solutionId,
            organizationSlug,
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: z.infer<typeof editSchema>) => {
    await $fetch(`/api/functional-behavior/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId,
            organizationSlug,
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/functional-behavior/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <h1>Functionality</h1>
    <p>{{ FunctionalBehavior.description }}</p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema"
        :data="functionalBehaviors" :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate"
        :loading="status === 'pending'">
    </XDataTable>
</template>