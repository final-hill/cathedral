<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';
import { useFetch } from 'nuxt/app';
import camelCaseToTitle from '~/utils/camelCaseToTitle';

useHead({ title: 'Assumptions' })
definePageMeta({ name: 'Assumptions' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Assumptions').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            organizationSlug: organizationslug,
            slug: solutionslug
        }
    }),
    solutionId = solutions.value?.at(0)?.id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

type AssumptionViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: assumptions, refresh, status, error: getAssumptionsError } = await useFetch(`/api/assumptions`, {
    query: { solutionId }
}),
    emptyAssumption = { id: emptyUuid, name: '', statement: '' };

if (getAssumptionsError.value)
    $eventBus.$emit('page-error', getAssumptionsError.value);

const onCreate = async (data: AssumptionViewModel) => {
    await $fetch(`/api/assumptions`, {
        method: 'post',
        body: {
            name: data.name,
            statement: data.statement,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/assumptions/${id}`, {
        method: 'delete',
        body: { solutionId }
    })
        .catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: AssumptionViewModel) => {
    await $fetch(`/api/assumptions/${data.id}`, {
        method: 'put',
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
        An assumption is a property of the environment that is assumed to be true.
        Assumptions are used to simplify the problem and to make it more tractable.
        An example of an assumption would be: "Screen resolution will not change during
        the execution of the program".
    </p>
    <XDataTable :datasource="assumptions" :empty-record="emptyAssumption" :on-create="onCreate" :on-delete="onDelete"
        :on-update="onUpdate" :loading="status === 'pending'">
        <template #rows>
            <Column v-for="key in Object.keys(emptyAssumption)" :key="key" :field="key" :header="camelCaseToTitle(key)">
                <template #body="{ data, field }">
                    <Checkbox v-if="typeof data[field] === 'boolean'" v-model="data[field]" disabled />
                    <span v-else-if="data[field] instanceof Date">{{ data[field].toLocaleString() }}</span>
                    <span v-else>{{ data[field] }}</span>
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: AssumptionViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" required class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: AssumptionViewModel }">
            <input type="hidden" name="id" v-model.trim="data.id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" required class="col" />
            </div>
        </template>
    </XDataTable>
</template>