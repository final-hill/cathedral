<script setup lang="ts">
import { ProjectStore } from '~/stores/ProjectStore'

const projectStore = ProjectStore()

const deleteProject = (id: string) => {
    if (confirm(`Are you sure you want to delete this project? id: ${id}`))
        projectStore.removeProject(id)
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
    <article class="project-card">
        <h2 class="title"><nuxt-link :to="`/projects/${id}`">{{ name }}</nuxt-link></h2>
        <p>{{ description }}</p>
        <button v-if="id !== 'new-project'" @click="deleteProject(id)" title="Delete project">
            <PhosphorIconTrashSimple size="25" />
        </button>
    </article>
</template>

<style scoped>
.project-card {
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
