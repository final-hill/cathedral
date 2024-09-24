<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Outcomes' })
definePageMeta({ name: 'Outcomes' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Outcomes').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

type OutcomeViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: outcomes, refresh, status, error: getOutcomesError } = await useFetch(`/api/outcomes`, {
    query: { solutionId }
}),
    emptyOutcome: OutcomeViewModel = { id: emptyUuid, name: '', statement: '' };

if (getOutcomesError.value)
    $eventBus.$emit('page-error', getOutcomesError.value);

const onCreate = async (data: OutcomeViewModel) => {
    await $fetch(`/api/outcomes`, {
        method: 'POST',
        body: {
            solutionId,
            name: data.name,
            statement: data.statement
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: OutcomeViewModel) => {
    await $fetch(`/api/outcomes/${data.id}`, {
        method: 'PUT',
        body: {
            solutionId,
            name: data.name,
            statement: data.statement
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/outcomes/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        Outcomes are the expected benefits, capabilities, or processes
        of the system that will be achieved by the associated project.
    </p>

    <XDataTable :datasource="outcomes" :empty-record="emptyOutcome" :onCreate="onCreate" :onUpdate="onUpdate"
        :onDelete="onDelete" :loading="status === 'pending'">
        <template #rows>
            <Column field="name" header="Name" sortable>
                <template #body="{ data }">
                    {{ data.name }}
                </template>
            </Column>
            <Column field="statement" header="Description">
                <template #body="{ data }">
                    {{ data.statement }}
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: OutcomeViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required placeholder="Enter name" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" required placeholder="Enter description"
                    class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: OutcomeViewModel }">
            <input type="hidden" v-model="data.id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required placeholder="Enter name" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" required placeholder="Enter description"
                    class="col" />
            </div>
        </template>
    </XDataTable>
</template>