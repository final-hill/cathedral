<script lang="ts" setup>
import GoalsRepository from '../../data/GoalsRepository';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import { FilterMatchMode } from 'primevue/api';
import LimitRepository from '../../data/LimitRepository';
import type Limit from '~/domain/Limit';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetGoalsBySolutionIdUseCase from '../../application/GetGoalsBySolutionIdUseCase';
import GetLimitsUseCase from '../../application/GetLimitsUseCase';
import CreateLimitUseCase from '../../application/CreateLimitUseCase';
import UpdateLimitUseCase from '../../application/UpdateLimitUseCase';
import DeleteLimitUseCase from '../../application/DeleteLimitUseCase';
import { emptyUuid } from '~/domain/Uuid';
import type Button from 'primevue/button';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    goalsRepository = new GoalsRepository(),
    limitRepository = new LimitRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),
    goals = solution?.id && await getGoalsBySolutionIdUseCase.execute(solution.id),
    getLimitsUseCase = new GetLimitsUseCase(limitRepository),
    createLimitUseCase = new CreateLimitUseCase(goalsRepository, limitRepository),
    updateLimitUseCase = new UpdateLimitUseCase(limitRepository),
    deleteLimitUseCase = new DeleteLimitUseCase(goalsRepository, limitRepository);

if (!solution) {
    router.push({ name: 'Solutions' })
} else {
    if (!goals)
        router.push({ name: 'Goals', params: { solutionSlug: slug } });
}

type LimitViewModel = Pick<Limit, 'id' | 'name' | 'statement'>;

const limits = ref<LimitViewModel[]>([]),
    editingRows = ref<LimitViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    limits.value = await getLimitsUseCase.execute(goals!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const createDisabled = ref(false)

const addNewRow = () => {
    limits.value.unshift({ id: emptyUuid, name: '', statement: '' })
    editingRows.value = [limits.value[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
}

const onRowEditSave = async (event: { newData: LimitViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const inputs = (originalEvent.target! as HTMLElement).closest('tr')!.querySelectorAll('input')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createLimitUseCase.execute({
            parentId: goals!.id,
            name: newData.name,
            statement: newData.statement
        })
        limits.value[index] = {
            id: newId,
            name: newData.name,
            statement: newData.statement
        }
        createDisabled.value = false
    } else {
        limits.value[index] = newData
        await updateLimitUseCase.execute(newData)
    }
}

const onRowEditCancel = ({ data, index }: { data: LimitViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    limits.value.splice(index, 1)
    createDisabled.value = false
}

const onRowDelete = async (limit: LimitViewModel) => {
    if (!confirm(`Are you sure you want to delete ${limit.name}?`))
        return
    limits.value = limits.value.filter(o => o.id !== limit.id)
    await deleteLimitUseCase.execute({ parentId: goals!.id, id: limit.id })
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
        Limitations are the constraints on functionality. They describe What that is out-of-scope and excluded.
        Example: "Providing an interface to the user to change the color of the background is out-of-scope."
    </p>

    <Toolbar>
        <template #start>
            <Button label="Create" type="submit" severity="info" @click="addNewRow" :disabled="createDisabled" />
        </template>
    </Toolbar>
    <DataTable ref="dataTable" :value="limits" dataKey="id" filterDisplay="row" v-model:filters="filters"
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
                <InputText v-model.trim="data[field]" required autofocus />
            </template>
        </Column>
        <Column field="statement" header="Description">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by Description" />
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
        <template #empty>No Limitations found</template>
        <template #loading>Loading Limitations...</template>
    </DataTable>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>