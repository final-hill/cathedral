<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionRepository from '~/data/SolutionRepository';
import SolutionInteractor from '~/application/SolutionInteractor';
import EnvironmentComponentRepository from '~/data/EnvironmentComponentRepository';
import EnvironmentComponentInteractor from '~/application/EnvironmentComponentInteractor';
import type EnvironmentComponent from '~/domain/EnvironmentComponent';

useHead({ title: 'Components' })
definePageMeta({ name: 'Components' })

const slug = useRoute().params.slug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    environmentComponentInteractor = new EnvironmentComponentInteractor(new EnvironmentComponentRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id;

type EnvironmentComponentViewModel = Pick<EnvironmentComponent, 'id' | 'name' | 'statement' | 'functionalityId'>;

const environmentComponents = ref<EnvironmentComponentViewModel[]>(await environmentComponentInteractor.getAll({ solutionId })),
    emptyComponent = { id: emptyUuid, name: '', statement: '' };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: EnvironmentComponentViewModel) => {
    const newId = await environmentComponentInteractor.create({
        ...data,
        solutionId,
        parentComponentId: emptyUuid,
        property: '',
        functionalityId: emptyUuid
    })

    environmentComponents.value = await environmentComponentInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await environmentComponentInteractor.delete(id)
    environmentComponents.value = await environmentComponentInteractor.getAll({ solutionId })
}

const onUpdate = async (data: EnvironmentComponentViewModel) => {
    await environmentComponentInteractor.update({
        ...data,
        solutionId,
        parentComponentId: emptyUuid,
        property: '',
        functionalityId: data.functionalityId
    })
    environmentComponents.value = await environmentComponentInteractor.getAll({ solutionId })
}
</script>

<template>
    <p>
        Environment components are the EXTERNAL elements that the system interacts with.
        These external components expose interfaces that the system uses to communicate with.
    </p>
    <XDataTable :datasource="environmentComponents" :empty-record="emptyComponent" :filters="filters"
        :on-create="onCreate" :on-delete="onDelete" :on-update="onUpdate">
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by name" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" />
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
    </XDataTable>
</template>