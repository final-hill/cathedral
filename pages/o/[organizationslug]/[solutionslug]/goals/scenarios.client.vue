<script lang="ts" setup>
import { MoscowPriority } from '~/domain/requirements/MoscowPriority.js'
import type { EpicViewModel, StakeholderViewModel, FunctionalBehaviorViewModel, OutcomeViewModel, SolutionViewModel } from '#shared/models'

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Scenarios').params,
    { data: solution, error: getSolutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
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
    useFetch<EpicViewModel[]>(`/api/epic`, {
        query: { solutionId, organizationSlug },
        transform: (data) => data.map((item) => {
            item.lastModified = new Date(item.lastModified)
            return item
        })
    }),
    useFetch<StakeholderViewModel[]>(`/api/stakeholder`, { query: { solutionId, organizationSlug } }),
    useFetch<FunctionalBehaviorViewModel[]>(`/api/functional-behavior`, { query: { solutionId, organizationSlug } }),
    useFetch<OutcomeViewModel[]>(`/api/outcome`, { query: { solutionId, organizationSlug } })
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
            organizationSlug,
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
            organizationSlug,
            description: '',
            priority: MoscowPriority.MUST
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onEpicDelete = async (id: string) => {
    await $fetch(`/api/epic/${id}`, {
        method: 'DELETE',
        body: { solutionId, organizationSlug }
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

    <XDataTable :viewModel="{
        reqId: 'text',
        name: 'text',
        primaryActor: { type: 'requirement', options: roles ?? [] },
        functionalBehavior: { type: 'requirement', options: functionalBehaviors ?? [] },
        outcome: { type: 'requirement', options: outcomes ?? [] }
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
        :loading="status === 'pending'" :organizationSlug="organizationSlug" entityName="UserStory"
        :showRecycleBin="true">
    </XDataTable>
</template>