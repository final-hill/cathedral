<script lang="ts" setup>
import { Assumption, Effect, FunctionalBehavior, Outcome, Scenario, Stakeholder, UseCase, UserStory } from '#shared/domain';
import type { z } from 'zod';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Scenarios').params

const tabItems = ref([
    { label: 'User Stories', slot: 'user-stories' },
    { label: 'Use Cases', slot: 'use-cases' }
])

const { data: userStories, refresh: refreshUserStories, error: getUserStoriesError, status: userStoryStatus } = await useFetch<z.infer<typeof UserStory>[]>(`/api/user-story`, {
    query: { solutionSlug, organizationSlug },
    transform: (data) => data.map((item) => ({
        ...item,
        lastModified: new Date(item.lastModified),
        creationDate: new Date(item.creationDate)
    }))
}),
    { data: useCases, refresh: refreshUseCases, error: getUseCasesError, status: useCaseStatus } = await useFetch<z.infer<typeof UseCase>[]>(`/api/use-case`, {
        query: { solutionSlug, organizationSlug },
        transform: (data) => data.map((item) => ({
            ...item,
            lastModified: new Date(item.lastModified),
            creationDate: new Date(item.creationDate)
        }))
    }),
    { data: roles, error: getRolesError } = await useFetch<z.infer<typeof Stakeholder>[]>(`/api/stakeholder`, { query: { solutionSlug, organizationSlug } }),
    { data: functionalBehaviors, error: getFunctionalBehaviorsError } = await useFetch<z.infer<typeof FunctionalBehavior>[]>(`/api/functional-behavior`, { query: { solutionSlug, organizationSlug } }),
    { data: outcomes, error: getOutcomesError } = await useFetch<z.infer<typeof Outcome>[]>(`/api/outcome`, { query: { solutionSlug, organizationSlug } }),
    { data: assumptions, error: getAssumptionsError } = await useFetch<z.infer<typeof Assumption>[]>(`/api/assumption`, { query: { solutionSlug, organizationSlug } }),
    { data: effects, error: getEffectsError } = await useFetch<z.infer<typeof Effect>[]>(`/api/effect`, { query: { solutionSlug, organizationSlug } }),
    triggerIds = ref<{ id: string, name: string }[]>([])

if (getUserStoriesError.value)
    $eventBus.$emit('page-error', getUserStoriesError.value);
if (getRolesError.value)
    $eventBus.$emit('page-error', getRolesError.value);
if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);
if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);
if (getAssumptionsError.value)
    $eventBus.$emit('page-error', getAssumptionsError.value);
if (getEffectsError.value)
    $eventBus.$emit('page-error', getEffectsError.value);

const userStoryViewSchema = UserStory.pick({
    id: true,
    reqId: true,
    name: true,
    primaryActor: true,
    functionalBehavior: true,
    outcome: true,
    priority: true
})

const useCaseViewSchema = UseCase.pick({
    id: true,
    reqId: true,
    name: true,
    primaryActor: true,
    outcome: true,
    priority: true
})

const userStoryCreateSchema = UserStory.pick({
    name: true,
    primaryActor: true,
    outcome: true,
    functionalBehavior: true,
    priority: true
})

const useCaseCreateSchema = UseCase.pick({
    name: true,
    primaryActor: true,
    outcome: true,
    priority: true
})

const userStoryEditSchema = UserStory.pick({
    id: true,
    reqId: true,
    name: true,
    primaryActor: true,
    outcome: true,
    functionalBehavior: true,
    priority: true
})

const useCaseEditSchema = UseCase.pick({
    id: true,
    reqId: true,
    name: true,
    primaryActor: true,
    outcome: true,
    priority: true
})

const onUserStoryCreate = async (userStory: z.infer<typeof userStoryCreateSchema>) => {
    await $fetch(`/api/user-story`, {
        method: 'POST',
        body: {
            ...userStory,
            solutionSlug,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUserStoryUpdate = async ({ id, ...data }: z.infer<typeof userStoryEditSchema>) => {
    await $fetch(`/api/user-story/${id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionSlug,
            organizationSlug,
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseCreate = async (useCase: z.infer<typeof useCaseCreateSchema>) => {
    await $fetch(`/api/use-case`, {
        method: 'POST',
        body: {
            ...useCase,
            solutionSlug,
            organizationSlug,
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}

const onUseCaseUpdate = async ({ id, ...data }: z.infer<typeof useCaseEditSchema>) => {
    await $fetch(`/api/use-case/${id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionSlug,
            organizationSlug,
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}

const onUserStoryDelete = async (id: string) => {
    await $fetch(`/api/user-story/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseDelete = async (id: string) => {
    await $fetch(`/api/use-case/${id}`, {
        method: 'DELETE',
        body: { solutionSlug, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}
</script>

<template>
    <h1>Scenarios</h1>

    <p> {{ Scenario.description }}</p>

    <UTabs :items="tabItems">
        <template #user-stories="{ item }">
            <p> {{ UserStory.description }} </p>

            <XDataTable :viewSchema="userStoryViewSchema" :createSchema="userStoryCreateSchema"
                :editSchema="userStoryEditSchema" :data="userStories" :onCreate="onUserStoryCreate"
                :onDelete="onUserStoryDelete" :onUpdate="onUserStoryUpdate" :loading="userStoryStatus === 'pending'">
            </XDataTable>
        </template>
        <template #use-cases="{ item }">
            <p> {{ UseCase.description }} </p>

            <XDataTable :viewSchema="useCaseViewSchema" :createSchema="useCaseCreateSchema"
                :editSchema="useCaseEditSchema" :data="useCases" :onCreate="onUseCaseCreate" :onDelete="onUseCaseDelete"
                :onUpdate="onUseCaseUpdate" :loading="useCaseStatus === 'pending'">
            </XDataTable>
        </template>
    </UTabs>
</template>