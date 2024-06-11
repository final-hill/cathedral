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
import { emptyUuid, type Uuid } from '~/domain/Uuid';

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
    emptyObstacle: ObstacleViewModel = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    obstacles.value = await getObstaclesUseCase.execute(goals!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: ObstacleViewModel) => {
    const newId = await createObstacleUseCase.execute({
        parentId: goals!.id,
        name: data.name,
        statement: data.statement
    })

    obstacles.value = await getObstaclesUseCase.execute(goals!.id) ?? []
}

const onUpdate = async (data: ObstacleViewModel) => {
    await updateObstacleUseCase.execute({
        id: data.id,
        name: data.name,
        statement: data.statement
    })

    obstacles.value = await getObstaclesUseCase.execute(goals!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await deleteObstacleUseCase.execute({ parentId: goals!.id, id })

    obstacles.value = await getObstaclesUseCase.execute(goals!.id) ?? []
}

</script>

<template>
    <p>
        Obstacles are the challenges that prevent the goals from being achieved.
    </p>

    <XDataTable :datasource="obstacles" :empty-record="emptyObstacle" :filters="filters" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete">
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
    </XDataTable>
</template>