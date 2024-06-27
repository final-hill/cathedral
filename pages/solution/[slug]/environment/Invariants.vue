<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionRepository from '~/data/SolutionRepository';
import InvariantRepository from '~/data/InvariantRepository';
import type Invariant from '~/domain/Invariant';
import SolutionInteractor from '~/application/SolutionInteractor';
import InvariantInteractor from '~/application/InvariantInteractor';

useHead({ title: 'Invariants' })
definePageMeta({ name: 'Invariants' })

const slug = useRoute().params.slug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id,
    invariantInteractor = new InvariantInteractor(new InvariantRepository())

type InvariantViewModel = Pick<Invariant, 'id' | 'name' | 'statement'>;

const invariants = ref<InvariantViewModel[]>(await invariantInteractor.getAll({ solutionId })),
    emptyInvariant: InvariantViewModel = { id: emptyUuid, name: '', statement: '' };

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: InvariantViewModel) => {
    const newId = await invariantInteractor.create({
        name: data.name,
        statement: data.statement,
        solutionId,
        property: ''
    })

    invariants.value = await invariantInteractor.getAll({ solutionId })
}

const onUpdate = async (data: InvariantViewModel) => {
    await invariantInteractor.update({
        id: data.id,
        name: data.name,
        statement: data.statement,
        solutionId,
        property: ''
    })

    invariants.value = await invariantInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await invariantInteractor.delete(id)

    invariants.value = await invariantInteractor.getAll({ solutionId })
}
</script>

<template>
    <p>
        Invariants are properties that must always be true. They are used to
        constrain the possible states of a system.
    </p>

    <XDataTable :datasource="invariants" :empty-record="emptyInvariant" :filters="filters" :on-create="onCreate"
        :on-update="onUpdate" :on-delete="onDelete">
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