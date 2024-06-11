<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import InvariantRepository from '../../data/InvariantRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import CreateInvariantUseCase from '../../application/CreateInvariantUseCase';
import GetInvariantsUseCase from '../../application/GetInvariantsUseCase';
import UpdateInvariantUseCase from '../../application/UpdateInvariantUseCase';
import DeleteInvariantUseCase from '../../application/DeleteInvariantUseCase';
import type Invariant from '../../domain/Invariant';

useHead({
    title: 'Invariants'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    invariantRepository = new InvariantRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    environment = solution?.id && await getEnvironmentBySolutionIdUseCase.execute(solution.id),
    getInvariantsUseCase = new GetInvariantsUseCase(invariantRepository),
    createInvariantUseCase = new CreateInvariantUseCase(environmentRepository, invariantRepository),
    updateInvariantUseCase = new UpdateInvariantUseCase(invariantRepository),
    deleteInvariantUseCase = new DeleteInvariantUseCase(environmentRepository, invariantRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!environment)
        router.push({ name: 'Environment', params: { solutionSlug: slug } });
}

type InvariantViewModel = Pick<Invariant, 'id' | 'name' | 'statement'>;

const invariants = ref<InvariantViewModel[]>([]),
    emptyInvariant: InvariantViewModel = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    invariants.value = await getInvariantsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: InvariantViewModel) => {
    const newId = await createInvariantUseCase.execute({
        parentId: environment!.id,
        name: data.name,
        statement: data.statement
    })

    invariants.value = await getInvariantsUseCase.execute(environment!.id) ?? []
}

const onUpdate = async (data: InvariantViewModel) => {
    await updateInvariantUseCase.execute({
        id: data.id,
        name: data.name,
        statement: data.statement
    })

    invariants.value = await getInvariantsUseCase.execute(environment!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await deleteInvariantUseCase.execute(id)

    invariants.value = await getInvariantsUseCase.execute(environment!.id) ?? []
}
</script>

<template>
    <p>
        Invariants are properties that must always be true. They are used to
        constrain the possible states of a system.
    </p>

    <XDataTable :datasource="invariants" :empty-record="emptyInvariant" :filters="filters" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete">
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