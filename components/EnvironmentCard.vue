<script setup lang="ts">
import { EnvironmentStore } from '~/stores/EnvironmentStore'

const environmentStore = EnvironmentStore()

const deleteEnvironment = (id: string) => {
    if (confirm(`Are you sure you want to delete this environment? id: ${id}`))
        environmentStore.remove(id)
}

defineProps({
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
    }
})
</script>

<template>
    <article class="environment-card">
        <h2 class="title"><nuxt-link :to="`/environments/${id}`">{{ name }}</nuxt-link></h2>
        <p>{{ description }}</p>
        <button v-if="id !== 'new-environment'" @click="deleteEnvironment(id)" title="Delete environment">
            <PhosphorIconTrashSimple size="25" />
        </button>
    </article>
</template>

<style scoped>
.environment-card {
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
