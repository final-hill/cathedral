<script lang="ts" setup>

import { FilterMatchMode } from 'primevue/api';
import { emptyUuid } from '~/domain/Uuid';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import EffectRepository from '../../data/EffectRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import GetEffectsUseCase from '../../application/GetEffectsUseCase';
import CreateEffectUseCase from '../../application/CreateEffectUseCase';
import UpdateEffectUseCase from '../../application/UpdateEffectUseCase';
import DeleteEffectUseCase from '../../application/DeleteEffectUseCase';
import type Effect from '../../domain/Effect';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    effectRepository = new EffectRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    environment = solution?.id && await getEnvironmentBySolutionIdUseCase.execute(solution.id),
    getEffectsUseCase = new GetEffectsUseCase(effectRepository),
    createEffectUseCase = new CreateEffectUseCase(environmentRepository, effectRepository),
    updateEffectUseCase = new UpdateEffectUseCase(effectRepository),
    deleteEffectUseCase = new DeleteEffectUseCase(environmentRepository, effectRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!environment)
        router.push({ name: 'Environment', params: { solutionSlug: slug } });
}

type EffectViewModel = Pick<Effect, 'id' | 'name' | 'statement'>;

const effects = ref<EffectViewModel[]>([]),
    editingRows = ref<EffectViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    effects.value = await getEffectsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const createDisabled = ref(false)

const addNewRow = () => {
    effects.value.unshift({ id: emptyUuid, name: '', statement: '' })
    editingRows.value = [effects.value[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
}

const onRowEditSave = async (event: { newData: EffectViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const inputs = (originalEvent.target! as HTMLElement).closest('tr')!.querySelectorAll('input')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createEffectUseCase.execute({
            parentId: environment!.id,
            name: newData.name,
            statement: newData.statement
        })

        effects.value[index] = {
            id: newId,
            name: newData.name,
            statement: newData.statement
        }
        createDisabled.value = false
    } else {
        effects.value[index] = newData
        await updateEffectUseCase.execute(newData)
    }
}

const onRowEditCancel = ({ data, index }: { data: EffectViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    effects.value.splice(index, 1)
    createDisabled.value = false
    dataTable.value!.d_sortField = 'name'
}

const onRowDelete = async (assumption: EffectViewModel) => {
    if (!confirm(`Are you sure you want to delete ${assumption.name}?`))
        return
    effects.value = effects.value.filter(o => o.id !== assumption.id)
    await deleteEffectUseCase.execute(assumption.id)
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
        An Effect is an environment property affected by a System.
        Example: "The running system will cause the temperature of the room to increase."
    </p>
    <Toolbar>
        <template #start>
            <Button label="Create" type="submit" severity="info" @click="addNewRow" :disabled="createDisabled" />
        </template>
    </Toolbar>
    <DataTable ref="dataTable" :value="effects" dataKey="id" filterDisplay="row" v-model:filters="filters"
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
        <template #empty>No effects found</template>
        <template #loading>Loading effects...</template>
    </DataTable>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>