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
import { emptyUuid, type Uuid } from '~/domain/Uuid';

useHead({
    title: 'Assumptions'
})

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
    emptyAssumption = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    assumptions.value = await getAssumptionsUseCase.execute(environment!.id) ?? []
})

const filters = ref<Record<string, { value: any, matchMode: string }>>({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: AssumptionViewModel) => {
    const newId = await createAssumptionUseCase.execute({
        parentId: environment!.id,
        name: data.name,
        statement: data.statement
    })

    assumptions.value = await getAssumptionsUseCase.execute(environment!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await deleteAssumptionUseCase.execute(id)
    assumptions.value = await getAssumptionsUseCase.execute(environment!.id) ?? []
}

const onUpdate = async (data: AssumptionViewModel) => {
    await updateAssumptionUseCase.execute(data)
    assumptions.value = await getAssumptionsUseCase.execute(environment!.id) ?? []
}
</script>

<template>
    <p>
        An assumption is a property of the environment that is assumed to be true.
        Assumptions are used to simplify the problem and to make it more tractable.
        An example of an assumption would be: "Screen resolution will not change during
        the execution of the program".
    </p>
    <XDataTable :datasource="assumptions" :filters="filters" :empty-record="emptyAssumption" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate">
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