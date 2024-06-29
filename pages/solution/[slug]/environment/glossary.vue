<script lang="ts" setup>
import SolutionRepository from '~/data/SolutionRepository';
import GlossaryTermRepository from '~/data/GlossaryTermRepository';
import type GlossaryTerm from '~/domain/GlossaryTerm';
import { FilterMatchMode } from 'primevue/api';
import { emptyUuid, type Uuid } from '~/domain/Uuid';
import SolutionInteractor from '~/application/SolutionInteractor';
import GlossaryTermInteractor from '~/application/GlossaryTermInteractor';

useHead({ title: 'Glossary' })
definePageMeta({ name: 'Glossary' })

const slug = useRoute().params.slug as string,
    glossaryTermRepository = new GlossaryTermRepository(),
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    glossaryTermInteractor = new GlossaryTermInteractor(glossaryTermRepository),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id;

type GlossaryTermViewModel = Pick<GlossaryTerm, 'id' | 'name' | 'statement'>;

const glossaryTerms = ref<GlossaryTermViewModel[]>(await glossaryTermInteractor.getAll({ solutionId })),
    emptyGlossaryTerm = { id: emptyUuid, name: '', statement: '' }

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: GlossaryTermViewModel) => {
    const newId = await glossaryTermInteractor.create({
        name: data.name,
        statement: data.statement,
        property: '',
        solutionId,
        parentComponentId: emptyUuid,
        functionalityId: emptyUuid
    })

    glossaryTerms.value = await glossaryTermInteractor.getAll({ solutionId })
}

const onUpdate = async (data: GlossaryTermViewModel) => {
    await glossaryTermInteractor.update({
        id: data.id,
        name: data.name,
        statement: data.statement,
        property: '',
        solutionId,
        parentComponentId: emptyUuid,
        functionalityId: emptyUuid
    })

    glossaryTerms.value = await glossaryTermInteractor.getAll({ solutionId })
}

const onDelete = async (id: Uuid) => {
    await glossaryTermInteractor.delete(id)

    glossaryTerms.value = await glossaryTermInteractor.getAll({ solutionId })
}
</script>

<template>
    <p>
        A Glossary is a list of terms in a particular domain of knowledge with the definitions for those terms.
    </p>
    <XDataTable :datasource="glossaryTerms" :empty-record="emptyGlossaryTerm" :filters="filters" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate">
        <Column field="name" header="Term" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()" placeholder="Search by term" />
            </template>
            <template #body="{ data }">
                {{ data.name }}
            </template>
            <template #editor="{ data, field }">
                <InputText v-model.trim="data[field]" required="true" />
            </template>
        </Column>
        <Column field="statement" header="Definition">
            <template #filter="{ filterModel, filterCallback }">
                <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                    placeholder="Search by definition" />
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