<script lang="ts" setup>
import GoalsRepository from '../../data/GoalsRepository';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import { FilterMatchMode } from 'primevue/api';
import ObstacleRepository from '../../data/ObstacleRepository';
import type Obstacle from '../../domain/Obstacle';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetGoalsBySolutionIdUseCase from '../../application/GetGoalsBySolutionIdUseCase';
import GetObstaclesUseCase from '../../application/GetObstaclesUseCase';
import CreateObstacleUseCase from '../../application/CreateObstacleUseCase';
import UpdateObstacleUseCase from '../../application/UpdateObstacleUseCase';
import DeleteObstacleUseCase from '../../application/DeleteObstacleUseCase';
import { emptyUuid } from '~/domain/Uuid';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    goalsRepository = new GoalsRepository(),
    obstacleRepository = new ObstacleRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),
    goals = solution?.id && await getGoalsBySolutionIdUseCase.execute(solution.id),
    getObstaclesUseCase = new GetObstaclesUseCase(obstacleRepository),
    createObstacleUseCase = new CreateObstacleUseCase(goalsRepository, obstacleRepository),
    updateObstacleUseCase = new UpdateObstacleUseCase(obstacleRepository),
    deleteObstacleUseCase = new DeleteObstacleUseCase(goalsRepository, obstacleRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!goals)
        router.push({ name: 'Goals', params: { solutionSlug: slug } });
}

type ObstacleViewModel = Pick<Obstacle, 'id' | 'name' | 'statement'>;

const obstacles = ref<ObstacleViewModel[]>([]),
    editingRows = ref<ObstacleViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    obstacles.value = await getObstaclesUseCase.execute(goals!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const createDisabled = ref(false)

const addNewRow = () => {
    obstacles.value.unshift({ id: emptyUuid, name: '', statement: '' })
    editingRows.value = [obstacles.value[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
}

const onRowEditSave = async (event: { newData: ObstacleViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const inputs = (originalEvent.target! as HTMLElement).closest('tr')!.querySelectorAll('input')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createObstacleUseCase.execute({
            parentId: goals!.id,
            name: newData.name,
            statement: newData.statement
        })

        obstacles.value[index] = {
            id: newId,
            name: newData.name,
            statement: newData.statement
        }
        createDisabled.value = false
    } else {
        obstacles.value[index] = newData
        await updateObstacleUseCase.execute(newData)
    }
}

const onRowEditCancel = ({ data, index }: { data: ObstacleViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    obstacles.value.splice(index, 1)
    createDisabled.value = false
}

const onRowDelete = async (obstacle: ObstacleViewModel) => {
    if (!confirm(`Are you sure you want to delete ${obstacle.name}?`))
        return
    obstacles.value = obstacles.value.filter(o => o.id !== obstacle.id)
    await deleteObstacleUseCase.execute({ parentId: goals!.id, id: obstacle.id })
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
        Obstacles are the challenges that prevent the goals from being achieved.
    </p>

    <Toolbar>
        <template #start>
            <Button label="Create" type="submit" severity="info" @click="addNewRow" :disabled="createDisabled" />
        </template>
    </Toolbar>
    <DataTable ref="dataTable" :value="obstacles" dataKey="id" filterDisplay="row" v-model:filters="filters"
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
                <InputText v-model.trim="data[field]" />
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
        <template #empty>No Obstacles found</template>
        <template #loading>Loading Obstacles...</template>
    </DataTable>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>