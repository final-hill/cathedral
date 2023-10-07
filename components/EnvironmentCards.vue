<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { EnvironmentStore } from '~/stores/EnvironmentStore'

const { items } = storeToRefs(EnvironmentStore())
</script>

<style scoped>
.environment-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(30%, 1fr));
    gap: 0.5in;
}

.environment-card:first-child {
    background-color: transparent;
    border: 1px dashed var(--font-color);
}
</style>

<template>
    <section class="environment-cards">
        <EnvironmentCard id="new-environment" name="New Environment" description="Create a new environment" />
        <EnvironmentCard v-for="environment of items" :key="environment.id" :id="environment.id" :name="environment.name"
            :description="environment.description" />
    </section>
</template>