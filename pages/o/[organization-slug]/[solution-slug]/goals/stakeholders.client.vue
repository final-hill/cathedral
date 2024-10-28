<script lang="ts" setup>
import mermaid from 'mermaid';
import { StakeholderCategory } from '~/domain/requirements/StakeholderCategory.js';
import { StakeholderSegmentation } from '~/domain/requirements/StakeholderSegmentation.js';

interface StakeholderViewModel {
    id: string;
    name: string;
    description: string;
    category: string;
    segmentation: string;
    availability: number;
    influence: number;
    lastModified: Date;
}

useHead({ title: 'Stakeholders' })
definePageMeta({ name: 'Stakeholders' })

const config = useAppConfig(),
    { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Stakeholders').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: stakeholders, refresh: refreshStakeholders, status, error: getStakeholdersError } = await useFetch<StakeholderViewModel[]>(`/api/stakeholder`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getStakeholdersError.value)
    $eventBus.$emit('page-error', getStakeholdersError.value);

enum themeMap {
    light = 'default',
    dark = 'dark'
};

mermaid.initialize({
    startOnLoad: false,
    theme: themeMap[config.darkMode]
});

const chartDefinition = (stakeholders: StakeholderViewModel[], category: StakeholderSegmentation) => `
    quadrantChart
    title ${category}
    x-axis Low Availability --> High Availability
    y-axis Low Infuence --> High Influence
    quadrant-1 "${StakeholderCategory.KEY_STAKEHOLDER} (Satisfy)"
    quadrant-2 "${StakeholderCategory.SHADOW_INFLUENCER} (Manage)"
    quadrant-3 "${StakeholderCategory.FELLOW_TRAVELER} (Inform)"
    quadrant-4 "${StakeholderCategory.OBSERVER} (Monitor)"
    ${stakeholders.map(({ name, availability, influence }) =>
    `"${name}": [${availability / 100}, ${influence / 100}]`)?.join('\n')
    }
`;

const clientMap = ref<HTMLElement>(),
    vendorMap = ref<HTMLElement>();

const renderChart = async () => {
    const groupStakeholders = Object.groupBy(stakeholders.value!, ({ segmentation }) => segmentation ?? 'unknown'),
        clientGroup = groupStakeholders.Client ?? [],
        vendorGroup = groupStakeholders.Vendor ?? [];

    clientMap.value!.textContent = chartDefinition(clientGroup, StakeholderSegmentation.CLIENT)
    vendorMap.value!.textContent = chartDefinition(vendorGroup, StakeholderSegmentation.VENDOR)

    await mermaid.run({
        nodes: [clientMap.value!, vendorMap.value!]
    })
}

watch(stakeholders, renderChart);

const onCreate = async (data: StakeholderViewModel) => {
    await $fetch(`/api/stakeholder`, {
        method: 'POST',
        body: {
            name: data.name,
            description: data.description,
            category: data.category,
            segmentation: data.segmentation,
            availability: Number(data.availability),
            influence: Number(data.influence),
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refreshStakeholders()
}

const onUpdate = async (data: StakeholderViewModel) => {
    await $fetch(`/api/stakeholder/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            description: data.description,
            category: data.category,
            segmentation: data.segmentation,
            availability: Number(data.availability),
            influence: Number(data.influence),
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refreshStakeholders()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/stakeholder/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refreshStakeholders()
}
</script>

<template>
    <p>
        Stakeholders are the categories of people who are affected by the
        problem you are trying to solve. Do not list individuals, but rather
        groups or roles. Example: instead of "Jane Doe", use "Project Manager".
    </p>

    <TabView @tab-change="(e) => refreshStakeholders()">
        <TabPanel header="Stakeholders">
            <XDataTable :viewModel="{
                name: 'text',
                description: 'text',
                availability: 'number',
                influence: 'number',
                category: 'text',
                segmentation: 'text'
            }" :createModel="{
                name: 'text',
                description: 'text',
                availability: { type: 'number', max: 100, min: 0 },
                influence: { type: 'number', max: 100, min: 0 },
                category: Object.values(StakeholderCategory),
                segmentation: Object.values(StakeholderSegmentation)
            }" :editModel="{
                id: 'hidden',
                name: 'text',
                description: 'text',
                availability: { type: 'number', max: 100, min: 0 },
                influence: { type: 'number', max: 100, min: 0 },
                category: Object.values(StakeholderCategory),
                segmentation: Object.values(StakeholderSegmentation)
            }" :datasource="stakeholders" :on-create="onCreate" :on-update="onUpdate" :on-delete="onDelete"
                :loading="status === 'pending'" :organizationSlug="organizationslug" entityName="Stakeholder"
                :showRecycleBin="true">
            </XDataTable>
        </TabPanel>
        <TabPanel header="Stakeholder Map">
            <section ref="clientMap"></section>
            <section ref="vendorMap"></section>
        </TabPanel>
    </TabView>
</template>