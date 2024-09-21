<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Obstacles' })
definePageMeta({ name: 'Obstacles' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Obstacles').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

type ObstacleViewModel = {
    id: string;
    name: string;
    statement: string;
}

const { data: obstacles, refresh, status, error: getObstaclesError } = await useFetch(`/api/obstacles`, {
    query: { solutionId }
}),
    emptyObstacle: ObstacleViewModel = { id: emptyUuid, name: '', statement: '' };

const onCreate = async (data: ObstacleViewModel) => {
    await $fetch(`/api/obstacles`, {
        method: 'POST',
        body: {
            solutionId,
            name: data.name,
            statement: data.statement
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onUpdate = async (data: ObstacleViewModel) => {
    await $fetch(`/api/obstacles/${data.id}`, {
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
    await $fetch(`/api/obstacles/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}
</script>

<template>
    <p>
        Obstacles are the challenges that prevent the goals from being achieved.
    </p>

    <XDataTable :datasource="obstacles" :empty-record="emptyObstacle" :on-create="onCreate" :on-update="onUpdate"
        :on-delete="onDelete" :loading="status === 'pending'">
        <template #rows>
            <Column field="name" header="Name" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                        placeholder="Search by name" />
                </template>
                <template #body="{ data }">
                    {{ data.name }}
                </template>
            </Column>
            <Column field="statement" header="Description">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model.trim="filterModel.value" @input="filterCallback()"
                        placeholder="Search by Description" />
                </template>
                <template #body="{ data }">
                    {{ data.statement }}
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: ObstacleViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required placeholder="Name" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" placeholder="Description" class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: ObstacleViewModel }">
            <input type="hidden" name="id" v-model="data.id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required placeholder="Name" class="col" />
            </div>
            <div class="field grid">
                <label for="statement" class="col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" placeholder="Description" class="col" />
            </div>
        </template>
    </XDataTable>
</template>