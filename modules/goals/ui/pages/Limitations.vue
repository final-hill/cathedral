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
import { emptyUuid, type Uuid } from '~/domain/Uuid';

useHead({
    title: 'Limitations'
})

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
    emptyLimit: LimitViewModel = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    limits.value = await getLimitsUseCase.execute(goals!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: LimitViewModel) => {
    const newId = await createLimitUseCase.execute({
        parentId: goals!.id,
        solutionId: solution!.id,
        name: data.name,
        statement: data.statement
    })

    limits.value = await getLimitsUseCase.execute(goals!.id) ?? []
}

const onUpdate = async (data: LimitViewModel) => {
    await updateLimitUseCase.execute({
        id: data.id,
        name: data.name,
        statement: data.statement
    })

    limits.value = await getLimitsUseCase.execute(goals!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await deleteLimitUseCase.execute({ parentId: goals!.id, id })

    limits.value = await getLimitsUseCase.execute(goals!.id) ?? []
}
</script>
<template>
    <p>
        Limitations are the constraints on functionality. They describe What that is out-of-scope and excluded.
        Example: "Providing an interface to the user to change the color of the background is out-of-scope."
    </p>

    <XDataTable :datasource="limits" :empty-record="emptyLimit" :filters="filters" :on-create="onCreate"
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
                <InputText v-model.trim="data[field]" required="true" />
            </template>
        </Column>
    </XDataTable>
</template>