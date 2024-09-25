<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';
import camelCaseToTitle from '~/utils/camelCaseToTitle';

useHead({ title: 'Invariants' })
definePageMeta({ name: 'Invariants' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Invariants').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

type InvariantViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: invariants, refresh, status, error: getInvariantsError } = await useFetch(`/api/invariants`, {
    query: { solutionId }
}),
    emptyInvariant: InvariantViewModel = { id: emptyUuid, name: '', statement: '' };

if (getInvariantsError.value)
    $eventBus.$emit('page-error', getInvariantsError.value)

const onCreate = async (data: InvariantViewModel) => {
    await useFetch(`/api/invariants`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: InvariantViewModel) => {
    await useFetch(`/api/invariants/${data.id}`, {
        method: 'PUT', body: {
            id: data.id,
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await useFetch(`/api/invariants/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        Invariants are properties that must always be true. They are used to
        constrain the possible states of a system.
    </p>

    <XDataTable :datasource="invariants" :empty-record="emptyInvariant" :on-create="onCreate" :on-update="onUpdate"
        :on-delete="onDelete" :loading="status === 'pending'">
        <template #rows>
            <Column v-for="key in Object.keys(emptyInvariant)" :key="key" :field="key" :header="camelCaseToTitle(key)">
                <template #body="{ data, field }">
                    <Checkbox v-if="typeof data[field] === 'boolean'" v-model="data[field]" disabled />
                    <span v-else-if="data[field] instanceof Date">{{ data[field].toLocaleString() }}</span>
                    <span v-else>{{ data[field] }}</span>
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: InvariantViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText v-model.trim="data.name" name="name" required class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText v-model.trim="data.statement" name="statement" required class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: InvariantViewModel }">
            <input type="hidden" v-model="data.id" name="id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText v-model.trim="data.name" name="name" required class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText v-model.trim="data.statement" name="statement" required class="col" />
            </div>
        </template>
    </XDataTable>
</template>