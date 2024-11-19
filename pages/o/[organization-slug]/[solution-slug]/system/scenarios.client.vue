<script lang="ts" setup>
import { MoscowPriority } from '~/domain/requirements/MoscowPriority.js';
import type { AssumptionViewModel, EffectViewModel, FunctionalBehaviorViewModel, OutcomeViewModel, StakeholderViewModel, SolutionViewModel, UseCaseViewModel, UserStoryViewModel } from '~/shared/models';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Scenarios').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    }),
    solutionId = solution.value?.id!;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: userStories, refresh: refreshUserStories, error: getUserStoriesError, status: userStoryStatus } = await useFetch<UserStoryViewModel[]>(`/api/user-story`, {
    query: { solutionId, organizationSlug },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
}),
    { data: useCases, refresh: refreshUseCases, error: getUseCasesError, status: useCaseStatus } = await useFetch<UseCaseViewModel[]>(`/api/use-case`, {
        query: { solutionId, organizationSlug },
        transform: (data) => data.map((item) => {
            item.lastModified = new Date(item.lastModified)
            return item
        })
    }),
    { data: roles, error: getRolesError } = await useFetch<StakeholderViewModel[]>(`/api/stakeholder`, { query: { solutionId, organizationSlug } }),
    { data: functionalBehaviors, error: getFunctionalBehaviorsError } = await useFetch<FunctionalBehaviorViewModel[]>(`/api/functional-behavior`, { query: { solutionId, organizationSlug } }),
    { data: outcomes, error: getOutcomesError } = await useFetch<OutcomeViewModel[]>(`/api/outcome`, { query: { solutionId, organizationSlug } }),
    { data: assumptions, error: getAssumptionsError } = await useFetch<AssumptionViewModel[]>(`/api/assumption`, { query: { solutionId, organizationSlug } }),
    { data: effects, error: getEffectsError } = await useFetch<EffectViewModel[]>(`/api/effect`, { query: { solutionId, organizationSlug } }),
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

const onUserStoryCreate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-story`, {
        method: 'POST',
        body: {
            name: userStory.name,
            description: '',
            primaryActor: userStory.primaryActor,
            priority: userStory.priority,
            outcome: userStory.outcome,
            functionalBehavior: userStory.functionalBehavior,
            solutionId,
            organizationSlug
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUserStoryUpdate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-story/${userStory.id}`, {
        method: 'PUT',
        body: {
            name: userStory.name,
            primaryActor: userStory.primaryActor,
            outcome: userStory.outcome,
            functionalBehavior: userStory.functionalBehavior,
            solutionId,
            organizationSlug,
            description: '',
            priority: userStory.priority
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseCreate = async (useCase: UseCaseViewModel) => {
    await $fetch(`/api/use-case`, {
        method: 'POST',
        body: {
            name: useCase.name,
            scope: useCase.scope,
            level: useCase.level,
            primaryActor: useCase.primaryActor,
            outcome: useCase.outcome,
            precondition: useCase.precondition,
            triggerId: useCase.triggerId,
            mainSuccessScenario: useCase.mainSuccessScenario,
            successGuarantee: useCase.successGuarantee,
            extensions: useCase.extensions,
            solutionId,
            organizationSlug,
            description: '',
            priority: useCase.priority
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}

const onUseCaseUpdate = async (useCase: UseCaseViewModel) => {
    await $fetch(`/api/use-case/${useCase.id}`, {
        method: 'PUT',
        body: {
            name: useCase.name,
            scope: useCase.scope,
            level: useCase.level,
            primaryActor: useCase.primaryActor,
            outcome: useCase.outcome,
            precondition: useCase.precondition,
            triggerId: useCase.triggerId,
            mainSuccessScenario: useCase.mainSuccessScenario,
            successGuarantee: useCase.successGuarantee,
            extensions: useCase.extensions,
            solutionId,
            organizationSlug,
            description: ''
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUseCases();
}

const onUserStoryDelete = async (id: string) => {
    await $fetch(`/api/user-story/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refreshUserStories();
}

const onUseCaseDelete = async (id: string) => {
    await $fetch(`/api/use-case/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
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
                reqId: 'text',
                name: 'text',
                primaryActor: { type: 'requirement', options: roles ?? [] },
                functionalBehavior: { type: 'requirement', options: functionalBehaviors ?? [] },
                outcome: { type: 'requirement', options: outcomes ?? [] },
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
                :organizationSlug="organizationSlug" entityName="UserStory" :showRecycleBin="true">
            </XDataTable>
        </TabPanel>
        <TabPanel header="Use Cases">
            <p>
                A Use Case describes a complete interaction between an actor and the
                system to achieve a goal.
            </p>
            <XDataTable :viewModel="{
                reqId: 'text',
                name: 'text',
                scope: 'text',
                level: 'text',
                priority: 'text',
                primaryActor: { type: 'requirement', options: roles ?? [] },
                outcome: { type: 'requirement', options: outcomes ?? [] },
                precondition: { type: 'requirement', options: assumptions ?? [] },
                triggerId: 'text',
                mainSuccessScenario: 'text',
                successGuarantee: { type: 'requirement', options: effects ?? [] },
                extensions: 'text'
            }" :createModel="{
                name: 'text',
                scope: 'text',
                level: 'text',
                priority: Object.values(MoscowPriority),
                primaryActor: { type: 'requirement', options: roles ?? [] },
                outcome: { type: 'requirement', options: outcomes ?? [] },
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
                outcome: { type: 'requirement', options: outcomes ?? [] },
                precondition: { type: 'requirement', options: assumptions ?? [] },
                triggerId: 'text',
                mainSuccessScenario: 'text',
                successGuarantee: { type: 'requirement', options: effects ?? [] },
                extensions: 'text'
            }" :datasource="useCases!" :onCreate="onUseCaseCreate" :onUpdate="onUseCaseUpdate"
                :onDelete="onUseCaseDelete" :loading="useCaseStatus === 'pending'" :organizationSlug="organizationSlug"
                entityName="UseCase" :showRecycleBin="true">
            </XDataTable>
        </TabPanel>
    </TabView>
</template>