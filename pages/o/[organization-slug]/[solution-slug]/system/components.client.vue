<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Components' })
definePageMeta({ name: 'System Components' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('System Components').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

type SystemComponentViewModel = {
    id: string;
    name: string;
    statement: string;
    parentComponentId?: string;
}

const { data: systemComponents, refresh, status, error: getSystemComponentsError } = await useFetch(`/api/system-components`, {
    query: { solutionId }
}),
    emptyComponent: SystemComponentViewModel = {
        id: emptyUuid,
        name: '',
        statement: '',
        parentComponentId: undefined
    };

if (getSystemComponentsError.value)
    $eventBus.$emit('page-error', getSystemComponentsError.value);

const onCreate = async (data: SystemComponentViewModel) => {
    await $fetch(`/api/system-components`, {
        method: 'POST',
        body: {
            ...data,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: SystemComponentViewModel) => {
    await $fetch(`/api/system-components/${data.id}`, {
        method: 'PUT',
        body: {
            ...data,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/system-components/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>
<template>
    <p>
        Components describe the structure of the system as a list or hierarchy.
    </p>
    <XDataTable :datasource="systemComponents" :emptyRecord="emptyComponent" :onCreate="onCreate" :onUpdate="onUpdate"
        :onDelete="onDelete" :loading="status === 'pending'">
        <template #rows>
            <Column field="name" header="Name" sortable>
                <template #body="{ data, field }">
                    {{ data[field] }}
                </template>
            </Column>
            <Column field="statement" header="Description">
                <template #body="{ data, field }">
                    {{ data[field] }}
                </template>
            </Column>
            <Column field="parentComponentId" header="Parent">
                <template #body="{ data, field }">
                    {{ systemComponents?.find(c => c.id === data[field])?.name }}
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: SystemComponentViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText v-model.trim="data.name" name="name" required placeholder="Enter a name" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText v-model.trim="data.statement" name="statement" required placeholder="Enter a description"
                    class="col" />
            </div>
            <div class="field grid">
                <label for="parentComponentId" class="col-fixed w-7rem">Parent</label>
                <select class="p-inputtext p-component col" v-model="data.parentComponentId" name="parentComponentId">
                    <option value="">Select a Component</option>
                    <option v-for="component in (systemComponents ?? []).filter(c => c.id !== data.id)"
                        :key="component.id" :value="component.id">
                        {{ component.name }}
                    </option>
                </select>
            </div>
        </template>
        <template #editDialog="{ data } : { data: SystemComponentViewModel }">
            <input type="hidden" name="id" v-model.trim="data.id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText v-model.trim="data.name" name="name" required placeholder="Enter a name" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText v-model.trim="data.statement" name="statement" required placeholder="Enter a description"
                    class="col" />
            </div>
            <div class="field grid">
                <label for="parentComponentId" class="col-fixed w-7rem">Parent</label>
                <select class="p-inputtext p-component col" v-model="data.parentComponentId" name="parentComponentId">
                    <option value="">Select a Component</option>
                    <option v-for="component in (systemComponents ?? []).filter(c => c.id !== data.id)"
                        :key="component.id" :value="component.id">
                        {{ component.name }}
                    </option>
                </select>
            </div>
        </template>
    </XDataTable>
</template>