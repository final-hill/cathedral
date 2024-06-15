<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import GoalsRepository from '../../data/GoalsRepository';
import EpicRepository from '../../data/EpicRepository';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import StakeholderRepository from '../../data/StakeholderRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetGoalsBySolutionIdUseCase from '../../application/GetGoalsBySolutionIdUseCase';
import GetStakeHoldersUseCase from '../../application/GetStakeHoldersUseCase';
import Stakeholder from '../../domain/Stakeholder';
import type Epic from '../../domain/Epic';
import EpicInteractor from '../../application/EpicInteractor';

useHead({
    title: 'Use Cases'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,

    goalsRepository = new GoalsRepository(),
    solutionRepository = new SolutionRepository(),
    epicRepository = new EpicRepository(),
    stakeholderRepository = new StakeholderRepository(),

    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),

    epicInteractor = new EpicInteractor(epicRepository),
    getStakeholdersUseCase = new GetStakeHoldersUseCase(stakeholderRepository),

    solution = await getSolutionBySlugUseCase.execute(slug),
    goals = solution?.id && await getGoalsBySolutionIdUseCase.execute(solution.id)

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!goals)
        router.push({ name: 'Goals', params: { solutionSlug: slug } });
}

type EpicViewModel = Pick<Epic, 'id' | 'name' | 'statement' | 'primaryActorId'>;

const epics = ref<EpicViewModel[]>([]),
    emptyEpic: EpicViewModel = { id: emptyUuid, name: '', statement: '', primaryActorId: emptyUuid },
    stakeHolders = ref<Stakeholder[]>(await getStakeholdersUseCase.execute(goals!.id) ?? [])

onMounted(async () => {
    epics.value = await epicInteractor.getAll(solution!.id) ?? []
})

const filters = ref({
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: EpicViewModel) => {
    const newId = await epicInteractor.create({
        parentId: goals!.id,
        solutionId: solution!.id,
        primaryActorId: data.primaryActorId,
        name: data.name,
        statement: data.statement
    });

    epics.value = await epicInteractor.getAll(solution!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await epicInteractor.delete(id);
    epics.value = await epicInteractor.getAll(solution!.id) ?? []
}

const onUpdate = async (data: EpicViewModel) => {
    await epicInteractor.update({
        id: data.id,
        parentId: goals!.id,
        solutionId: solution!.id,
        primaryActorId: data.primaryActorId,
        name: data.name,
        statement: data.statement
    });

    epics.value = await epicInteractor.getAll(solution!.id) ?? []
}
</script>

<template>
    <p>
        This section defines the main scenarios that the system must support to achieve the goals of the solution.
    </p>
    <p>
        Before you can define an Epic, you must define one or more
        <NuxtLink class="underline" :to="{ name: 'Stakeholders', params: { solutionSlug: slug } }">Actors</NuxtLink>.
    </p>

    <TabView>
        <TabPanel header="Epics">
            <XDataTable :datasource="epics" :filters="filters" :emptyRecord="emptyEpic" :on-create="onCreate"
                :on-delete="onDelete" :on-update="onUpdate">
                <Column field="name" header="Name" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                            placeholder="Search by name" />
                    </template>
                    <template #body="{ data }">
                        {{ data.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputText v-model.trim="data[field]" required="true" placeholder="Enter a name" />
                    </template>
                </Column>
                <Column field="primaryActorId" header="Actor" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name"
                            optionValue="id" :options="stakeHolders" placeholder="Search by Actor" />
                    </template>
                    <template #body="{ data }">
                        {{ stakeHolders.find(s => s.id === data.primaryActorId)?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id" :options="stakeHolders"
                            required="true" placeholder="Select an Actor" />
                    </template>
                </Column>
                <Column field="statement" header="Description">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                            placeholder="Search by description" />
                    </template>
                    <template #body="{ data }">
                        {{ data.statement }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputText v-model.trim="data[field]" required="true" placeholder="Enter a description" />
                    </template>
                </Column>
            </XDataTable>
        </TabPanel>
        <TabPanel header="Diagram">
            <p>TODO: Use Case Diagram</p>
        </TabPanel>
    </TabView>
</template>