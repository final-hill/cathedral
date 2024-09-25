<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';
import camelCaseToTitle from '~/utils/camelCaseToTitle';

useHead({ title: 'Glossary' })
definePageMeta({ name: 'Glossary' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Glossary').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

type GlossaryTermViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: glossaryTerms, refresh, status, error: getGlossaryTermsError } = await useFetch(`/api/glossary-terms`, {
    query: { solutionId }
}),
    emptyGlossaryTerm: GlossaryTermViewModel = { id: emptyUuid, name: '', statement: '' }

if (getGlossaryTermsError.value)
    $eventBus.$emit('page-error', getGlossaryTermsError.value)

const onCreate = async (data: GlossaryTermViewModel) => {
    await $fetch(`/api/glossary-terms`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: GlossaryTermViewModel) => {
    await $fetch(`/api/glossary-terms/${data.id}`, {
        method: 'PUT',
        body: {
            id: data.id,
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/glossary-terms/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}
</script>

<template>
    <p>
        A Glossary is a list of terms in a particular domain of knowledge with the definitions for those terms.
    </p>
    <XDataTable :datasource="glossaryTerms" :empty-record="emptyGlossaryTerm" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'">
        <template #rows>
            <Column v-for="key in Object.keys(emptyGlossaryTerm)" :key="key" :field="key"
                :header="camelCaseToTitle(key)">
                <template #body="{ data, field }">
                    <Checkbox v-if="typeof data[field] === 'boolean'" v-model="data[field]" disabled />
                    <span v-else-if="data[field] instanceof Date">{{ data[field].toLocaleString() }}</span>
                    <span v-else>{{ data[field] }}</span>
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: GlossaryTermViewModel }">
            <div class="field grid">
                <label for="term" class="required col-fixed w-7rem">Term</label>
                <InputText name="name" v-model.trim="data.name" required placeholder="Enter term" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Definition</label>
                <InputText name="statement" v-model.trim="data.statement" required placeholder="Enter definition"
                    class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: GlossaryTermViewModel }">
            <input type="hidden" v-model="data.id" name="id" />
            <div class="field grid">
                <label for="term" class="required col-fixed w-7rem">Term</label>
                <InputText v-model.trim="data.name" name="name" required placeholder="Enter term" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Definition</label>
                <InputText v-model.trim="data.statement" name="statement" required placeholder="Enter definition"
                    class="col" />
            </div>
        </template>
    </XDataTable>
</template>