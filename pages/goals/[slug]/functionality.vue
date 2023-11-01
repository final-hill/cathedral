<script setup lang="ts">
import DataTable, { type Column } from '~/components/DataTable.vue';
import { GoalsRepository } from '~/data/GoalsRepository';
import { Behavior } from '~/domain/Behavior';

const route = useRoute(),
    goalsSlug = route.path.split('/')[2],
    repo = new GoalsRepository(),
    goals = await repo.getBySlug(goalsSlug),
    functionalBehaviors = ref(goals.functionalBehaviors),
    columns: Column[] = [
        { dataField: 'id', headerText: 'ID', readonly: true, formType: 'hidden' },
        { dataField: 'statement', headerText: 'Statement', required: true }
    ]

useHead({ title: 'Functionality' })

const createItem = ({ statement }: { statement: string }) => {
    functionalBehaviors.value.push(new Behavior({
        id: self.crypto.randomUUID(),
        statement
    }));
    repo.update(goals);
}

const updateItem = ({ id, statement }: { id: string, statement: string }) => {
    const index = functionalBehaviors.value.findIndex(x => x.id === id);
    functionalBehaviors.value[index].statement = statement;
    repo.update(goals);
}

const deleteItem = (id: string) => {
    const index = functionalBehaviors.value.findIndex(x => x.id === id);
    functionalBehaviors.value.splice(index, 1);
    repo.update(goals);
}
</script>

<template>
    <p>
        This section describes the high-level functional behaviors of a system.
        Specify what results or effects are expected. Describe
        <strong>what</strong> the system should do, not <strong>how</strong> it should do it.
    </p>

    <DataTable :dataSource="(functionalBehaviors as Behavior[])" :columns="columns" :enableCreate="true"
        :enableUpdate="true" :enableDelete="true" @create="createItem" @update="updateItem" @delete="deleteItem">
    </DataTable>
</template>