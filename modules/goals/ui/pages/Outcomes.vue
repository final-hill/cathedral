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
import { emptyUuid, type Uuid } from '~/domain/Uuid';

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
    emptyOutcome: OutcomeViewModel = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    outcomes.value = await getOutcomesUseCase.execute(goals!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: OutcomeViewModel) => {
    const newId = await createOutcomeUseCase.execute({
        parentId: goals!.id,
        name: data.name,
        statement: data.statement
    })

    outcomes.value = await getOutcomesUseCase.execute(goals!.id) ?? []
}

const onUpdate = async (data: OutcomeViewModel) => {
    await updateOutcomeUseCase.execute({
        id: data.id,
        name: data.name,
        statement: data.statement
    })

    outcomes.value = await getOutcomesUseCase.execute(goals!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await deleteOutcomeUseCase.execute({ parentId: goals!.id, id })

    outcomes.value = await getOutcomesUseCase.execute(goals!.id) ?? []
}
</script>

<template>
    <p>
        Outcomes are the expected benefits, capabilities, or processes
        of the system that will be achieved by the associated project.
    </p>

    <XDataTable :datasource="outcomes" :filters="filters" :empty-record="emptyOutcome" :onCreate="onCreate"
        :onUpdate="onUpdate" :onDelete="onDelete">
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
    </XDataTable>
</template>