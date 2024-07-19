<script lang="ts" setup>
import { FilterMatchMode } from 'primevue/api';
import type GlossaryTerm from '~/server/domain/requirements/GlossaryTerm';
import { type Uuid, emptyUuid } from '~/server/domain/Uuid';

useHead({ title: 'Glossary' })
definePageMeta({ name: 'Glossary' })

const solutionSlug = useRoute().params.solutionSlug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${solutionSlug}`),
    solutionId = solutions.value?.[0].id;

type GlossaryTermViewModel = Pick<GlossaryTerm, 'id' | 'name' | 'statement'>;

const { data: glossaryTerms, refresh, status } = useFetch(`/api/glossary-terms?solutionId=${solutionId}`),
    emptyGlossaryTerm: GlossaryTermViewModel = { id: emptyUuid, name: '', statement: '' }

const filters = ref({
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'statement': { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const onCreate = async (data: GlossaryTermViewModel) => {
    await $fetch(`/api/glossary-terms`, {
        method: 'POST', body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })

    refresh()
}

const onUpdate = async (data: GlossaryTermViewModel) => {
    await $fetch(`/api/glossary-terms/${data.id}`, {
        method: 'PUT', body: {
            id: data.id,
            name: data.name,
            statement: data.statement,
            solutionId
        }
    })

    refresh()
}

const onDelete = async (id: Uuid) => {
    await $fetch(`/api/glossary-terms/${id}`, { method: 'DELETE' })
    refresh()
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