<script lang="ts" setup>
import { MoscowPriority } from '~/domain/requirements/MoscowPriority.js'

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Scenarios').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

interface UserStoryViewModel {
    id: string;
    name: string;
    primaryActor: StakeholderViewModel;
    functionalBehavior: FunctionalBehaviorViewModel;
    outcome: OutcomeViewModel;
    lastModified: Date;
}

interface StakeholderViewModel {
    id: string;
    name: string;
}

interface FunctionalBehaviorViewModel {
    id: string;
    name: string;
}

interface OutcomeViewModel {
    id: string;
    name: string;
}

const [
    { data: userStories, refresh, status, error: getUserStoriesError },
    { data: roles, error: getRolesError },
    { data: functionalBehaviors, error: getFunctionalBehaviorsError },
    { data: outcomes, error: getOutcomesError },
] = await Promise.all([
    useFetch<UserStoryViewModel[]>(`/api/user-story`, {
        query: { solutionId },
        transform: (data) => data.map((item) => {
            item.lastModified = new Date(item.lastModified)
            return item
        })
    }),
    useFetch<StakeholderViewModel[]>(`/api/stakeholder`, { query: { solutionId } }),
    useFetch<FunctionalBehaviorViewModel[]>(`/api/functional-behavior`, { query: { solutionId } }),
    useFetch<OutcomeViewModel[]>(`/api/outcome`, { query: { solutionId } })
])

if (getUserStoriesError.value)
    $eventBus.$emit('page-error', getUserStoriesError.value);
if (getRolesError.value)
    $eventBus.$emit('page-error', getRolesError.value);
if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);
if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const onUserStoryCreate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-story`, {
        method: 'POST',
        body: {
            ...userStory,
            solutionId,
            description: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onUserStoryUpdate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-story/${userStory.id}`, {
        method: 'PUT',
        body: {
            ...userStory,
            solutionId,
            description: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onUserStoryDelete = async (id: string) => {
    await $fetch(`/api/user-story/${id}`, {
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
        :onDelete="onUserStoryDelete" :loading="status === 'pending'" :organizationSlug="organizationslug"
        entityName="UserStory" :showRecycleBin="true">
    </XDataTable>
</template>