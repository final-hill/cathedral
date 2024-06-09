<script lang="ts" setup>
import GoalsRepository from '../../data/GoalsRepository';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import OutcomeRepository from '../../data/OutcomeRepository';
import { FilterMatchMode } from 'primevue/api';
import type Outcome from '../../domain/Outcome';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetGoalsBySolutionIdUseCase from '../../application/GetGoalsBySolutionIdUseCase';
import GetOutcomesUseCase from '../../application/GetOutcomesUseCase';
import CreateOutcomeUseCase from '../../application/CreateOutcomeUseCase';
import UpdateOutcomeUseCase from '../../application/UpdateOutcomeUseCase';
import DeleteOutcomeUseCase from '../../application/DeleteOutcomeUseCase';
import { emptyUuid } from '~/domain/Uuid';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    goalsRepository = new GoalsRepository(),
    outcomeRepository = new OutcomeRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),
    goals = solution?.id && await getGoalsBySolutionIdUseCase.execute(solution.id),
    getOutcomesUseCase = new GetOutcomesUseCase(outcomeRepository),
    createOutcomeUseCase = new CreateOutcomeUseCase(goalsRepository, outcomeRepository),
    updateOutcomeUseCase = new UpdateOutcomeUseCase(outcomeRepository),
    deleteOutcomeUseCase = new DeleteOutcomeUseCase(goalsRepository, outcomeRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!goals)
        router.push({ name: 'Goals', params: { solutionSlug: slug } });
}

type OutcomeViewModel = Pick<Outcome, 'id' | 'name' | 'statement'>;

const outcomes = ref<OutcomeViewModel[]>([]),
    editingRows = ref<OutcomeViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    outcomes.value = await getOutcomesUseCase.execute(goals!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const createDisabled = ref(false)

const addNewRow = () => {
    outcomes.value.unshift({ id: emptyUuid, name: '', statement: '' })
    editingRows.value = [outcomes.value[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
}

const onRowEditSave = async (event: { newData: OutcomeViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const inputs = (originalEvent.target! as HTMLElement).closest('tr')!.querySelectorAll('input')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createOutcomeUseCase.execute({
            parentId: goals!.id,
            name: newData.name,
            statement: newData.statement
        })

        outcomes.value[index] = {
            id: newId,
            name: newData.name,
            statement: newData.statement
        }
        createDisabled.value = false
    } else {
        outcomes.value[index] = newData
        await updateOutcomeUseCase.execute(newData)
    }
}

const onRowEditCancel = ({ data, index }: { data: OutcomeViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    outcomes.value.splice(index, 1)
    createDisabled.value = false
}

const onRowDelete = async (outcome: OutcomeViewModel) => {
    if (!confirm(`Are you sure you want to delete ${outcome.name}?`))
        return
    outcomes.value = outcomes.value.filter(o => o.id !== outcome.id)
    await deleteOutcomeUseCase.execute({ parentId: goals!.id, id: outcome.id })
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
        Outcomes are the expected benefits, capabilities, or processes
        of the system that will be achieved by the associated project.
    </p>

    <Toolbar>
        <template #start>
            <Button label="Create" type="submit" severity="info" @click="addNewRow" :disabled="createDisabled" />
        </template>
    </Toolbar>
    <DataTable ref="dataTable" :value="outcomes" dataKey="id" filterDisplay="row" v-model:filters="filters"
        :globalFilterFields="['name', 'statement']" editMode="row" v-model:editingRows="editingRows"
        @row-edit-save="onRowEditSave" @row-edit-cancel="onRowEditCancel" @sort="onSort">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" autofocus />
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
                <InputText v-model.trim="data[field]" required="true" />
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
        <template #empty>No Outcomes found</template>
        <template #loading>Loading Outcomes...</template>
    </DataTable>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>