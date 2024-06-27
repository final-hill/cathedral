<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import StakeholderRepository from '../../data/StakeholderRepository';
import { FilterMatchMode } from 'primevue/api';
import Stakeholder from '../../domain/Stakeholder';
import mermaid from 'mermaid';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import StakeholderInteractor from '../../application/StakeholderInteractor';
import StakeholderCategoryInteractor from '../../application/StakeholderCategoryInteractor';
import StakeholderCategoryRepository from '../../data/StakeholderCategoryRepository';
import StakeholderSegmentationInteractor from '../../application/StakeholderSegmentationInteractor';
import StakeholderSegmentationRepository from '../../data/StakeholderSegmentationRepository';
import type StakeholderSegmentation from '../../domain/StakeholderSegmentation';
import type StakeholderCategory from '../../domain/StakeholderCategory';

useHead({ title: 'Stakeholders' })

const config = useAppConfig(),
    slug = useRoute().params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    stakeholderInteractor = new StakeholderInteractor(new StakeholderRepository()),
    stakeholderCategoryInteractor = new StakeholderCategoryInteractor(new StakeholderCategoryRepository()),
    stakeholderSegmentationInteractor = new StakeholderSegmentationInteractor(new StakeholderSegmentationRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id;

type StakeHolderViewModel = Pick<Stakeholder, 'id' | 'name' | 'statement' | 'availability' | 'influence' | 'categoryId' | 'segmentationId'>;
type StakeholderSegmentationModel = Pick<StakeholderSegmentation, 'id' | 'name'>;
type StakeholderCategoryModel = Pick<StakeholderCategory, 'id' | 'name'>;

const stakeholders = ref<StakeHolderViewModel[]>(await stakeholderInteractor.getAll({ solutionId })),
    categories = ref<StakeholderCategoryModel[]>(await stakeholderCategoryInteractor.getAll()),
    segmentations = ref<StakeholderSegmentationModel[]>(await stakeholderSegmentationInteractor.getAll()),
    emptyStakeholder: StakeHolderViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        availability: Stakeholder.AVAILABILITY_MIN,
        influence: Stakeholder.INFLUENCE_MIN,
        categoryId: emptyUuid,
        segmentationId: emptyUuid
    };

// watch the stakeholders and re-render the chart
watch(stakeholders, async () => {
    const groupStakeholders = Object.groupBy(stakeholders.value, ({ segmentationId }) => segmentationId),
        clientGroup = groupStakeholders[segmentations.value[0].id] ?? [],
        vendorGroup = groupStakeholders[segmentations.value[1].id] ?? [];

    clientMap.value!.textContent = chartDefinition(clientGroup, segmentations.value[0])
    vendorMap.value!.textContent = chartDefinition(vendorGroup, segmentations.value[1])

    await mermaid.run({
        nodes: [clientMap.value!, vendorMap.value!]
    })
});

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'availability': { value: null, matchMode: FilterMatchMode.EQUALS },
    'influence': { value: null, matchMode: FilterMatchMode.EQUALS },
    'categoryId': { value: null, matchMode: FilterMatchMode.EQUALS },
    'segmentationId': { value: null, matchMode: FilterMatchMode.EQUALS },
});

const themeMap = {
    light: 'default',
    dark: 'dark',
};

mermaid.initialize({
    startOnLoad: false,
    theme: themeMap[config.darkMode]
});

const chartDefinition = (stakeholders: StakeHolderViewModel[], category: StakeholderSegmentationModel) => `
    quadrantChart
    title ${category}
    x-axis Low Availability --> High Availability
    y-axis Low Infuence --> High Influence
    quadrant-1 "${categories.value[0].name} (Satisfy)"
    quadrant-2 "${categories.value[1].name} (Manage)"
    quadrant-3 "${categories.value[2].name} (Inform)"
    quadrant-4 "${categories.value[3].name} (Monitor)"
    ${stakeholders.map(({ name, availability, influence }) =>
    `"${name}": [${availability / 100}, ${influence / 100}]`)?.join('\n')
    }
`;

const clientMap = ref<HTMLElement>(),
    vendorMap = ref<HTMLElement>();

const onCreate = async (data: StakeHolderViewModel) => {
    const stakeholder = await stakeholderInteractor.create({
        ...data,
        solutionIdsolution,
        property: '',
        parentComponentId: emptyUuid
    })

    stakeholders.value = await stakeholderInteractor.getAll({ solutionId })
}

const onUpdate = async (data: StakeHolderViewModel) => {
    await stakeholderInteractor.update({
        ...data,
        solutionIdsolution,
        property: '',
        parentComponentId: emptyUuid
    })

    stakeholders.value = await stakeholderInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await stakeholderInteractor.delete(id)

    stakeholders.value = await stakeholderInteractor.getAll({ solutionId })
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
            <XDataTable :datasource="stakeholders" :filters="filters" :empty-record="emptyStakeholder"
                :on-create="onCreate" :on-update="onUpdate" :on-delete="onDelete">
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
                <Column field="categoryId" header="Category" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model="filterModel.value" :options="categories" optionLabel="name" optionValue="id"
                            @input="filterCallback()" />
                    </template>
                    <template #body="{ data, field }">
                        {{ categories.find(({ id }) => id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model="data[field]" :options="categories" optionLabel="name" optionValue="id"
                            required="true" />
                    </template>
                </Column>
                <Column field="segmentationId" header="Segmentation" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model="filterModel.value" :options="segmentations" optionLabel="name"
                            optionValue="id" @input="filterCallback()" />
                    </template>
                    <template #body="{ data, field }">
                        {{ segmentations.find(({ id }) => id === data[field])?.name }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model="data[field]" :options="segmentations" optionLabel="name" optionValue="id"
                            required="true" />
                    </template>
                </Column>
            </XDataTable>
        </TabPanel>
        <TabPanel header="Stakeholder Map">
            <section ref="clientMap"></section>
            <section ref="vendorMap"></section>
        </TabPanel>
    </TabView>
</template>