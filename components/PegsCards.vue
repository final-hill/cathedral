<script setup lang="ts">
import { PEGS } from '~/domain/PEGS'
import { Repository } from '~/usecases/Repository';

const props = defineProps({
    repo: {
        type: Object,
        required: true
    }
})

const repo = props.repo as Repository<PEGS>,
    items = ref(await repo.getAll())

const deleteItem = async (id: string) => {
    if (confirm(`Are you sure you want to delete this entry? id: ${id}`))
        repo.delete(id)
    items.value = await repo.getAll()
}
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
        <PegsCard id="new-item" name="New Entry" description="Create a new entry" />
        <PegsCard v-for="item of items" :key="item.id" :id="item.id" :name="item.name" :description="item.description"
            @delete="deleteItem" />
    </section>
</template>