<script lang="ts" setup>
import { Assumption } from '~/domain/requirements/Assumption.js';
import { Effect } from '~/domain/requirements/Effect.js';
import { FunctionalBehavior } from '~/domain/requirements/FunctionalBehavior.js';
import { MoscowPriority } from '~/domain/requirements/MoscowPriority.js';
import { Outcome } from '~/domain/requirements/Outcome.js';
import { Stakeholder } from '~/domain/requirements/Stakeholder.js';
import { UseCase } from '~/domain/requirements/UseCase.js';
import { UserStory } from '~/domain/requirements/UserStory.js';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Scenarios').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id!;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: userStories, refresh: refreshUserStories, error: getUserStoriesError, status: userStoryStatus } = await useFetch<UserStory[]>(`/api/user-story`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
}),
    { data: useCases, refresh: refreshUseCases, error: getUseCasesError, status: useCaseStatus } = await useFetch<UseCase[]>(`/api/use-case`, {
        query: { solutionId },
        transform: (data) => data.map((item) => {
            item.lastModified = new Date(item.lastModified)
            return item
        })
    }),
    { data: roles, error: getRolesError } = await useFetch<Stakeholder[]>(`/api/stakeholder`, { query: { solutionId } }),
    { data: functionalBehaviors, error: getFunctionalBehaviorsError } = await useFetch<FunctionalBehavior[]>(`/api/functional-behavior`, { query: { solutionId } }),
    { data: outcomes, error: getOutcomesError } = await useFetch<Outcome[]>(`/api/outcome`, { query: { solutionId } }),
    { data: assumptions, error: getAssumptionsError } = await useFetch<Assumption[]>(`/api/assumption`, { query: { solutionId } }),
    { data: effects, error: getEffectsError } = await useFetch<Effect[]>(`/api/effect`, { query: { solutionId } }),
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

const onUserStoryCreate = async (userStory: UserStory) => {
    await $fetch(`/api/user-story`, {
        method: 'POST',
        body: {
            name: userStory.name,
            description: '',
            primaryActor: userStory.primaryActor,
            priority: userStory.priority,
            outcome: userStory.outcome,
            functionalBehavior: userStory.functionalBehavior,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUserStoryUpdate = async (userStory: UserStory) => {
    await $fetch(`/api/user-story/${userStory.id}`, {
        method: 'PUT',
        body: {
            name: userStory.name,
            primaryActor: userStory.primaryActor,
            outcome: userStory.outcome,
            functionalBehavior: userStory.functionalBehavior,
            solutionId,
            description: '',
            priority: userStory.priority
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseCreate = async (useCase: UseCase) => {
    await $fetch(`/api/use-case`, {
        method: 'POST',
        body: {
            name: useCase.name,
            scope: useCase.scope,
            level: useCase.level,
            primaryActor: useCase.primaryActor,
            goalInContext: useCase.goalInContext,
            precondition: useCase.precondition,
            triggerId: useCase.triggerId,
            mainSuccessScenario: useCase.mainSuccessScenario,
            successGuarantee: useCase.successGuarantee,
            extensions: useCase.extensions,
            solutionId,
            description: '',
            priority: useCase.priority
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}

const onUseCaseUpdate = async (useCase: UseCase) => {
    await $fetch(`/api/use-case/${useCase.id}`, {
        method: 'PUT',
        body: {
            name: useCase.name,
            scope: useCase.scope,
            level: useCase.level,
            primaryActor: useCase.primaryActor,
            goalInContext: useCase.goalInContext,
            precondition: useCase.precondition,
            triggerId: useCase.triggerId,
            mainSuccessScenario: useCase.mainSuccessScenario,
            successGuarantee: useCase.successGuarantee,
            extensions: useCase.extensions,
            solutionId,
            description: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}

const onUserStoryDelete = async (id: string) => {
    await $fetch(`/api/user-story/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseDelete = async (id: string) => {
    await $fetch(`/api/use-case/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}
</script>

<template>
    <h1>Scenarios</h1>

    <p>Scenarios are the detailed steps that an actor takes to achieve a goal.</p>

    <TabView>
        <TabPanel header="User Stories">
            <p>
                A User Story specifies a goal that an actor wants to achieve by
                leveraging a particular behavior of the system.
            </p>

            <XDataTable :viewModel="{
                name: 'text',
                primaryActor: 'object',
                functionalBehavior: 'object',
                outcome: 'object',
                priority: 'text'
            }" :createModel="{
                name: 'text',
                primaryActor: { type: 'requirement', options: roles ?? [] },
                functionalBehavior: { type: 'requirement', options: functionalBehaviors ?? [] },
                outcome: { type: 'requirement', options: outcomes ?? [] },
                priority: Object.values(MoscowPriority)
            }" :editModel="{
                id: 'hidden',
                name: 'text',
                primaryActor: { type: 'requirement', options: roles ?? [] },
                functionalBehavior: { type: 'requirement', options: functionalBehaviors ?? [] },
                outcome: { type: 'requirement', options: outcomes ?? [] },
                priority: Object.values(MoscowPriority)
            }" :datasource="userStories" :onCreate="onUserStoryCreate" :onUpdate="onUserStoryUpdate"
                :onDelete="onUserStoryDelete" :loading="userStoryStatus === 'pending'"
                :organizationSlug="organizationslug" entityName="UserStory" :showRecycleBin="true">
            </XDataTable>
        </TabPanel>
        <TabPanel header="Use Cases">
            <p>
                A Use Case describes a complete interaction between an actor and the
                system to achieve a goal.
            </p>
            <XDataTable :viewModel="{
                name: 'text',
                scope: 'text',
                level: 'text',
                priority: 'text',
                primaryActor: 'object',
                goalInContext: 'text',
                precondition: 'object',
                triggerId: 'text',
                mainSuccessScenario: 'text',
                successGuarantee: 'object',
                extensions: 'text'
            }" :createModel="{
                name: 'text',
                scope: 'text',
                level: 'text',
                priority: Object.values(MoscowPriority),
                primaryActor: { type: 'requirement', options: roles ?? [] },
                goalInContext: 'text',
                precondition: { type: 'requirement', options: assumptions ?? [] },
                triggerId: 'text',
                mainSuccessScenario: 'text',
                successGuarantee: { type: 'requirement', options: effects ?? [] },
                extensions: 'text'
            }" :editModel="{
                id: 'hidden',
                name: 'text',
                scope: 'text',
                level: 'text',
                priority: Object.values(MoscowPriority),
                primaryActor: { type: 'requirement', options: roles ?? [] },
                goalInContext: 'text',
                precondition: { type: 'requirement', options: assumptions ?? [] },
                triggerId: 'text',
                mainSuccessScenario: 'text',
                successGuarantee: { type: 'requirement', options: effects ?? [] },
                extensions: 'text'
            }" :datasource="useCases!" :onCreate="onUseCaseCreate" :onUpdate="onUseCaseUpdate"
                :onDelete="onUseCaseDelete" :loading="useCaseStatus === 'pending'" :organizationSlug="organizationslug"
                entityName="UseCase" :showRecycleBin="true">
            </XDataTable>
        </TabPanel>
    </TabView>
</template>