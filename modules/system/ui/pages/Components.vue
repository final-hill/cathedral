<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import SystemRepository from '../../data/SystemRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetSystemBySolutionIdUseCase from '../../application/GetSystemBySolutionIdUseCase';
import GetSystemComponentsUseCase from '../../application/GetSystemComponentsUseCase';
import CreateSystemComponentUseCase from '../../application/CreateSystemComponentUseCase';
import UpdateSystemComponentUseCase from '../../application/UpdateSystemComponentUseCase';
import DeleteSystemComponentUseCase from '../../application/DeleteSystemComponentUseCase';
import SystemComponentRepository from '../../data/SystemComponentRepository';
import SystemComponent from '../../domain/SystemComponent';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';

useHead({
    title: 'Components'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    systemRepository = new SystemRepository(),
    componentRepository = new SystemComponentRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getSystemBySolutionIdUseCase = new GetSystemBySolutionIdUseCase(systemRepository),
    system = solution?.id && await getSystemBySolutionIdUseCase.execute(solution.id),
    getComponentsUseCase = new GetSystemComponentsUseCase(componentRepository),
    createComponentUseCase = new CreateSystemComponentUseCase(componentRepository),
    updateComponentUseCase = new UpdateSystemComponentUseCase(componentRepository),
    deleteComponentUseCase = new DeleteSystemComponentUseCase(componentRepository)

if (!solution) {
    router.push({ name: 'Solutions' })
} else {
    if (!system)
        router.push({ name: 'System', params: { solutionSlug: slug } });
}

type SystemComponentViewModel = Pick<SystemComponent, 'id' | 'name' | 'statement' | 'parentId' | 'systemId'>;

const components = ref<SystemComponent[]>([]),
    emptyComponent: SystemComponentViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        parentId: emptyUuid,
        systemId: system!.id
    };

onMounted(async () => {
    components.value = await getComponentsUseCase.execute(system!.id);
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'parentId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onCreate = async ({ name, statement, parentId, systemId }: SystemComponentViewModel) => {
    await createComponentUseCase.execute({
        name, statement, parentId: parentId ?? emptyUuid, systemId, solutionId: solution!.id
    });

    components.value = await getComponentsUseCase.execute(system!.id);
}

const onUpdate = async ({ id, name, statement, parentId }: SystemComponentViewModel) => {
    await updateComponentUseCase.execute({
        id, name, statement, parentId: parentId ?? emptyUuid
    });

    components.value = await getComponentsUseCase.execute(system!.id);
}

const onDelete = async (id: Uuid) => {
    await deleteComponentUseCase.execute(id);

    components.value = await getComponentsUseCase.execute(system!.id);
}
</script>
<template>
    <p>
        Components describe the structure of the system as a list or hierarchy.
    </p>
    <XDataTable :datasource="components" :filters="filters" :emptyRecord="emptyComponent" :onCreate="onCreate"
        :onUpdate="onUpdate" :onDelete="onDelete">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" placeholder="Enter a name" />
            </template>
        </Column>
        <Column field="statement" header="Description">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by description" />
            </template>
            <template #body="{ data, field }">
                {{ data[field] }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" placeholder="Enter a description" />
            </template>
        </Column>
        <Column field="parentId" header="Parent">
            <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model.trim="filterModel.value" @input="filterCallback()" optionLabel="name" optionValue="id"
                    :options="components" placeholder="Search by Component" />
            </template>
            <template #body="{ data, field }">
                {{ components
                    .filter(c => c.id !== emptyUuid)
                    .find(c => c.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id"
                    :options="components.filter(c => c.id !== data.id)" placeholder="Select a Component" showClear />
            </template>
        </Column>
    </XDataTable>
</template>