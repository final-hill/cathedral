<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionRepository from '~/data/SolutionRepository';
import EffectRepository from '~/data/EffectRepository';
import type Effect from '~/domain/Effect';
import SolutionInteractor from '~/application/SolutionInteractor';
import EffectInteractor from '~/application/EffectInteractor';

useHead({ title: 'Effects' })
definePageMeta({ name: 'Effects' })

const slug = useRoute().params.slug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id,
    effectInteractor = new EffectInteractor(new EffectRepository())

type EffectViewModel = Pick<Effect, 'id' | 'name' | 'statement'>;

const effects = ref<EffectViewModel[]>(await effectInteractor.getAll({ solutionId })),
    emptyEffect = { id: emptyUuid, name: '', statement: '' }

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: EffectViewModel) => {
    const newId = await effectInteractor.create({
        name: data.name,
        statement: data.statement,
        solutionId,
        property: ''
    })

    effects.value = await effectInteractor.getAll({ solutionId })
}

const onUpdate = async (data: EffectViewModel) => {
    await effectInteractor.update({
        id: data.id,
        name: data.name,
        statement: data.statement,
        solutionId,
        property: ''
    })

    effects.value = await effectInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await effectInteractor.delete(id)
    effects.value = await effectInteractor.getAll({ solutionId })
}
</script>

<template>
    <p>
        An Effect is an environment property affected by a System.
        Example: "The running system will cause the temperature of the room to increase."
    </p>
    <XDataTable :datasource="effects" :empty-record="emptyEffect" :filters="filters" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate">
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