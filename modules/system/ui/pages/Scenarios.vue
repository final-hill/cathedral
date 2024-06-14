<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import SystemRepository from '../../data/SystemRepository';
import UserStoryRepository from '../../data/UserStoryRepository';
import UserStoryInteractor from '../../application/UserStoryInteractor';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetSystemBySolutionIdUseCase from '../../application/GetSystemBySolutionIdUseCase';
import type UserStory from '../../domain/UserStory';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import { FilterMatchMode } from 'primevue/api';
import EpicRepository from '~/modules/goals/data/EpicRepository';
import GetGoalsBySolutionIdUseCase from '~/modules/goals/application/GetGoalsBySolutionIdUseCase';
import GoalsRepository from '~/modules/goals/data/GoalsRepository';
import Epic from '~/modules/goals/domain/Epic';
import FunctionalRequirement from '../../domain/FunctionalRequirement';
import FunctionalRequirementInteractor from '../../application/FunctionalRequirementInteractor';
import FunctionalRequirementRepository from '../../data/FunctionalRequirementRepository';
import StakeholderRepository from '~/modules/goals/data/StakeholderRepository';
import GetStakeHoldersUseCase from '~/modules/goals/application/GetStakeHoldersUseCase';
import Stakeholder from '~/modules/goals/domain/Stakeholder';
import EpicInteractor from '~/modules/goals/application/EpicInteractor';

useHead({
    title: 'Scenarios'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    systemRepository = new SystemRepository(),
    userStoryRepository = new UserStoryRepository(),
    goalsRepository = new GoalsRepository(),
    epicRepository = new EpicRepository(),
    stakeholderRepository = new StakeholderRepository(),
    functionalRequirementsRepository = new FunctionalRequirementRepository(),
    userStoryInteractor = new UserStoryInteractor(userStoryRepository),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getSystemBySolutionIdUseCase = new GetSystemBySolutionIdUseCase(systemRepository),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),
    functionalRequirementInteractor = new FunctionalRequirementInteractor(functionalRequirementsRepository),
    epicInteractor = new EpicInteractor(epicRepository),
    getStakeholdersUseCase = new GetStakeHoldersUseCase(stakeholderRepository),
    system = solution?.id && await getSystemBySolutionIdUseCase.execute(solution.id),
    goals = solution?.id && await getGoalsBySolutionIdUseCase.execute(solution.id)

if (!solution) {
    router.push({ name: 'Solutions' })
} else {
    if (!system)
        router.push({ name: 'System', params: { solutionSlug: slug } });
}

type UserStoryViewModel = Pick<UserStory, 'id' | 'name' | 'primaryActorId' | 'behaviorId' | 'epicId'>

const userStories = ref<UserStoryViewModel[]>([]),
    emptyUserStory: UserStoryViewModel = {
        id: emptyUuid,
        name: '',
        primaryActorId: emptyUuid,
        behaviorId: emptyUuid,
        epicId: emptyUuid
    },
    roles = ref<Stakeholder[]>([]),
    behaviors = ref<FunctionalRequirement[]>([]),
    epics = ref<Epic[]>([]);

onMounted(async () => {
    userStories.value = await userStoryInteractor.getAll(system!.id);
    roles.value = await getStakeholdersUseCase.execute(goals!.id);
    behaviors.value = await functionalRequirementInteractor.getAll(solution!.id);
    epics.value = await epicInteractor.getAll(solution!.id);
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'behaviorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'epicId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onCreate = async (userStory: UserStoryViewModel) => {
    const newId = await userStoryInteractor.create({
        ...userStory,
        solutionId: solution!.id,
        parentId: system!.id
    });

    userStories.value = await userStoryInteractor.getAll(system!.id);
}

const onUpdate = async (userStory: UserStoryViewModel) => {
    await userStoryInteractor.update({
        ...userStory,
        parentId: system!.id,
        solutionId: solution!.id
    });

    userStories.value = await userStoryInteractor.getAll(system!.id);
}

const onDelete = async (id: Uuid) => {
    await userStoryInteractor.delete(id);

    userStories.value = await userStoryInteractor.getAll(system!.id);
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

            <XDataTable :datasource="userStories" :filters="filters" :emptyRecord="emptyUserStory" :onCreate="onCreate"
                :onUpdate="onUpdate" :onDelete="onDelete">
                <Column field="name" header="Name" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                            placeholder="Search by name" />
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
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="roles" placeholder="Search by Actor" />
                    </template>
                    <template #body="{ data, field }">
                        {{ roles.find(r => r.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="roles"
                            placeholder="Select an Actor" />
                    </template>
                </Column>
                <Column field="behaviorId" header="Behavior">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="behaviors" placeholder="Search by Behavior" />
                    </template>
                    <template #body="{ data, field }">
                        {{ behaviors.find(b => b.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="behaviors"
                            placeholder="Select a Behavior" />
                    </template>
                </Column>
                <Column field="epicId" header="Goal">
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="epics" placeholder="Search by Goal" />
                    </template>
                    <template #body="{ data, field }">
                        {{ epics.find(e => e.id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="epics"
                            placeholder="Select a Goal" />
                    </template>
                </Column>
            </XDataTable>
        </TabPanel>
        <TabPanel header="Use Cases">
            <p>
                Use Cases
            </p>
        </TabPanel>
    </TabView>
</template>