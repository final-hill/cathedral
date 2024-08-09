<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import MoscowPriority from '~/server/domain/requirements/MoscowPriority';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Scenarios').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

type UserStoryViewModel = {
    id: string;
    name: string;
    primaryActorId: string;
    functionalBehaviorId: string;
    outcomeId: string;
    priority: MoscowPriority;
}

const [
    { data: userStories, refresh, status, error: getUserStoriesError },
    { data: roles, error: getRolesError },
    { data: functionalBehaviors, error: getFunctionalBehaviorsError },
    { data: outcomes, error: getOutcomesError },
] = await Promise.all([
    useFetch(`/api/user-stories?solutionId=${solutionId}`),
    useFetch(`/api/stakeholders?solutionId=${solutionId}`),
    useFetch(`/api/functional-behaviors?solutionId=${solutionId}`),
    useFetch(`/api/outcomes?solutionId=${solutionId}`)
]),
    emptyUserStory: UserStoryViewModel = {
        id: emptyUuid,
        name: '',
        primaryActorId: emptyUuid,
        functionalBehaviorId: emptyUuid,
        outcomeId: emptyUuid,
        priority: MoscowPriority.MUST
    }

if (getUserStoriesError.value)
    $eventBus.$emit('page-error', getUserStoriesError.value);
if (getRolesError.value)
    $eventBus.$emit('page-error', getRolesError.value);
if (getFunctionalBehaviorsError.value)
    $eventBus.$emit('page-error', getFunctionalBehaviorsError.value);
if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const userStoryfilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'functionalBehaviorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'outcomeId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onUserStoryCreate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-stories`, {
        method: 'POST', body: {
            name: userStory.name,
            statement: '',
            solutionId,
            primaryActorId: userStory.primaryActorId,
            priority: MoscowPriority.MUST,
            outcomeId: userStory.outcomeId,
            functionalBehaviorId: userStory.functionalBehaviorId,
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onUserStoryUpdate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-stories/${userStory.id}`, {
        method: 'PUT', body: {
            name: userStory.name,
            statement: '',
            solutionId,
            priority: MoscowPriority.MUST,
            primaryActorId: userStory.primaryActorId,
            outcomeId: userStory.outcomeId,
            functionalBehaviorId: userStory.functionalBehaviorId,
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    refresh();
}

const onUserStoryDelete = async (id: string) => {
    await $fetch(`/api/user-stories/${id}`, { method: 'DELETE' })
        .catch((e) => $eventBus.$emit('page-error', e));
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

    <XDataTable :datasource="userStories" :filters="userStoryfilters" :emptyRecord="emptyUserStory"
        :onCreate="onUserStoryCreate" :onUpdate="onUserStoryUpdate" :onDelete="onUserStoryDelete">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" placeholder="Enter a name" />
            </template>
        </Column>
        <Column field="primaryActorId" header="Stakeholder">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="roles!" placeholder="Search by Stakeholder" />
            </template>
            <template #body="{ data, field }">
                {{ roles?.find(r => r.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="roles!"
                    placeholder="Select an Stakeholder" />
            </template>
        </Column>
        <Column field="functionalBehaviorId" header="Behavior">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="functionalBehaviors!" placeholder="Search by Behavior" />
            </template>
            <template #body="{ data, field }">
                {{ functionalBehaviors?.find(b => b.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="functionalBehaviors!"
                    placeholder="Select a Behavior" />
            </template>
        </Column>
        <Column field="outcomeId" header="Outcome">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="outcomes!" placeholder="Search by Outcome" />
            </template>
            <template #body="{ data, field }">
                {{ outcomes?.find(o => o.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="outcomes!"
                    placeholder="Select an Outcome" />
            </template>
        </Column>
    </XDataTable>

</template>