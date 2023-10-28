<script setup lang="ts">
import DataTable from '~/components/DataTable.vue';
import { GoalsRepository } from '~/data/GoalsRepository';

const route = useRoute(),
    goalsSlug = route.path.split('/')[2],
    repo = new GoalsRepository(goalsSlug),
    behaviors = ref(await repo.getAll())
</script>

<template>
    <h2>Functionality</h2>
    <p>
        This section describes the high-level functional behaviors of a system.
        Specify what results or effects are expected. Describe
        <strong>what</strong> the system should do, not <strong>how</strong> it should do it.
    </p>

    <DataTable :repository="repo" :colNames="['name', 'description']" :enableCreate="true" :enableUpdate="true"
        :enableDelete="true">
    </DataTable>
</template>../../../data/BehaviorsRepository~/data/FunctionalBehaviorsRepository