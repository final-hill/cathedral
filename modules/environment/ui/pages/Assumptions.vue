<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import AssumptionRepository from '../../data/AssumptionRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import GetAssumptionsUseCase from '../../application/GetAssumptionsUseCase';
import CreateAssumptionUseCase from '../../application/CreateAssumptionUseCase';
import UpdateAssumptionUseCase from '../../application/UpdateAssumptionUseCase';
import DeleteAssumptionUseCase from '../../application/DeleteAssumptionUseCase';
import type Assumption from '../../domain/Assumption';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid } from '~/domain/Uuid';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    assumptionRepository = new AssumptionRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    environment = solution?.id && await getEnvironmentBySolutionIdUseCase.execute(solution.id),
    getAssumptionsUseCase = new GetAssumptionsUseCase(assumptionRepository),
    createAssumptionUseCase = new CreateAssumptionUseCase(environmentRepository, assumptionRepository),
    updateAssumptionUseCase = new UpdateAssumptionUseCase(assumptionRepository),
    deleteAssumptionUseCase = new DeleteAssumptionUseCase(environmentRepository, assumptionRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!environment)
        router.push({ name: 'Environment', params: { solutionSlug: slug } });
}

type AssumptionViewModel = Pick<Assumption, 'id' | 'name' | 'statement'>;

const assumptions = ref<AssumptionViewModel[]>([]),
    editingRows = ref<AssumptionViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    assumptions.value = await getAssumptionsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const createDisabled = ref(false)

const addNewRow = () => {
    assumptions.value.unshift({ id: emptyUuid, name: '', statement: '' })
    editingRows.value = [assumptions.value[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
}

const onRowEditSave = async (event: { newData: AssumptionViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const inputs = (originalEvent.target! as HTMLElement).closest('tr')!.querySelectorAll('input')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createAssumptionUseCase.execute({
            parentId: environment!.id,
            name: newData.name,
            statement: newData.statement
        })

        assumptions.value[index] = {
            id: newId,
            name: newData.name,
            statement: newData.statement
        }
        createDisabled.value = false
    } else {
        assumptions.value[index] = newData
        await updateAssumptionUseCase.execute(newData)
    }
}

const onRowEditCancel = ({ data, index }: { data: AssumptionViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    assumptions.value.splice(index, 1)
    createDisabled.value = false
    dataTable.value!.d_sortField = 'name'
}

const onRowDelete = async (assumption: AssumptionViewModel) => {
    if (!confirm(`Are you sure you want to delete ${assumption.name}?`))
        return
    assumptions.value = assumptions.value.filter(o => o.id !== assumption.id)
    await deleteAssumptionUseCase.execute(assumption.id)
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
        An assumption is a property of the environment that is assumed to be true.
        Assumptions are used to simplify the problem and to make it more tractable.
        An example of an assumption would be: "Screen resolution will not change during
        the execution of the program".
    </p>
    <Toolbar>
        <template #start>
            <Button label="Create" type="submit" severity="info" @click="addNewRow" :disabled="createDisabled" />
        </template>
    </Toolbar>
    <DataTable ref="dataTable" :value="assumptions" dataKey="id" filterDisplay="row" v-model:filters="filters"
        :globalFilterFields="['name', 'statement']" editMode="row" v-model:editingRows="editingRows"
        @row-edit-save="onRowEditSave" @row-edit-cancel="onRowEditCancel" @sort="onSort" sortField="name"
        :sortOrder="1">
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
        <template #empty>No assumptions found</template>
        <template #loading>Loading assumptions...</template>
    </DataTable>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>