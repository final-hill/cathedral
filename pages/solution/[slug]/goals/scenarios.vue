<script lang="ts" setup>
import SolutionRepository from '~/data/SolutionRepository';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import { FilterMatchMode } from 'primevue/api';
import StakeholderRepository from '~/data/StakeholderRepository';
import Stakeholder from '~/domain/Stakeholder';
import SolutionInteractor from '~/application/SolutionInteractor';
import UserStoryRepository from '~/data/UserStoryRepository';
import UserStoryInteractor from '~/application/UserStoryInteractor';
import StakeholderInteractor from '~/application/StakeholderInteractor';
import type UserStory from '~/domain/UserStory';
import FunctionalBehaviorInteractor from '~/application/FunctionalBehaviorInteractor';
import FunctionalBehaviorRepository from '~/data/FunctionalBehaviorRepository';
import type FunctionalBehavior from '~/domain/FunctionalBehavior';
import type Outcome from '~/domain/Outcome';
import OutcomeInteractor from '~/application/OutcomeInteractor';
import OutcomeRepository from '~/data/OutcomeRepository';

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Goal Scenarios' })

const slug = useRoute().params.slug as string,
    userStoryInteractor = new UserStoryInteractor(new UserStoryRepository()),
    functionalBehaviorInteractor = new FunctionalBehaviorInteractor(new FunctionalBehaviorRepository()),
    stakeholderInteractor = new StakeholderInteractor(new StakeholderRepository()),
    outcomeInteractor = new OutcomeInteractor(new OutcomeRepository()),
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id;

type UserStoryViewModel = Pick<UserStory, 'id' | 'name' | 'primaryActorId' | 'functionalBehaviorId' | 'outcomeId' | 'priorityId'>

const userStories = ref<UserStoryViewModel[]>(await userStoryInteractor.getAll({ solutionId })),
    emptyUserStory: UserStoryViewModel = {
        id: emptyUuid,
        name: '',
        primaryActorId: emptyUuid,
        functionalBehaviorId: emptyUuid,
        outcomeId: emptyUuid,
        priorityId: 'MUST'
    },
    roles = ref<Stakeholder[]>(await stakeholderInteractor.getAll({ solutionId })),
    behaviors = ref<FunctionalBehavior[]>(await functionalBehaviorInteractor.getAll({ solutionId })),
    outcomes = ref<Outcome[]>(await outcomeInteractor.getAll({ solutionId }));

const userStoryfilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'functionalBehaviorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'outcomeId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onUserStoryCreate = async (userStory: UserStoryViewModel) => {
    const newId = await userStoryInteractor.create({
        ...userStory,
        solutionId,
        property: '',
        statement: '',
        priorityId: 'MUST'
    });

    userStories.value = await userStoryInteractor.getAll({ solutionId });
}

const onUserStoryUpdate = async (userStory: UserStoryViewModel) => {
    await userStoryInteractor.update({
        ...userStory,
        solutionId,
        property: '',
        statement: '',
        priorityId: userStory.priorityId
    });

    userStories.value = await userStoryInteractor.getAll({ solutionId });
}

const onUserStoryDelete = async (id: Uuid) => {
    await userStoryInteractor.delete(id);

    userStories.value = await userStoryInteractor.getAll({ solutionId });
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
        <NuxtLink class="underline" :to="{ name: 'Behaviors', params: { slug } }">Behaviors</NuxtLink>,
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
                    :options="roles" placeholder="Search by Actor" />
            </template>
            <template #body="{ data, field }">
                {{ roles.find(r => r.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="roles"
                    placeholder="Select an Actor" />
            </template>
        </Column>
        <Column field="functionalBehaviorId" header="Behavior">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="behaviors" placeholder="Search by Behavior" />
            </template>
            <template #body="{ data, field }">
                {{ behaviors.find(b => b.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="behaviors"
                    placeholder="Select a Behavior" />
            </template>
        </Column>
        <Column field="outcomeId" header="Outcome">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="outcomes" placeholder="Search by Outcome" />
            </template>
            <template #body="{ data, field }">
                {{ outcomes.find(o => o.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="outcomes"
                    placeholder="Select an Outcome" />
            </template>
        </Column>
    </XDataTable>

</template>