<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    store: {
        type: Object,
        required: true
    }
})

const deleteItem = (id: string) => {
    if (confirm(`Are you sure you want to delete this entry? id: ${id}`))
        props.store.remove(id)
}

const route = useRoute()
</script>

<template>
    <article class="pegs-card">
        <h2 class="title"><nuxt-link :to="`${$route.path}/${id}`">{{ name }}</nuxt-link></h2>
        <p>{{ description }}</p>
        <button v-if="id !== 'new-item'" @click="deleteItem(id)" title="Delete item">
            <PhosphorIconTrashSimple size="25" />
        </button>
    </article>
</template>

<style scoped>
.pegs-card {
    background-color: var(--site-dark-bg);
    box-shadow: 4px 5px 5px 0px var(--shadow-color);
    padding: 1em;
}

.title {
    margin-top: 0;
}

button {
    align-self: center;
    color: var(--btn-danger-color);
    height: fit-content;
    padding: 0.5em;
    width: fit-content;
}
</style>
