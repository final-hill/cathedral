<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';
import camelCaseToTitle from '~/utils/camelCaseToTitle';

useHead({ title: 'Components' })
definePageMeta({ name: 'Environment Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Environment Components').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id,
    { data: environmentComponents, status, refresh, error: getEnvironmentComponentsError } = await useFetch(`/api/environment-components`, {
        query: { solutionId }
    }),
    emptyComponent = { id: emptyUuid, name: '', statement: '' }

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

if (getEnvironmentComponentsError.value)
    $eventBus.$emit('page-error', getEnvironmentComponentsError.value)

type EnvironmentComponentViewModel = {
    id: string;
    name: string;
    statement: string;
}

const onCreate = async (data: EnvironmentComponentViewModel) => {
    await $fetch(`/api/environment-components`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/environment-components/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: EnvironmentComponentViewModel) => {
    await $fetch(`/api/environment-components/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}
</script>

<template>
    <p>
        Environment components are the EXTERNAL elements that the system interacts with.
        These external components expose interfaces that the system uses to communicate with.
    </p>
    <XDataTable :datasource="environmentComponents" :empty-record="emptyComponent" :on-create="onCreate"
        :on-delete="onDelete" :on-update="onUpdate" :loading="status === 'pending'">
        <template #rows>
            <Column v-for="key in Object.keys(emptyComponent)" :key="key" :field="key" :header="camelCaseToTitle(key)">
                <template #body="{ data, field }">
                    <Checkbox v-if="typeof data[field] === 'boolean'" v-model="data[field]" disabled />
                    <span v-else-if="data[field] instanceof Date">{{ data[field].toLocaleString() }}</span>
                    <span v-else>{{ data[field] }}</span>
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: EnvironmentComponentViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" class="col" required />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" class="col" required />
            </div>
        </template>
        <template #editDialog="{ data } : { data: EnvironmentComponentViewModel }">
            <input type="hidden" name="id" :value="data.id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" class="col" required />
            </div>
            <hr>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" class="col" required />
            </div>
        </template>
    </XDataTable>
</template>