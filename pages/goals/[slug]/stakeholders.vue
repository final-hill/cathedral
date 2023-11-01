<script lang="ts" setup>
import DataTable, { type Column } from '~/components/DataTable.vue';
import { GoalsRepository } from '~/data/GoalsRepository'
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from '~/domain/Stakeholder'
import type { Uuid } from '~/domain/types/Uuid';

const route = useRoute(),
    goalsSlug = route.path.split('/')[2],
    repo = new GoalsRepository(),
    goals = await repo.getBySlug(goalsSlug)!,
    { stakeholders } = goals,
    items = ref(stakeholders.stakeholders),
    columns: Column[] = [
        { dataField: 'id', headerText: 'ID', readonly: true, formType: 'hidden' },
        { dataField: 'name', headerText: 'Name', required: true },
        { dataField: 'description', headerText: 'Description', required: true },
        { dataField: 'segmentation', headerText: 'Segmentation', formType: 'select', options: StakeholderSegmentation as any },
        { dataField: 'category', headerText: 'Category', formType: 'select', options: StakeholderCategory as any }
    ]

useHead({ title: 'Stakeholders' })

const createItem = ({ name, description, segmentation, category }: Stakeholder) => {
    items.value.push(new Stakeholder({
        id: self.crypto.randomUUID(),
        name, description, segmentation, category
    }));
    repo.update(goals);
}

const updateItem = ({ id, name, description, segmentation, category }: Stakeholder) => {
    const index = items.value.findIndex(x => x.id === id);
    items.value[index] = new Stakeholder({
        id, name, description, segmentation, category
    });
    repo.update(goals);
}

const deleteItem = (id: Uuid) => {
    const index = items.value.findIndex(x => x.id === id);
    items.value.splice(index, 1);
    repo.update(goals);
}
</script>

<template>
    <p>
        Stakeholders are the categories of people who are affected by the
        problem you are trying to solve. Do not list individuals, but rather
        groups or roles. Example: instead of "Jane Doe", use "Project Manager".
    </p>

    <DataTable :dataSource="(items as Stakeholder[])" :columns="columns" :enableCreate="true" :enableUpdate="true"
        :enableDelete="true" @create="createItem" @update="updateItem" @delete="deleteItem">
    </DataTable>
</template>