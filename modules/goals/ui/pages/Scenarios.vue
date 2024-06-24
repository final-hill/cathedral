<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import { FilterMatchMode } from 'primevue/api';
import StakeholderRepository from '~/modules/goals/data/StakeholderRepository';
import Stakeholder from '~/modules/goals/domain/Stakeholder';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import UserStoryRepository from '~/data/UserStoryRepository';
import UserStoryInteractor from '~/application/UserStoryInteractor';
import StakeholderInteractor from '../../application/StakeholderInteractor';
import type UserStory from '~/domain/UserStory';
import FunctionalBehaviorInteractor from '~/modules/system/application/FunctionalBehaviorInteractor';
import FunctionalBehaviorRepository from '~/modules/system/data/FunctionalBehaviorRepository';
import type FunctionalBehavior from '~/modules/system/domain/FunctionalBehavior';
import type Outcome from '../../domain/Outcome';
import OutcomeInteractor from '../../application/OutcomeInteractor';
import OutcomeRepository from '../../data/OutcomeRepository';

useHead({ title: 'Scenarios' })

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    userStoryInteractor = new UserStoryInteractor(new UserStoryRepository()),
    functionalBehaviorInteractor = new FunctionalBehaviorInteractor(new FunctionalBehaviorRepository()),
    stakeholderInteractor = new StakeholderInteractor(new StakeholderRepository()),
    outcomeInteractor = new OutcomeInteractor(new OutcomeRepository()),
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0]

if (!solution)
    router.push({ name: 'Solutions' })

type UserStoryViewModel = Pick<UserStory, 'id' | 'name' | 'primaryActorId' | 'functionalBehaviorId' | 'outcomeId'>

const userStories = ref<UserStoryViewModel[]>([]),
    emptyUserStory: UserStoryViewModel = {
        id: emptyUuid,
        name: '',
        primaryActorId: emptyUuid,
        functionalBehaviorId: emptyUuid,
        outcomeId: emptyUuid
    },
    roles = ref<Stakeholder[]>([]),
    behaviors = ref<FunctionalBehavior[]>([]),
    outcomes = ref<Outcome[]>([]);

onMounted(async () => {
    userStories.value = await userStoryInteractor.getAll({ solutionId: solution!.id });
    roles.value = await stakeholderInteractor.getAll({ solutionId: solution!.id });
    behaviors.value = await functionalBehaviorInteractor.getAll({ solutionId: solution!.id });
    outcomes.value = await outcomeInteractor.getAll({ solutionId: solution!.id });
})

const userStoryfilters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'functionalBehaviorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'outcomeId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onUserStoryCreate = async (userStory: UserStoryViewModel) => {
    const newId = await userStoryInteractor.create({
        ...userStory,
        solutionId: solution!.id,
        componentId: emptyUuid,
        property: '',
        statement: ''
    });

    userStories.value = await userStoryInteractor.getAll({ solutionId: solution!.id });
}

const onUserStoryUpdate = async (userStory: UserStoryViewModel) => {
    await userStoryInteractor.update({
        ...userStory,
        solutionId: solution!.id,
        componentId: emptyUuid,
        property: '',
        statement: ''
    });

    userStories.value = await userStoryInteractor.getAll({ solutionId: solution!.id });
}

const onUserStoryDelete = async (id: Uuid) => {
    await userStoryInteractor.delete(id);

    userStories.value = await userStoryInteractor.getAll({ solutionId: solution!.id });
}
</script>

<template>
    <h1>Scenarios</h1>

    <p>
        This section defines the main scenarios that the system must support to achieve the goals of the solution.
    </p>
    <p>
        Before you can begin, you must define one or more
        <NuxtLink class="underline" :to="{ name: 'Stakeholders', params: { solutionSlug: slug } }">Actors</NuxtLink>,
        <NuxtLink class="underline" :to="{ name: 'Behaviors', params: { solutionSlug: slug } }">Behaviors</NuxtLink>,
        and <NuxtLink class="underline" :to="{ name: 'Outcomes', params: { solutionSlug: slug } }">Outcomes</NuxtLink>
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