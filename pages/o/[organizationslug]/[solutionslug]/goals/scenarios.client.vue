<script lang="ts" setup>
import { Epic, MoscowPriority } from '#shared/domain'
import type { z } from 'zod';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Scenarios').params

const { data: epics, refresh, status, error: getEpicsError } = await
    useFetch<z.infer<typeof Epic>[]>(`/api/epic`, {
        query: { solutionSlug, organizationSlug },
        transform: (data) => data.map((item) => ({
            ...item,
            lastModified: new Date(item.lastModified),
            creationDate: new Date(item.creationDate)
        }))
    })

if (getEpicsError.value)
    $eventBus.$emit('page-error', getEpicsError.value);

const viewSchema = Epic.pick({
    reqId: true,
    name: true,
    description: true,
    primaryActor: true,
    functionalBehavior: true,
    outcome: true
})

const createSchema = Epic.pick({
    name: true,
    description: true,
    primaryActor: true,
    functionalBehavior: true,
    outcome: true
})

const editSchema = Epic.pick({
    id: true,
    reqId: true,
    name: true,
    description: true,
    primaryActor: true,
    functionalBehavior: true,
    outcome: true
})

const onCreate = async (epic: z.infer<typeof createSchema>) => {
    await $fetch(`/api/epic`, {
        method: 'POST',
        body: {
            ...epic,
            solutionSlug,
            organizationSlug,
            description: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onUpdate = async ({ id, ...data }: z.infer<typeof editSchema>) => {
    await $fetch(`/api/epic/${id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionSlug,
            organizationSlug,
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onDelete = async (id: string) => {
    await $fetch(`/api/epic/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e));
    refresh();
}
</script>

<template>
    <h1>Scenarios</h1>

    <p> {{ Epic.description }} </p>
    <p>
        Before you can begin, you must define one or more
        <NuxtLink class="underline"
            :to="{ name: 'Stakeholders', params: { solutionslug: solutionSlug, organizationslug: organizationSlug } }">
            Stakeholders</NuxtLink>,
        <NuxtLink class="underline"
            :to="{ name: 'Goals Functionality', params: { solutionslug: solutionSlug, organizationslug: organizationSlug } }"
            v-text="'Functional Behaviors'" />,
        and <NuxtLink class="underline"
            :to="{ name: 'Outcomes', params: { solutionslug: solutionSlug, organizationslug: organizationSlug } }">
            Outcomes
        </NuxtLink>
        for the solution.
    </p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="epics"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>