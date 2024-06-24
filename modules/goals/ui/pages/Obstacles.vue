<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import { FilterMatchMode } from 'primevue/api';
import ObstacleRepository from '../../data/ObstacleRepository';
import type Obstacle from '../../domain/Obstacle';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import ObstacleInteractor from '../../application/ObstacleInteractor';

useHead({ title: 'Obstacles' })

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    obstacleInteractor = new ObstacleInteractor(new ObstacleRepository()),
    solution = (await solutionInteractor.getAll({ slug: slug }))[0]

if (!solution)
    router.push({ name: 'Solutions' });

type ObstacleViewModel = Pick<Obstacle, 'id' | 'name' | 'statement'>;

const obstacles = ref<ObstacleViewModel[]>([]),
    emptyObstacle: ObstacleViewModel = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    obstacles.value = await obstacleInteractor.getAll({ solutionId: solution!.id }) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: ObstacleViewModel) => {
    const newId = await obstacleInteractor.create({
        solutionId: solution!.id,
        name: data.name,
        statement: data.statement,
        property: ''
    })

    obstacles.value = await obstacleInteractor.getAll({ solutionId: solution!.id })
}

const onUpdate = async (data: ObstacleViewModel) => {
    await obstacleInteractor.update({
        id: data.id,
        name: data.name,
        statement: data.statement,
        property: '',
        solutionId: solution!.id
    })

    obstacles.value = await obstacleInteractor.getAll({ solutionId: solution!.id })
}

const onDelete = async (id: Uuid) => {
    await obstacleInteractor.delete(id)

    obstacles.value = await obstacleInteractor.getAll({ solutionId: solution!.id })
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
                <InputText v-model.trim="data[field]" required />
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