<script lang="ts" setup>
import type { DataTableRowExpandEvent, DataTableRowCollapseEvent, DataTableExpandedRows } from 'primevue/datatable';
import type { ParsedRequirementViewModel, RequirementViewModel, SolutionViewModel } from '#shared/models';
import type { ReqType } from '~/domain/requirements/ReqType';
import { camelCaseToTitle, snakeCaseToSlug, snakeCaseToTitle } from '~/shared/utils';

useHead({ title: 'Workbox' });
definePageMeta({ name: 'Workbox' });

const { $eventBus } = useNuxtApp(),
    { solutionslug: slug, organizationslug: organizationSlug } = useRoute('Workbox').params,
    { data: solution, error: solutionError } = await useFetch<SolutionViewModel>(`/api/solution/${slug}`, {
        query: { organizationSlug }
    })

if (!solution.value) {
    $eventBus.$emit('page-error', solutionError.value);
    throw new Error('Solution not found');
}

const { data: parsedRequirements, error: parsedRequirementsError, refresh } = await useFetch<ParsedRequirementViewModel[]>('/api/parse-requirement', {
    method: 'get',
    query: { solutionId: solution.value.id, organizationSlug },
    transform: (data: ParsedRequirementViewModel[]) => data.map((parsedRequirement) => {
        parsedRequirement.lastModified = new Date(parsedRequirement.lastModified)
        return parsedRequirement;
    })
});

if (!parsedRequirements.value) {
    $eventBus.$emit('page-error', parsedRequirementsError.value);
    throw new Error('Parsed requirements not found');
}

type DataRows = Record<string, { isLoading: boolean, data: Partial<Record<ReqType, RequirementViewModel[]>> }>

const expandedRows = ref<DataTableExpandedRows>({}),
    dataRows = ref<DataRows>({})

const onItemApprove = async (item: RequirementViewModel) => {
    await $fetch(`/api/${snakeCaseToSlug(item.req_type)}/${item.id}`, {
        // @ts-ignore: method not recognized
        method: 'put',
        body: { solutionId: solution.value!.id, organizationSlug, isSilence: false }
    });
    await refresh();
}

const onItemDelete = async (item: RequirementViewModel) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`))
        return
    await $fetch(`/api/${snakeCaseToSlug(item.req_type)}/${item.id}`, {
        // @ts-ignore: method not recognized
        method: 'delete',
        body: { solutionId: solution.value!.id, organizationSlug }
    });
    await refresh();
}

const onItemUpdate = async (item: RequirementViewModel) => {
    alert(`UPDATE ${item.req_type} not implemented`)
}

const onRowExpand = async ({ data }: DataTableRowExpandEvent) => {
    dataRows.value[data.id] = { isLoading: true, data: {} };
    dataRows.value[data.id].data = await $fetch<DataRows>(`/api/parse-requirement/follows`, {
        query: { id: data.id, solutionId: solution.value!.id, organizationSlug }
    })
    dataRows.value[data.id].isLoading = false;
}

const onRowCollapse = async ({ data }: DataTableRowCollapseEvent) => {
    dataRows.value[data.id] = { isLoading: false, data: {} };
}

const reqKeys = (req: object = {}) => Object.keys(req)
    .filter(key => !['id', 'lastModified', 'modifiedBy', 'follows', 'solution', 'req_type', 'isSilence'].includes(key))

</script>

<template>
    <div>
        <p>The Workbox is the list of parsed requirements awaiting review</p>
        <InlineMessage v-if="!parsedRequirements?.length" severity="info">
            The Workbox is empty.
        </InlineMessage>
        <DataTable v-model:expandedRows="expandedRows" dataKey="id" :value="parsedRequirements" @rowExpand="onRowExpand"
            @rowCollapse="onRowCollapse" stripedRows>
            <Column expander style="width: 5rem" />
            <Column field="lastModified" header="Date" sortable>
                <template #body="{ data }">
                    <time :datetime="data.lastModified.toISOString()">{{ data.lastModified.toLocaleString() }}</time>
                </template>
            </Column>
            <Column field="modifiedBy" header="Modified By" sortable>
                <template #body="{ data }">
                    {{ data.modifiedBy.name }}
                </template>
            </Column>
            <Column field="description" header="Statement" sortable></Column>
            <template #expansion="{ data }">
                <DataTable v-for="reqType of reqKeys(dataRows[data.id]?.data)"
                    :value="dataRows[data.id].data[reqType as ReqType]" :loading="dataRows[data.id].isLoading"
                    stripedRows>
                    <template #header>
                        <h4>{{ snakeCaseToTitle(reqType) }}</h4>
                    </template>
                    <Column v-for="col of reqKeys(dataRows[data.id]?.data[reqType as ReqType]?.[0])" :key="col"
                        :field="col" :header="camelCaseToTitle(col)" sortable />
                    <Column header="Actions" frozen align-frozen="right">
                        <template #body="{ data }">
                            <Button icon="pi pi-check" text rounded class="mr-2" severity="success" title="Approve"
                                @click="onItemApprove(data)" />
                            <!--
                                TODO: implement. Field types are wanted for generating the form.
                                see: https://github.com/final-hill/cathedral/issues/164
                                -->
                            <!-- <Button icon="pi pi-pencil" text rounded class="mr-2" title="Edit"
                                @click="openEditDialog(requirements.type, data)" /> -->
                            <Button icon="pi pi-trash" text rounded severity="danger" title="Delete"
                                @click="onItemDelete(data)" />
                        </template>
                    </Column>
                </DataTable>
            </template>
        </DataTable>
    </div>
</template>