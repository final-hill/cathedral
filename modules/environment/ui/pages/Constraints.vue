<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid } from '~/domain/Uuid';
import ConstraintRepository from '../../data/ConstraintRepository';
import GetConstraintsUseCase from '../../application/GetConstraintsUseCase';
import CreateConstraintUseCase from '../../application/CreateConstraintUseCase';
import UpdateConstraintUseCase from '../../application/UpdateConstraintUseCase';
import DeleteConstraintUseCase from '../../application/DeleteConstraintUseCase';
import type Constraint from '../../domain/Constraint';
import { ConstraintCategory } from '../../domain/Constraint';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    constraintRepository = new ConstraintRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    environment = solution?.id && await getEnvironmentBySolutionIdUseCase.execute(solution.id),
    getConstraintsUseCase = new GetConstraintsUseCase(constraintRepository),
    createConstraintUseCase = new CreateConstraintUseCase(environmentRepository, constraintRepository),
    updateConstraintUseCase = new UpdateConstraintUseCase(constraintRepository),
    deleteConstraintUseCase = new DeleteConstraintUseCase(environmentRepository, constraintRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!environment)
        router.push({ name: 'Environment', params: { solutionSlug: slug } });
}

type ConstraintViewModel = Pick<Constraint, 'id' | 'name' | 'statement' | 'category'>;

const constraints = ref<ConstraintViewModel[]>([]),
    categories = ref<ConstraintCategory[]>(Object.values(ConstraintCategory)),
    editingRows = ref<ConstraintViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    constraints.value = await getConstraintsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'category': { value: null, matchMode: FilterMatchMode.EQUALS }
});

const createDisabled = ref(false)

const addNewRow = () => {
    constraints.value.unshift({ id: emptyUuid, name: '', statement: '', category: ConstraintCategory.BusinessRule })
    editingRows.value = [constraints.value[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
}

const onRowEditSave = async (event: { newData: ConstraintViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const inputs = (originalEvent.target! as HTMLElement).closest('tr')!.querySelectorAll('input')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createConstraintUseCase.execute({
            parentId: environment!.id,
            name: newData.name,
            statement: newData.statement,
            category: newData.category
        })

        constraints.value[index] = {
            id: newId,
            name: newData.name,
            statement: newData.statement,
            category: newData.category
        }
        createDisabled.value = false
    } else {
        constraints.value[index] = newData
        await updateConstraintUseCase.execute(newData)
    }
}

const onRowEditCancel = ({ data, index }: { data: ConstraintViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    constraints.value.splice(index, 1)
    createDisabled.value = false
    dataTable.value!.d_sortField = 'name'
}

const onRowDelete = async (constraint: ConstraintViewModel) => {
    if (!confirm(`Are you sure you want to delete ${constraint.name}?`))
        return
    constraints.value = constraints.value.filter(o => o.id !== constraint.id)
    await deleteConstraintUseCase.execute(constraint.id)
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
        Environmental constraints are the limitations and obligations that
        the environment imposes on the project and system.
    </p>
    <Toolbar>
        <template #start>
            <Button label="Create" type="submit" severity="info" @click="addNewRow" :disabled="createDisabled" />
        </template>
    </Toolbar>
    <DataTable ref="dataTable" :value="constraints" dataKey="id" filterDisplay="row" v-model:filters="filters"
        :globalFilterFields="['name', 'statement', 'category']" editMode="row" v-model:editingRows="editingRows"
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
        <Column field="category" header="Category" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" :options="categories" @input="filterCallback()" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model="data[field]" :options="categories" required="true" />
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
        <template #empty>No constraints found</template>
        <template #loading>Loading constraints...</template>
    </DataTable>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>