<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import GlossaryTermRepository from '../../data/GlossaryTermRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import GetGlossaryTermsUseCase from '../../application/GetGlossaryTermsUseCase';
import CreateGlossaryTermUseCase from '../../application/CreateGlossaryTermUseCase';
import UpdateGlossaryTermUseCase from '../../application/UpdateGlossaryTermUseCase';
import DeleteGlossaryTermUseCase from '../../application/DeleteGlossaryTermUseCase';
import type GlossaryTerm from '../../domain/GlossaryTerm';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid } from '~/domain/Uuid';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    glossaryTermRepository = new GlossaryTermRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    environment = solution?.id && await getEnvironmentBySolutionIdUseCase.execute(solution.id),
    getGlossaryTermsUseCase = new GetGlossaryTermsUseCase(glossaryTermRepository),
    createGlossaryTermUseCase = new CreateGlossaryTermUseCase(environmentRepository, glossaryTermRepository),
    updateGlossaryTermUseCase = new UpdateGlossaryTermUseCase(glossaryTermRepository),
    deleteGlossaryTermUseCase = new DeleteGlossaryTermUseCase(environmentRepository, glossaryTermRepository);

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!environment)
        router.push({ name: 'Environment', params: { solutionSlug: slug } });
}

type GlossaryTermViewModel = Pick<GlossaryTerm, 'id' | 'name' | 'statement'>;

const glossaryTerms = ref<GlossaryTermViewModel[]>([]),
    editingRows = ref<GlossaryTermViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    glossaryTerms.value = await getGlossaryTermsUseCase.execute(environment!.id) ?? []
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const createDisabled = ref(false)

const addNewRow = () => {
    glossaryTerms.value.unshift({ id: emptyUuid, name: '', statement: '' })
    editingRows.value = [glossaryTerms.value[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
}

const onRowEditSave = async (event: { newData: GlossaryTermViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const inputs = (originalEvent.target! as HTMLElement).closest('tr')!.querySelectorAll('input')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createGlossaryTermUseCase.execute({
            parentId: environment!.id,
            name: newData.name,
            statement: newData.statement
        })

        glossaryTerms.value[index] = {
            id: newId,
            name: newData.name,
            statement: newData.statement
        }
        createDisabled.value = false
    } else {
        glossaryTerms.value[index] = newData
        await updateGlossaryTermUseCase.execute(newData)
    }
}

const onRowEditCancel = ({ data, index }: { data: GlossaryTermViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    glossaryTerms.value.splice(index, 1)
    createDisabled.value = false
    dataTable.value!.d_sortField = 'name'
}

const onRowDelete = async (glossaryTerm: GlossaryTermViewModel) => {
    if (!confirm(`Are you sure you want to delete ${glossaryTerm.name}?`))
        return
    glossaryTerms.value = glossaryTerms.value.filter(o => o.id !== glossaryTerm.id)
    await deleteGlossaryTermUseCase.execute(glossaryTerm.id)
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
        A Glossary is a list of terms in a particular domain of knowledge with the definitions for those terms.
    </p>
    <Toolbar>
        <template #start>
            <Button label="Create" type="submit" severity="info" @click="addNewRow" :disabled="createDisabled" />
        </template>
    </Toolbar>
    <DataTable ref="dataTable" :value="glossaryTerms" dataKey="id" filterDisplay="row" v-model:filters="filters"
        :globalFilterFields="['name', 'statement']" editMode="row" v-model:editingRows="editingRows"
        @row-edit-save="onRowEditSave" @row-edit-cancel="onRowEditCancel" @sort="onSort" sortField="name"
        :sortOrder="1">
        <Column field="name" header="Term" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by term" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" autofocus />
            </template>
        </Column>
        <Column field="statement" header="Definition">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by definition" />
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
        <template #empty>No Glossary terms found</template>
        <template #loading>Loading Glossary...</template>
    </DataTable>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>