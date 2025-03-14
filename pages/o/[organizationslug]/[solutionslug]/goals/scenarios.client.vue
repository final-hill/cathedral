<script lang="ts" setup>
import { Epic, Stakeholder, FunctionalBehavior, Outcome, MoscowPriority } from '#shared/domain'
import type { z } from 'zod';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Scenarios').params,
    { data: solution, error: getSolutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const [
    { data: epics, refresh, status, error: getEpicsError },
    { data: roles, error: getRolesError },
    { data: functionalBehaviors, error: getFunctionalBehaviorsError },
    { data: outcomes, error: getOutcomesError },
] = await Promise.all([
    useFetch<z.infer<typeof Epic>[]>(`/api/epic`, {
        query: { solutionId, organizationSlug },
        transform: (data) => data.map((item) => ({
            ...item,
            lastModified: new Date(item.lastModified),
            creationDate: new Date(item.creationDate)
        }))
    }),
    useFetch<z.infer<typeof Stakeholder>[]>(`/api/stakeholder`, { query: { solutionId, organizationSlug } }),
    useFetch<z.infer<typeof FunctionalBehavior>[]>(`/api/functional-behavior`, { query: { solutionId, organizationSlug } }),
    useFetch<z.infer<typeof Outcome>[]>(`/api/outcome`, { query: { solutionId, organizationSlug } })
])

if (getEpicsError.value)
    $eventBus.$emit('page-error', getEpicsError.value);
if (getRolesError.value)
    $eventBus.$emit('page-error', getRolesError.value);
if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);
if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const viewSchema = Epic.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const createSchema = Epic.pick({
    name: true,
    description: true
})

const editSchema = Epic.pick({
    id: true,
    reqId: true,
    name: true,
    description: true
})

const onCreate = async (epic: z.infer<typeof createSchema>) => {
    await $fetch(`/api/epic`, {
        method: 'POST',
        body: {
            ...epic,
            solutionId,
            organizationSlug,
            description: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onUpdate = async (epic: z.infer<typeof editSchema>) => {
    await $fetch(`/api/epic/${epic.id}`, {
        method: 'PUT',
        body: {
            ...epic,
            solutionId,
            organizationSlug,
            description: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onDelete = async (id: string) => {
    await $fetch(`/api/epic/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
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
            :to="{ name: 'Stakeholders', params: { solutionslug: slug, organizationslug: organizationSlug } }">
            Stakeholders</NuxtLink>,
        <NuxtLink class="underline"
            :to="{ name: 'Goals Functionality', params: { solutionslug: slug, organizationslug: organizationSlug } }"
            v-text="'Functional Behaviors'" />,
        and <NuxtLink class="underline"
            :to="{ name: 'Outcomes', params: { solutionslug: slug, organizationslug: organizationSlug } }">Outcomes
        </NuxtLink>
        for the solution.
    </p>

    <XDataTable :viewSchema="viewSchema" :createSchema="createSchema" :editSchema="editSchema" :data="epics"
        :onCreate="onCreate" :onDelete="onDelete" :onUpdate="onUpdate" :loading="status === 'pending'">
    </XDataTable>
</template>