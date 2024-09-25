<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';
import camelCaseToTitle from '~/utils/camelCaseToTitle';

useHead({ title: 'Limitations' })
definePageMeta({ name: 'Limitations' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Limitations').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

type LimitViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: limits, status, refresh, error: getLimitsError } = await useFetch(`/api/limits`, {
    query: { solutionId }
}),
    emptyLimit: LimitViewModel = { id: emptyUuid, name: '', statement: '' };

if (getLimitsError.value)
    $eventBus.$emit('page-error', getLimitsError.value)

const onCreate = async (data: LimitViewModel) => {
    await $fetch(`/api/limits`, {
        method: 'POST',
        body: {
            solutionId,
            name: data.name,
            statement: data.statement
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: LimitViewModel) => {
    await $fetch(`/api/limits/${data.id}`, {
        method: 'PUT', body: {
            solutionId,
            id: data.id,
            name: data.name,
            statement: data.statement
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/limits/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>
<template>
    <p>
        Limitations are the constraints on functionality. They describe What that is out-of-scope and excluded.
        Example: "Providing an interface to the user to change the color of the background is out-of-scope."
    </p>

    <XDataTable :datasource="limits" :empty-record="emptyLimit" :on-create="onCreate" :on-update="onUpdate"
        :on-delete="onDelete" :loading="status === 'pending'">
        <template #rows>
            <Column v-for="key in Object.keys(emptyLimit)" :key="key" :field="key" :header="camelCaseToTitle(key)">
                <template #body="{ data, field }">
                    <Checkbox v-if="typeof data[field] === 'boolean'" v-model="data[field]" disabled />
                    <span v-else-if="data[field] instanceof Date">{{ data[field].toLocaleString() }}</span>
                    <span v-else>{{ data[field] }}</span>
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: LimitViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText v-model.trim="data.name" name="name" required class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="col-fixed w-7rem">Description</label>
                <InputText v-model.trim="data.statement" name="statement" class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: LimitViewModel }">
            <input type="hidden" v-model="data.id" name="id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText v-model.trim="data.name" name="name" required class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="col-fixed w-7rem">Description</label>
                <InputText v-model.trim="data.statement" name="statement" class="col" />
            </div>
        </template>
    </XDataTable>
</template>