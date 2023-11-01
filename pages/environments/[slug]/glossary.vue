<script lang="ts" setup>
import DataTable, { type Column } from '~/components/DataTable.vue';
import { GlossaryTerm } from '~/domain/GlossaryTerm';
import { EnvironmentRepository } from '~/data/EnvironmentRepository'
import type { Uuid } from '~/domain/types/Uuid';

const route = useRoute(),
    environmentSlug = route.path.split('/')[2],
    repo = new EnvironmentRepository(),
    environment = await repo.getBySlug(environmentSlug),
    glossary = environment?.glossary,
    terms = ref(glossary.terms),
    columns: Column[] = [
        { dataField: 'id', headerText: 'ID', readonly: true, formType: 'hidden' },
        { dataField: 'term', headerText: 'Term', required: true },
        { dataField: 'definition', headerText: 'Definition' }
    ]

useHead({ title: 'Glossary' })

const createItem = ({ term, definition }: { term: string, definition: string }) => {
    terms.value.push(new GlossaryTerm({
        id: self.crypto.randomUUID(),
        term, definition
    }));
    repo.update(environment);
}

const updateItem = ({ id, term, definition }: { id: Uuid, term: string, definition: string }) => {
    const index = terms.value.findIndex(x => x.id === id);
    terms.value[index] = new GlossaryTerm({
        id, term, definition
    });
    repo.update(environment);
}

const deleteItem = (id: Uuid) => {
    const index = terms.value.findIndex(x => x.id === id);
    terms.value.splice(index, 1);
    repo.update(environment);
}
</script>

<template>
    <p>
        This section defines the terms used in the context of this environment.
        Specify the terms and their definitions.
    </p>

    <DataTable :dataSource="(terms as GlossaryTerm[])" :columns="columns" :enableCreate="true" :enableUpdate="true"
        :enableDelete="true" @create="createItem" @update="updateItem" @delete="deleteItem">
    </DataTable>
</template>