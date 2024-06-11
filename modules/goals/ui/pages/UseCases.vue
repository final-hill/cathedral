<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import GoalsRepository from '../../data/GoalsRepository';
import UseCaseRepository from '~/data/UseCaseRepository';
import { FilterMatchMode } from 'primevue/api';
import UseCase from '~/domain/UseCase';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import StakeholderRepository from '../../data/StakeholderRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetGoalsBySolutionIdUseCase from '../../application/GetGoalsBySolutionIdUseCase';
import GetUseCaseUseCase from '../../application/GetUseCaseUseCase';
import CreateUseCaseUseCase from '../../application/CreateUseCaseUseCase';
import DeleteUseCaseUseCase from '../../application/DeleteUseCaseUseCase';
import GetStakeHoldersUseCase from '../../application/GetStakeHoldersUseCase';
import UpdateUseCaseUseCase from '../../application/UpdateUseCaseUseCase';
import Stakeholder from '../../domain/Stakeholder';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,

    goalsRepository = new GoalsRepository(),
    solutionRepository = new SolutionRepository(),
    useCaseRepository = new UseCaseRepository(),
    stakeholderRepository = new StakeholderRepository(),

    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),

    getUseCaseUseCase = new GetUseCaseUseCase(useCaseRepository),
    createUseCaseUseCase = new CreateUseCaseUseCase(goalsRepository, useCaseRepository),
    updateUseCaseUseCase = new UpdateUseCaseUseCase(useCaseRepository),
    deleteUseCaseUseCase = new DeleteUseCaseUseCase(goalsRepository, useCaseRepository),
    getStakeholdersUseCase = new GetStakeHoldersUseCase(stakeholderRepository),

    solution = await getSolutionBySlugUseCase.execute(slug),
    goals = solution?.id && await getGoalsBySolutionIdUseCase.execute(solution.id)

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!goals)
        router.push({ name: 'Goals', params: { solutionSlug: slug } });
}

type UseCaseViewModel = Pick<UseCase, 'id' | 'name' | 'statement' | 'primaryActorId'>;

const useCases = ref<UseCaseViewModel[]>([]),
    emptyUseCase: UseCaseViewModel = { id: emptyUuid, name: '', statement: '', primaryActorId: emptyUuid },
    stakeHolders = ref<Stakeholder[]>(await getStakeholdersUseCase.execute(goals!.id) ?? [])

onMounted(async () => {
    useCases.value = await getUseCaseUseCase.execute(goals!.id) ?? []
})

const filters = ref({
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: UseCaseViewModel) => {
    const newId = await createUseCaseUseCase.execute({
        ...data,
        parentId: goals!.id
    });

    useCases.value = await getUseCaseUseCase.execute(goals!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await deleteUseCaseUseCase.execute({ id, parentId: goals!.id });
    useCases.value = await getUseCaseUseCase.execute(goals!.id) ?? []
}

const onUpdate = async (data: UseCaseViewModel) => {
    await updateUseCaseUseCase.execute({
        ...data,
    });

    useCases.value = await getUseCaseUseCase.execute(goals!.id) ?? []
}
</script>

<template>
    <p>
        A Use Case describes the interaction between a system and an actor to achieve a specific goal.
        These can be thought of as analogous Epics.
    </p>
    <p>
        Before you can define a Use Case, you must define one or more
        <NuxtLink class="underline" :to="{ name: 'Stakeholders', params: { solutionSlug: slug } }">Actors</NuxtLink>.
    </p>

    <TabView>
        <TabPanel header="Use Cases">
            <XDataTable :datasource="useCases" :filters="filters" :emptyRecord="emptyUseCase" :on-create="onCreate"
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
            <p>Diagram</p>
        </TabPanel>
    </TabView>
</template>