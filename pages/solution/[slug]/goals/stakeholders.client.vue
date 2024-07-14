<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import mermaid from 'mermaid';
import Stakeholder from '~/server/domain/Stakeholder';
import StakeholderCategory from '~/server/domain/StakeholderCategory';
import StakeholderSegmentation from '~/server/domain/StakeholderSegmentation';
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';

useHead({ title: 'Stakeholders' })
definePageMeta({ name: 'Stakeholders' })

const config = useAppConfig(),
    slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${slug}`),
    solutionId = solutions.value?.[0].id;

type StakeHolderViewModel = Pick<Stakeholder, 'id' | 'name' | 'statement' | 'availability' | 'influence' | 'categoryId' | 'segmentationId'>;

const { data: stakeholders, refresh, status } = useFetch(`/api/stakeholders?solutionId=${solutionId}`),
    categories = ref<StakeholderCategory[]>(Object.values(StakeholderCategory)),
    segmentations = ref<StakeholderSegmentation[]>(Object.values(StakeholderSegmentation)),
    emptyStakeholder: StakeHolderViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        availability: Stakeholder.AVAILABILITY_MIN,
        influence: Stakeholder.INFLUENCE_MIN,
        categoryId: 'KEY_STAKEHOLDER',
        segmentationId: 'VENDOR'
    };

// watch the stakeholders and re-render the chart
watch(stakeholders, async () => {
    const groupStakeholders = Object.groupBy(stakeholders.value!, ({ segmentationId }) => segmentationId),
        clientGroup = groupStakeholders.CLIENT ?? [],
        vendorGroup = groupStakeholders.VENDOR ?? [];

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

const chartDefinition = (stakeholders: StakeHolderViewModel[], category: StakeholderSegmentation) => `
    quadrantChart
    title ${category}
    x-axis Low Availability --> High Availability
    y-axis Low Infuence --> High Influence
    quadrant-1 "${categories.value[0].id} (Satisfy)"
    quadrant-2 "${categories.value[1].id} (Manage)"
    quadrant-3 "${categories.value[2].id} (Inform)"
    quadrant-4 "${categories.value[3].id} (Monitor)"
    ${stakeholders.map(({ name, availability, influence }) =>
    `"${name}": [${availability / 100}, ${influence / 100}]`)?.join('\n')
    }
`;

const clientMap = ref<HTMLElement>(),
    vendorMap = ref<HTMLElement>();

const onCreate = async (data: StakeHolderViewModel) => {
    await $fetch('/api/stakeholders', {
        method: 'POST',
        body: {
            ...data,
            solutionId,
            parentComponentId: emptyUuid
        }
    })

    refresh()
}

const onUpdate = async (data: StakeHolderViewModel) => {
    await $fetch(`/api/stakeholders/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId,
            parentComponentId: emptyUuid
        }
    })

    refresh()
}

const onDelete = async (id: Uuid) => {
    await $fetch(`/api/stakeholders/${id}`, { method: 'DELETE' })

    refresh()
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
                        <Dropdown v-model="filterModel.value" :options="categories" optionLabel="description"
                            optionValue="id" @input="filterCallback()" />
                    </template>
                    <template #body="{ data, field }">
                        {{ categories.find(({ id }) => id === data[field])?.description }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model="data[field]" :options="categories" optionLabel="description" optionValue="id"
                            required="true" />
                    </template>
                </Column>
                <Column field="segmentationId" header="Segmentation" sortable>
                    <template #filter="{ filterModel, filterCallback }">
                        <Dropdown v-model="filterModel.value" :options="segmentations" optionLabel="description"
                            optionValue="id" @input="filterCallback()" />
                    </template>
                    <template #body="{ data, field }">
                        {{ segmentations.find(({ id }) => id === data[field])?.description }}
                    </template>
                    <template #editor="{ data, field }">
                        <Dropdown v-model="data[field]" :options="segmentations" optionLabel="description"
                            optionValue="id" required="true" />
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