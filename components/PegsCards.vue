<script setup lang="ts">
import { storeToRefs } from 'pinia';

const props = defineProps({
    store: {
        type: Object,
        required: true
    }
})

const { items } = storeToRefs(props.store as any)
</script>

<style scoped>
.pegs-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(30%, 1fr));
    gap: 0.5in;
}

.pegs-card:first-child {
    background-color: transparent;
    border: 1px dashed var(--font-color);
}
</style>

<template>
    <section class="pegs-cards">
        <PegsCard id="new-item" name="New Entry" description="Create a new entry" :store="props.store" />
        <PegsCard v-for="item of items" :key="item.id" :id="item.id" :name="item.name" :description="item.description"
            :store="props.store" />
    </section>
</template>