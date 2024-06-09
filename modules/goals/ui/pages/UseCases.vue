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
    stakeHolders = ref<Stakeholder[]>(await getStakeholdersUseCase.execute(goals!.id) ?? []),
    editingRows = ref<UseCaseViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    useCases.value = await getUseCaseUseCase.execute(goals!.id) ?? []
})

const filters = ref({
    'primaryActorId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const createDisabled = ref(false)

const addNewRow = () => {
    useCases.value.unshift({ id: emptyUuid, name: '', statement: '', primaryActorId: emptyUuid })
    editingRows.value = [useCases.value[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
}

const onRowEditSave = async (event: { newData: UseCaseViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const row = (originalEvent.target! as HTMLElement).closest('tr')!,
        inputs = row.querySelectorAll('input'),
        dropDowns = row.querySelectorAll('.p-dropdown[required="true"]')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (![...dropDowns].every(dd => {
        const value = dd.querySelector('.p-inputtext')!.textContent?.trim(),
            result = value !== '' && !value?.startsWith('Select')

        dd.classList.toggle('p-invalid', !result)

        return result
    })) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createUseCaseUseCase.execute({
            parentId: goals!.id,
            name: newData.name,
            statement: newData.statement,
            primaryActorId: newData.primaryActorId
        })

        useCases.value[index] = {
            id: newId,
            name: newData.name,
            statement: newData.statement,
            primaryActorId: newData.primaryActorId
        }
        createDisabled.value = false
    } else {
        useCases.value[index] = newData
        await updateUseCaseUseCase.execute(newData)
    }
}

const onRowEditCancel = ({ data, index }: { data: UseCaseViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    useCases.value.splice(index, 1)
    createDisabled.value = false
}

const onRowDelete = async (useCase: UseCaseViewModel) => {
    if (!confirm('Are you sure you want to delete this Use Case?'))
        return
    useCases.value = useCases.value.filter(u => u.id !== useCase.id)

    await deleteUseCaseUseCase.execute({ id: useCase.id, parentId: goals!.id })
}

const onSort = (event: any) => {
    if (editingRows.value.length > 0) {
        editingRows.value = []
        createDisabled.value = false
    }
}
</script>

<template>
    <p>
        A Use Case describes the interaction between a system and an actor to achieve a specific goal.
        These can be thought of as analogous Epics
    </p>

    <TabView>
        <TabPanel header="Use Cases">
            <Toolbar>
                <template #start>
                    <Button label="Create" type="submit" severity="info" @click="addNewRow"
                        :disabled="createDisabled" />
                </template>
            </Toolbar>
            <DataTable ref="dataTable" :value="useCases" dataKey="id" filterDisplay="row" v-model:filters="filters"
                :globalFilterFields="['name', 'primaryActorId', 'statement']" editMode="row"
                v-model:editingRows="editingRows" @row-edit-save="onRowEditSave" @row-edit-cancel="onRowEditCancel"
                @sort="onSort">
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
                <Column frozen align-frozen="right">
                    <template #body="{ data, editorInitCallback }">
                        <Button icon="pi pi-pencil" text rounded @click="editorInitCallback" />
                        <Button icon="pi pi-trash" text rounded severity="danger" @click="onRowDelete(data)" />
                    </template>
                    <template #editor="{ editorSaveCallback, editorCancelCallback }">
                        <Button icon="pi pi-check" text rounded @click="editorSaveCallback" />
                        <Button icon="pi pi-times" text rounded severity="danger" @click="editorCancelCallback" />
                    </template>
                </Column>
                <template #empty>
                    No Use Cases found.
                    Before you can define a Use Case, you must define one or more
                    <NuxtLink :to="{ name: 'Stakeholders', params: { solutionSlug: slug } }"> Actors</NuxtLink>
                </template>
                <template #loading>Loading Use Cases...</template>
            </DataTable>
        </TabPanel>
        <TabPanel header="Diagram">
            <p>Diagram</p>
        </TabPanel>
    </TabView>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>