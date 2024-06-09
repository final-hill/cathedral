<script lang="ts" setup>
import GoalsRepository from '../../data/GoalsRepository';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import StakeholderRepository from '../../data/StakeholderRepository';
import { FilterMatchMode } from 'primevue/api';
import Stakeholder, { StakeholderCategory, StakeholderSegmentation } from '../../domain/Stakeholder';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetGoalsBySolutionIdUseCase from '../../application/GetGoalsBySolutionIdUseCase';
import GetStakeHoldersUseCase from '../../application/GetStakeHoldersUseCase';
import CreateStakeholderUseCase from '../../application/CreateStakeholderUseCase';
import UpdateStakeHolderUseCase from '../../application/UpdateStakeHolderUseCase';
import DeleteStakeholderUseCase from '../../application/DeleteStakeholderUseCase';
import mermaid from 'mermaid';
import { emptyUuid } from '~/domain/Uuid';
import GetStakeHolderByIdUseCase from '../../application/GetStakeHolderByIdUseCase';

const router = useRouter(),
    route = useRoute(),
    config = useAppConfig(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    goalsRepository = new GoalsRepository(),
    stakeholderRepository = new StakeholderRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),
    getStakeHoldersUseCase = new GetStakeHoldersUseCase(stakeholderRepository),
    getStakeHolderByIdUseCase = new GetStakeHolderByIdUseCase(stakeholderRepository),
    createStakeHolderUseCase = new CreateStakeholderUseCase(goalsRepository, stakeholderRepository),
    updateStakeHolderUseCase = new UpdateStakeHolderUseCase(stakeholderRepository),
    deleteStakeholderUseCase = new DeleteStakeholderUseCase(goalsRepository, stakeholderRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    goals = solution?.id && await getGoalsBySolutionIdUseCase.execute(solution.id)

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!goals)
        router.push({ name: 'Goals', params: { solutionSlug: slug } });
}

type StakeHolderViewModel = Pick<Stakeholder, 'id' | 'name' | 'statement' | 'availability' | 'influence' | 'category' | 'segmentation'>;

const stakeholders = ref<StakeHolderViewModel[]>([]),
    category = ref(Object.values(StakeholderCategory)),
    segmentation = ref(Object.values(StakeholderSegmentation)),
    editingRows = ref<StakeHolderViewModel[]>([]),
    dataTable = ref();

onMounted(async () => {
    stakeholders.value = (await getStakeHoldersUseCase.execute(goals!.id) ?? [])
        .map(o => ({
            id: o.id,
            name: o.name,
            statement: o.statement,
            availability: o.availability,
            influence: o.influence,
            category: o.category,
            segmentation: o.segmentation
        }))
})

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'availability': { value: null, matchMode: FilterMatchMode.EQUALS },
    'influence': { value: null, matchMode: FilterMatchMode.EQUALS },
    'category': { value: null, matchMode: FilterMatchMode.EQUALS },
    'segmentation': { value: null, matchMode: FilterMatchMode.EQUALS },
});

const themeMap = {
    light: 'default',
    dark: 'dark',
};

mermaid.initialize({
    startOnLoad: false,
    theme: themeMap[config.darkMode]
});

const chartDefinition = (stakeholders: StakeHolderViewModel[], category: StakeholderSegmentation) => `
    quadrantChart
    title ${category}
    x-axis Low Availability --> High Availability
    y-axis Low Infuence --> High Influence
    quadrant-1 "${StakeholderCategory.KeyStakeholder} (Satisfy)"
    quadrant-2 "${StakeholderCategory.ShadowInfluencer} (Manage)"
    quadrant-3 "${StakeholderCategory.Observer} (Inform)"
    quadrant-4 "${StakeholderCategory.FellowTraveler} (Monitor)"
    ${stakeholders.map(({ name, availability, influence }) =>
    `"${name}": [${availability / 100}, ${influence / 100}]`)?.join('\n')
    }
`;

const clientMap = ref<HTMLElement>(),
    vendorMap = ref<HTMLElement>();

// watch the stakeholders and re-render the chart
watch(stakeholders, async () => {
    const groupStakeholders = Object.groupBy(stakeholders.value, ({ segmentation }) => segmentation),
        clientGroup = groupStakeholders[StakeholderSegmentation.Client] ?? [],
        vendorGroup = groupStakeholders[StakeholderSegmentation.Vendor] ?? [];

    clientMap.value!.textContent = chartDefinition(clientGroup, StakeholderSegmentation.Client)
    vendorMap.value!.textContent = chartDefinition(vendorGroup, StakeholderSegmentation.Vendor)

    await mermaid.run({
        nodes: [clientMap.value!, vendorMap.value!]
    })
});

const createDisabled = ref(false)

const addNewRow = () => {
    stakeholders.value.unshift(new Stakeholder({
        id: emptyUuid,
        parentId: goals!.id,
        property: '',
        name: '',
        statement: '',
        availability: Stakeholder.AVAILABILITY_MIN,
        influence: Stakeholder.INFLUENCE_MIN,
        segmentation: StakeholderSegmentation.Client
    }))
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    dataTable.value!.d_sortField = null
    editingRows.value = [stakeholders.value[0]]

    // focus on the first input
    setTimeout(() => {
        const input = document.querySelector('.p-datatable-tbody tr input')! as HTMLInputElement
        input.focus()
    }, 100)
}

const onRowEditSave = async (event: { newData: StakeHolderViewModel, index: number, originalEvent: Event }) => {
    const { newData, index, originalEvent } = event

    const row = (originalEvent.target! as HTMLElement).closest('tr')!,
        inputs = row.querySelectorAll('input'),
        dropDowns = row.querySelectorAll('.p-dropdown[required="true"]')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (![...dropDowns].every(dd => {
        const value = dd.querySelector('.p-inputtext')!.textContent?.trim(),
            result = value !== '' && !value?.startsWith('Select')

        dd.classList.toggle('p-invalid', !result)

        return result
    })) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        const newId = await createStakeHolderUseCase.execute({
            parentId: goals!.id,
            name: newData.name,
            statement: newData.statement,
            availability: newData.availability,
            influence: newData.influence,
            segmentation: newData.segmentation
        })

        const newStakeholder = (await getStakeHolderByIdUseCase.execute(newId))!
        stakeholders.value[index] = newStakeholder
        createDisabled.value = false
    } else {
        await updateStakeHolderUseCase.execute({
            parentId: goals!.id,
            id: newData.id,
            name: newData.name,
            statement: newData.statement,
            availability: newData.availability,
            influence: newData.influence,
            segmentation: newData.segmentation
        })

        const newStakeholder = (await getStakeHolderByIdUseCase.execute(newData.id))!
        stakeholders.value[index] = newStakeholder
    }
}

const onRowEditInit = ({ originalEvent }: any) => {
    // focus on the first input when editing
    const row = originalEvent.target.closest('tr')
    setTimeout(() => {
        const input = row.querySelector('input')
        input.focus()
    }, 100)
}

const onRowEditCancel = ({ data, index }: { data: StakeHolderViewModel, index: number }) => {
    if (data.id !== emptyUuid)
        return

    stakeholders.value.splice(index, 1)
    createDisabled.value = false
}

const onRowDelete = async (stakeHolder: StakeHolderViewModel) => {
    if (!confirm(`Are you sure you want to delete ${stakeHolder.name}?`))
        return
    stakeholders.value = stakeholders.value.filter(o => o.id !== stakeHolder.id)

    await deleteStakeholderUseCase.execute({ parentId: goals!.id, id: stakeHolder.id })
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
        Stakeholders are the categories of people who are affected by the
        problem you are trying to solve. Do not list individuals, but rather
        groups or roles. Example: instead of "Jane Doe", use "Project Manager".
    </p>

    <TabView>
        <TabPanel header="Stakeholders">
            <Toolbar>
                <template #start>
                    <Button label="Create" type="submit" severity="info" @click="addNewRow"
                        :disabled="createDisabled" />
                </template>
            </Toolbar>

            <DataTable ref="dataTable" :value="stakeholders" dataKey="id" filterDisplay="row" v-model:filters="filters"
                :globalFilterFields="['name', 'statement', 'availability', 'influence', 'category', 'segmentation']"
                editMode="row" v-model:editingRows="editingRows" @row-edit-save="onRowEditSave"
                @row-edit-cancel="onRowEditCancel" @row-edit-init="onRowEditInit" @sort="onSort">
                <Column field="name" header="Name" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                            placeholder="Search by name" />
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
                <Column field="availability" header="Availability" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputNumber v-model.trim="filterModel.value" @input="filterCallback()" placeholder="(0-100)" />
                    </template>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputNumber v-model.trim="data[field]" :min="Stakeholder.AVAILABILITY_MIN"
                            :max="Stakeholder.AVAILABILITY_MAX" placeholder="(0-100)" />
                    </template>
                </Column>
                <Column field="influence" header="Influence" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputNumber v-model.trim="filterModel.value" @input="filterCallback()" placeholder="(0-100)" />
                    </template>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <InputNumber v-model.trim="data[field]" :min="Stakeholder.INFLUENCE_MIN"
                            :max="Stakeholder.INFLUENCE_MAX" placeholder="(0-100)" />
                    </template>
                </Column>
                <Column field="category" header="Category" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model="filterModel.value" :options="category" @input="filterCallback()" />
                    </template>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        - Computed -
                    </template>
                </Column>
                <Column field="segmentation" header="Segmentation" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model="filterModel.value" :options="segmentation" @input="filterCallback()" />
                    </template>
                    <template #body="{ data, field }">
                        {{ data[field] }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model="data[field]" :options="segmentation" required="true" />
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
                <template #empty>No Stakeholders found. </template>
                <template #loading>Loading Stakeholders...</template>
            </DataTable>
        </TabPanel>
        <TabPanel header="Stakeholder Map">
            <section ref="clientMap"></section>
            <section ref="vendorMap"></section>
        </TabPanel>
    </TabView>
</template>
<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>