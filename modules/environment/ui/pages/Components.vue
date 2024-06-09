<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid } from '~/domain/Uuid';
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
    editingRows = ref<ComponentViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    components.value = await getComponentsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const createDisabled = ref(false)

const addNewRow = () => {
    components.value.unshift({ id: emptyUuid, name: '', statement: '' })
    editingRows.value = [components.value[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
}

const onRowEditSave = async (event: { newData: ComponentViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const inputs = (originalEvent.target! as HTMLElement).closest('tr')!.querySelectorAll('input')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createComponentUseCase.execute({
            parentId: environment!.id,
            name: newData.name,
            statement: newData.statement
        })

        components.value[index] = {
            id: newId,
            name: newData.name,
            statement: newData.statement
        }
        createDisabled.value = false
    } else {
        components.value[index] = newData
        await updateComponentUseCase.execute(newData)
    }
}

const onRowEditCancel = ({ data, index }: { data: ComponentViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    components.value.splice(index, 1)
    createDisabled.value = false
    dataTable.value!.d_sortField = 'name'
}

const onRowDelete = async (assumption: ComponentViewModel) => {
    if (!confirm(`Are you sure you want to delete ${assumption.name}?`))
        return
    components.value = components.value.filter(o => o.id !== assumption.id)
    await deleteComponentUseCase.execute(assumption.id)
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
        Environment components are the EXTERNAL elements that the system interacts with.
        These external components expose interfaces that the system uses to communicate with.
    </p>
    <Toolbar>
        <template #start>
            <Button label="Create" type="submit" severity="info" @click="addNewRow" :disabled="createDisabled" />
        </template>
    </Toolbar>
    <DataTable ref="dataTable" :value="components" dataKey="id" filterDisplay="row" v-model:filters="filters"
        :globalFilterFields="['name', 'statement']" editMode="row" v-model:editingRows="editingRows"
        @row-edit-save="onRowEditSave" @row-edit-cancel="onRowEditCancel" @sort="onSort" sortField="name"
        :sortOrder="1">
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
        <template #empty>No components found</template>
        <template #loading>Loading components...</template>
    </DataTable>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>