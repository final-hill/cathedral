<script lang="ts" setup>
import { FunctionalBehavior, MoscowPriority, Outcome, Stakeholder, UserStory } from '~/server/domain/requirements/index';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Scenarios').params as { solutionslug: string, organizationslug: string },
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const [
    { data: userStories, refresh, status, error: getUserStoriesError },
    { data: roles, error: getRolesError },
    { data: functionalBehaviors, error: getFunctionalBehaviorsError },
    { data: outcomes, error: getOutcomesError },
] = await Promise.all([
    useFetch<UserStory[]>(`/api/user-stories`, {
        query: { solutionId },
        transform: (data) => data.map((item) => {
            item.lastModified = new Date(item.lastModified)
            return item
        })
    }),
    useFetch<Stakeholder[]>(`/api/stakeholders`, { query: { solutionId } }),
    useFetch<FunctionalBehavior[]>(`/api/functional-behaviors`, { query: { solutionId } }),
    useFetch<Outcome[]>(`/api/outcomes`, { query: { solutionId } })
])

if (getUserStoriesError.value)
    $eventBus.$emit('page-error', getUserStoriesError.value);
if (getRolesError.value)
    $eventBus.$emit('page-error', getRolesError.value);
if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);
if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const onUserStoryCreate = async (userStory: UserStory) => {
    await $fetch(`/api/user-stories`, {
        method: 'POST',
        body: {
            ...userStory,
            solutionId,
            statement: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onUserStoryUpdate = async (userStory: UserStory) => {
    await $fetch(`/api/user-stories/${userStory.id}`, {
        method: 'PUT',
        body: {
            ...userStory,
            solutionId,
            statement: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onUserStoryDelete = async (id: string) => {
    await $fetch(`/api/user-stories/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e));
    refresh();
}
</script>

<template>
    <h1>Scenarios</h1>

    <p>
        This section defines the main scenarios that the system must support to achieve the goals of the solution.
    </p>
    <p>
        Before you can begin, you must define one or more
        <NuxtLink class="underline" :to="{ name: 'Stakeholders', params: { solutionslug, organizationslug } }">
            Stakeholders</NuxtLink>,
        <NuxtLink class="underline" :to="{ name: 'Goals Functionality', params: { solutionslug, organizationslug } }"
            v-text="'Functional Behaviors'" />,
        and <NuxtLink class="underline" :to="{ name: 'Outcomes', params: { solutionslug, organizationslug } }">Outcomes
        </NuxtLink>
        for the solution.
    </p>

    <XDataTable :viewModel="{
        name: 'text',
        primaryActor: 'object',
        functionalBehavior: 'object',
        outcome: 'object'
    }" :createModel="{
        name: 'text',
        primaryActor: { type: 'requirement', options: roles ?? [] },
        functionalBehavior: { type: 'requirement', options: functionalBehaviors ?? [] },
        outcome: { type: 'requirement', options: outcomes ?? [] }
    }" :editModel="{
        id: 'hidden',
        name: 'text',
        primaryActor: { type: 'requirement', options: roles ?? [] },
        functionalBehavior: { type: 'requirement', options: functionalBehaviors ?? [] },
        outcome: { type: 'requirement', options: outcomes ?? [] }
    }" :datasource="userStories" :onCreate="onUserStoryCreate" :onUpdate="onUserStoryUpdate"
        :onDelete="onUserStoryDelete" :loading="status === 'pending'">
    </XDataTable>
</template>