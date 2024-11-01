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

interface EpicViewModel {
    id: string;
    reqId: string;
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
    { data: epics, refresh, status, error: getEpicsError },
    { data: roles, error: getRolesError },
    { data: functionalBehaviors, error: getFunctionalBehaviorsError },
    { data: outcomes, error: getOutcomesError },
] = await Promise.all([
    useFetch<EpicViewModel[]>(`/api/epic`, {
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

if (getEpicsError.value)
    $eventBus.$emit('page-error', getEpicsError.value);
if (getRolesError.value)
    $eventBus.$emit('page-error', getRolesError.value);
if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);
if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const onEpicCreate = async (epic: EpicViewModel) => {
    await $fetch(`/api/epic`, {
        method: 'POST',
        body: {
            ...epic,
            solutionId,
            description: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onEpicUpdate = async (epic: EpicViewModel) => {
    await $fetch(`/api/epic/${epic.id}`, {
        method: 'PUT',
        body: {
            ...epic,
            solutionId,
            description: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onEpicDelete = async (id: string) => {
    await $fetch(`/api/epic/${id}`, {
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
        reqId: 'text',
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
    }" :datasource="epics" :onCreate="onEpicCreate" :onUpdate="onEpicUpdate" :onDelete="onEpicDelete"
        :loading="status === 'pending'" :organizationSlug="organizationslug" entityName="UserStory"
        :showRecycleBin="true">
    </XDataTable>
</template>