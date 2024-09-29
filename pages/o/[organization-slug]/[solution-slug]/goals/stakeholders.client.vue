<script lang="ts" setup>
import mermaid from 'mermaid';
import { Stakeholder } from '~/server/domain/requirements/Stakeholder';
import { StakeholderCategory } from '~/server/domain/requirements/StakeholderCategory';
import { StakeholderSegmentation } from '~/server/domain/requirements/StakeholderSegmentation';

useHead({ title: 'Stakeholders' })
definePageMeta({ name: 'Stakeholders' })

const config = useAppConfig(),
    { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Stakeholders').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const { data: stakeholders, refresh, status, error: getStakeholdersError } = await useFetch<Stakeholder[]>(`/api/stakeholders`, {
    query: { solutionId },
    transform: (data) => data.map((item) => {
        item.lastModified = new Date(item.lastModified)
        return item
    })
})

if (getStakeholdersError.value)
    $eventBus.$emit('page-error', getStakeholdersError.value);

// watch the stakeholders and re-render the chart
watch(stakeholders, async () => {
    const groupStakeholders = Object.groupBy(stakeholders.value!, ({ segmentation }) => segmentation ?? 'unknown'),
        clientGroup = groupStakeholders.Client ?? [],
        vendorGroup = groupStakeholders.Vendor ?? [];

    clientMap.value!.textContent = chartDefinition(clientGroup, StakeholderSegmentation.CLIENT)
    vendorMap.value!.textContent = chartDefinition(vendorGroup, StakeholderSegmentation.VENDOR)

    await mermaid.run({
        nodes: [clientMap.value!, vendorMap.value!]
    })
});

enum themeMap {
    light = 'default',
    dark = 'dark'
};

mermaid.initialize({
    startOnLoad: false,
    theme: themeMap[config.darkMode]
});

const chartDefinition = (stakeholders: Stakeholder[], category: StakeholderSegmentation) => `
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

const onCreate = async (data: Stakeholder) => {
    await $fetch(`/api/stakeholders`, {
        method: 'POST',
        body: {
            ...data,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: Stakeholder) => {
    await $fetch(`/api/stakeholders/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/stakeholders/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

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
            <XDataTable :viewModel="{
                name: 'text',
                statement: 'text',
                availability: 'number',
                influence: 'number',
                category: 'text',
                segmentation: 'text'
            }" :createModel="{
                name: 'text',
                statement: 'text',
                availability: { type: 'number', max: 100, min: 0 },
                influence: { type: 'number', max: 100, min: 0 },
                category: Object.values(StakeholderCategory),
                segmentation: Object.values(StakeholderSegmentation)
            }" :editModel="{
                id: 'hidden',
                name: 'text',
                statement: 'text',
                availability: { type: 'number', max: 100, min: 0 },
                influence: { type: 'number', max: 100, min: 0 },
                category: Object.values(StakeholderCategory),
                segmentation: Object.values(StakeholderSegmentation)
            }" :datasource="stakeholders" :on-create="onCreate" :on-update="onUpdate" :on-delete="onDelete"
                :loading="status === 'pending'">
            </XDataTable>
        </TabPanel>
        <TabPanel header="Stakeholder Map">
            <section ref="clientMap"></section>
            <section ref="vendorMap"></section>
        </TabPanel>
    </TabView>
</template>