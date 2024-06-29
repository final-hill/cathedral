<script lang="ts" setup>
import SolutionRepository from '~/data/SolutionRepository';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionInteractor from '~/application/SolutionInteractor';
import SystemComponentRepository from '~/data/SystemComponentRepository';
import SystemComponentInteractor from '~/application/SystemComponentInteractor';
import type SystemComponent from '~/domain/SystemComponent';

useHead({ title: 'Components' })
definePageMeta({ name: 'System Components' })

const slug = useRoute().params.slug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    systemComponentInteractor = new SystemComponentInteractor(new SystemComponentRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id;

type SystemComponentViewModel = Pick<SystemComponent, 'id' | 'name' | 'statement' | 'parentComponentId' | 'functionalityId'>;

debugger;
const systemComponents = ref<SystemComponent[]>(await systemComponentInteractor.getAll({ solutionId })),
    emptyComponent: SystemComponentViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        parentComponentId: emptyUuid,
        functionalityId: emptyUuid
    };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'parentId': { value: null, matchMode: FilterMatchMode.EQUALS }
})

const onCreate = async (data: SystemComponentViewModel) => {
    await systemComponentInteractor.create({
        ...data,
        solutionId,
        property: '',
        functionalityId: data.functionalityId
    });

    systemComponents.value = await systemComponentInteractor.getAll({ solutionId })
}

const onUpdate = async (data: SystemComponentViewModel) => {
    await systemComponentInteractor.update({
        ...data,
        solutionId,
        property: ''
    });

    systemComponents.value = await systemComponentInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await systemComponentInteractor.delete(id)

    systemComponents.value = await systemComponentInteractor.getAll({ solutionId })
}
</script>
<template>
    <p>
        Components describe the structure of the system as a list or hierarchy.
    </p>
    <XDataTable :datasource="systemComponents" :filters="filters" :emptyRecord="emptyComponent" :onCreate="onCreate"
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
                    :options="systemComponents" placeholder="Search by Component" />
            </template>
            <template #body="{ data, field }">
                {{ systemComponents
                    .filter(c => c.id !== emptyUuid)
                    .find(c => c.id === data[field])?.name }}
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model.trim="data[field]" optionLabel="name" optionValue="id"
                    :options="systemComponents.filter(c => c.id !== data.id)" placeholder="Select a Component"
                    showClear />
            </template>
        </Column>
    </XDataTable>
</template>