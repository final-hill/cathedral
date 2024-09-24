<script lang="ts" setup>
import { useFetch } from 'nuxt/app';
import { ConstraintCategory } from '~/server/domain/requirements/index';
import { NIL as emptyUuid } from 'uuid';

useHead({ title: 'Constraints' })
definePageMeta({ name: 'Constraints' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Constraints').params,
    { data: solutions, error: getSolutionError } = await useFetch('/api/solutions', {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solution = (solutions.value ?? [])[0],
    solutionId = solution.id,
    { data: constraints, status, refresh, error: getConstraintsError } = await useFetch(`/api/constraints`, {
        query: { solutionId }
    });

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value)

if (getConstraintsError.value)
    $eventBus.$emit('page-error', getConstraintsError.value)

type ConstraintViewModel = {
    id: string;
    name: string;
    statement: string;
    category: ConstraintCategory;
}

const constraintCategories = ref<{ id: string, description: string }[]>(
    Object.values(ConstraintCategory).map((value) => ({ id: value, description: value }))
),
    emptyConstraint: ConstraintViewModel = { id: emptyUuid, name: '', statement: '', category: ConstraintCategory.BUSINESS }

const onCreate = async (data: ConstraintViewModel) => {
    await $fetch(`/api/constraints`, {
        method: 'POST',
        body: {
            name: data.name,
            statement: data.statement,
            category: data.category,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))

    refresh()
}

const onDelete = async (id: string) => {
    await $fetch(`/api/constraints/${id}`, {
        method: 'DELETE',
        body: { solutionId }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}

const onUpdate = async (data: ConstraintViewModel) => {
    await $fetch(`/api/constraints/${data.id}`, {
        method: 'PUT',
        body: {
            name: data.name,
            statement: data.statement,
            category: data.category,
            solutionId
        }
    }).catch((e) => $eventBus.$emit('page-error', e))
    refresh()
}
</script>

<template>
    <p>
        Environmental constraints are the limitations and obligations that
        the environment imposes on the project and system.
    </p>
    <XDataTable :datasource="constraints" :empty-record="emptyConstraint" :on-create="onCreate" :on-delete="onDelete"
        :on-update="onUpdate" :loading="status === 'pending'">
        <template #rows>
            <Column field="name" header="Name" sortable>
                <template #body="{ data }">
                    {{ data.name }}
                </template>
            </Column>
            <Column field="category" header="Category" sortable>
                <template #body="{ data, field }">
                    {{ constraintCategories.find(o => o.id === data[field])?.description }}
                </template>
            </Column>
            <Column field="statement" header="Description">
                <template #body="{ data }">
                    {{ data.statement }}
                </template>
            </Column>
        </template>
        <template #createDialog="{ data } : { data: ConstraintViewModel }">
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required class="col" />
            </div>
            <div class="field grid">
                <label for="category" class="required col-fixed w-7rem">Category</label>
                <select class="p-inputtext p-component col" name="category" v-model="data.category" required>
                    <option v-for="category in constraintCategories" :key="category.id" :value="category.id">
                        {{ category.description }}
                    </option>
                </select>
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" required class="col" />
            </div>
        </template>
        <template #editDialog="{ data } : { data: ConstraintViewModel }">
            <input type="hidden" name="id" v-model.trim="data.id" />
            <div class="field grid">
                <label for="name" class="required col-fixed w-7rem">Name</label>
                <InputText name="name" v-model.trim="data.name" required class="col" />
            </div>
            <div class="field grid">
                <label for="category" class="required col-fixed w-7rem">Category</label>
                <select class="p-inputtext p-component col" name="category" v-model="data.category" required>
                    <option v-for="category in constraintCategories" :key="category.id" :value="category.id">
                        {{ category.description }}
                    </option>
                </select>
            </div>
            <div class="field grid">
                <label for="statement" class="required col-fixed w-7rem">Description</label>
                <InputText name="statement" v-model.trim="data.statement" required class="col" />
            </div>
        </template>
    </XDataTable>
</template>