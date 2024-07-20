<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import MoscowPriority from '~/server/domain/MoscowPriority';
import type UserStory from '~/server/domain/UserStory';
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios' })

const slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions/?slug=${slug}`),
    solutionId = solutions.value?.[0].id;

type UserStoryViewModel = Pick<UserStory, 'id' | 'name' | 'primaryActorId' | 'functionalBehaviorId' | 'outcomeId' | 'priority'>

const { data: userStories, refresh, status } = useFetch(`/api/user-stories?solutionId=${solutionId}`),
    emptyUserStory: UserStoryViewModel = {
        id: emptyUuid,
        name: '',
        primaryActor: emptyUuid,
        functionalBehavior: emptyUuid,
        outcome: emptyUuid,
        priority: MoscowPriority.MUST
    },
    { data: roles } = useFetch(`/api/stakeholders?solutionId=${solutionId}`),
    { data: functionalBehaviors } = useFetch(`/api/functional-behaviors?solutionId=${solutionId}`),
    { data: outcomes } = useFetch(`/api/outcomes?solutionId=${solutionId}`);

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
            primaryActorId: userStory.primaryActor,
            priority: MoscowPriority.MUST,
            outcomeId: userStory.outcome,
            functionalBehaviorId: userStory.functionalBehavior,
        }
    });

    refresh();
}

const onUserStoryUpdate = async (userStory: UserStoryViewModel) => {
    await $fetch(`/api/user-stories/${userStory.id}`, {
        method: 'PUT', body: {
            name: userStory.name,
            statement: '',
            solutionId,
            priority: MoscowPriority.MUST,
            primaryActorId: userStory.primaryActor,
            outcomeId: userStory.outcome,
            functionalBehaviorId: userStory.functionalBehavior,
        }
    });

    refresh();
}

const onUserStoryDelete = async (id: Uuid) => {
    await $fetch(`/api/user-stories/${id}`, { method: 'DELETE' });
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
        <NuxtLink class="underline" :to="{ name: 'Stakeholders', params: { slug } }">Actors</NuxtLink>,
        <NuxtLink class="underline" :to="{ name: 'Goals Functionality', params: { slug } }">Behaviors</NuxtLink>,
        and <NuxtLink class="underline" :to="{ name: 'Outcomes', params: { slug } }">Outcomes</NuxtLink>
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
        <Column field="primaryActorId" header="Actor">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="roles!" placeholder="Search by Actor" />
            </template>
            <template #body="{ data, field }">
                {{ roles?.find(r => r.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="roles!"
                    placeholder="Select an Actor" />
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