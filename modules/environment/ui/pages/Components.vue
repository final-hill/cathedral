<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import ComponentRepository from '~/data/ComponentRepository';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import GetComponentsUseCase from '../../application/GetComponentsUseCase';
import CreateComponentUseCase from '../../application/CreateComponentUseCase';
import UpdateComponentUseCase from '../../application/UpdateComponentUseCase';
import DeleteComponentUseCase from '../../application/DeleteComponentUseCase';
import type Component from '~/domain/Component';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    componentRepository = new ComponentRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    environment = solution?.id && await getEnvironmentBySolutionIdUseCase.execute(solution.id),
    getComponentsUseCase = new GetComponentsUseCase(componentRepository),
    createComponentUseCase = new CreateComponentUseCase(environmentRepository, componentRepository),
    updateComponentUseCase = new UpdateComponentUseCase(componentRepository),
    deleteComponentUseCase = new DeleteComponentUseCase(environmentRepository, componentRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!environment)
        router.push({ name: 'Environment', params: { solutionSlug: slug } });
}

type ComponentViewModel = Pick<Component, 'id' | 'name' | 'statement'>;

const components = ref<ComponentViewModel[]>([]),
    emptyComponent = { id: emptyUuid, name: '', statement: '' };

onMounted(async () => {
    components.value = await getComponentsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: ComponentViewModel) => {
    const newId = await createComponentUseCase.execute({
        parentId: environment!.id,
        name: data.name,
        statement: data.statement
    })

    components.value = await getComponentsUseCase.execute(environment!.id) ?? []
}

const onDelete = async (id: Uuid) => {
    await deleteComponentUseCase.execute(id)
    components.value = await getComponentsUseCase.execute(environment!.id) ?? []
}

const onUpdate = async (data: ComponentViewModel) => {
    await updateComponentUseCase.execute(data)
    components.value = await getComponentsUseCase.execute(environment!.id) ?? []
}
</script>

<template>
    <p>
        Environment components are the EXTERNAL elements that the system interacts with.
        These external components expose interfaces that the system uses to communicate with.
    </p>
    <XDataTable :datasource="components" :empty-record="emptyComponent" :filters="filters" :on-create="onCreate"
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