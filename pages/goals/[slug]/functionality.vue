<script setup lang="ts">
import DataTable from '~/components/DataTable.vue';
import { GoalsRepository } from '~/data/GoalsRepository';
import { Behavior } from '~/domain/Behavior';

const route = useRoute(),
    goalsSlug = route.path.split('/')[2],
    repo = new GoalsRepository(),
    goals = await repo.getBySlug(goalsSlug),
    functionalBehaviors = ref(goals.functionalBehaviors),
    columns = [
        { dataField: 'statement', headerText: 'Statement', required: true }
    ]

const createItem = ({ statement }: { statement: string }) => {
    functionalBehaviors.value.push(new Behavior({
        id: self.crypto.randomUUID(),
        statement
    }));
    repo.update(goals);
}
</script>

<template>
    <h2>Functionality</h2>
    <p>
        This section describes the high-level functional behaviors of a system.
        Specify what results or effects are expected. Describe
        <strong>what</strong> the system should do, not <strong>how</strong> it should do it.
    </p>

    <DataTable :dataSource="functionalBehaviors" :columns="columns" :enableCreate="true" :enableUpdate="true"
        :enableDelete="true" @create="createItem">
    </DataTable>
</template>